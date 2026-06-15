const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const initDatabase = require('./config/init-db');
const { iniciarWorker } = require('./services/matchWorker');

const app = express();
app.use(cors());
app.use(express.json());

// Inicializa as tabelas antes de abrir o servidor
initDatabase();

// Inicia o motor de polling (Cron Job)
iniciarWorker();

// Endpoint para cadastrar ou atualizar múltiplos jogos (carga inicial da API)
app.post('/api/jogos/seed', async (req, res) => {
  const { jogos } = req.body; // Array de objetos contendo os dados dos jogos

  if (!Array.isArray(jogos) || jogos.length === 0) {
    return res.status(400).json({ error: 'Formato de dados inválido ou lista vazia.' });
  }

  const query = `
    INSERT INTO jogos (id, time_a, time_b, data_jogo, status) 
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id) DO UPDATE SET 
      time_a = EXCLUDED.time_a, 
      time_b = EXCLUDED.time_b, 
      data_jogo = EXCLUDED.data_jogo,
      status = EXCLUDED.status
  `;

  try {
    for (const jogo of jogos) {
      await pool.query(query, [
        jogo.id, // ID Oficial da API de Futebol
        jogo.time_a,
        jogo.time_b,
        jogo.data_jogo, // Formato YYYY-MM-DD HH:MM:SS
        jogo.status || 'SCHEDULED'
      ]);
    }
    res.status(200).json({ message: `${jogos.length} jogos cadastrados/atualizados com sucesso.` });
  } catch (error) {
    console.error('Erro ao realizar o seed dos jogos:', error);
    res.status(500).json({ error: 'Erro interno ao salvar os jogos.' });
  }
});

// Endpoint para receber os palpites consolidados do n8n
app.post('/api/palpites', async (req, res) => {
  const { email, palpites } = req.body;

  if (!email || !Array.isArray(palpites)) {
    return res.status(400).json({ error: 'Dados incompletos.' });
  }

  const username = email.split('@')[0].toLowerCase();
  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const emailsPermitidos = [];
    const temPermissao = emailsPermitidos.includes(email.toLowerCase());
    const agora = new Date();

    // 1. Busca todos os jogos enviados para validar o horário individualmente
    const jogoIds = palpites.map(p => p.jogoId);

    if (jogoIds.length > 0) {
      const { rows: jogosInfo } = await client.query('SELECT id, data_jogo FROM jogos WHERE id = ANY($1::int[])', [jogoIds]);
      const mapDatas = {};
      jogosInfo.forEach(j => {
        mapDatas[j.id] = new Date(j.data_jogo);
      });

      // 2. Insere ou atualiza apenas os palpites permitidos
      const upsertQuery = `
        INSERT INTO palpites (email, username, jogo_id, palpite_a, palpite_b)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (username, jogo_id) 
        DO UPDATE SET 
          email = EXCLUDED.email,
          palpite_a = EXCLUDED.palpite_a, 
          palpite_b = EXCLUDED.palpite_b
      `;

      let palpitesProcessados = 0;

      for (const p of palpites) {
        const dataDoJogo = mapDatas[p.jogoId];

        // Regra: Bloqueia se o jogo não existe, ou se já começou (e o usuário não é exceção)
        if (!dataDoJogo) continue;

        if (!temPermissao && agora >= dataDoJogo) {
          // Ignora o palpite para esse jogo específico porque o prazo já estourou
          continue;
        }

        await client.query(upsertQuery, [email, username, p.jogoId, p.palpiteA, p.palpiteB]);
        palpitesProcessados++;
      }

      // Se nenhum palpite pôde ser processado (todos atrasados) e o usuário mandou palpites
      if (palpitesProcessados === 0 && palpites.length > 0) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Todos os jogos enviados já começaram. Prazo encerrado para estes palpites.' });
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ message: `Palpites de ${username} registrados com sucesso!` });

  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Erro no rollback:', rollbackError);
      }
    }
    console.error('Erro na rota /api/palpites:', error);
    res.status(500).json({ error: 'Erro ao salvar palpites.', detalhes: error.message });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Endpoint para buscar palpites de um usuário específico
app.get('/api/palpites/:username', async (req, res) => {
  const { username } = req.params;

  try {
    // Query para pegar os palpites
    const queryPalpites = `
      SELECT 
        p.jogo_id,
        j.time_a,
        j.time_b,
        p.palpite_a,
        p.palpite_b,
        p.pontos_ganhos,
        j.data_jogo
      FROM palpites p
      JOIN jogos j ON p.jogo_id = j.id
      WHERE p.username = $1
      ORDER BY j.data_jogo ASC;
    `;

    // Query para pegar a posição do usuário no ranking global
    const queryPosicao = `
      WITH Ranking AS (
        SELECT 
            username,
            COALESCE(SUM(pontos_ganhos), 0)::int as total_pontos,
            COUNT(*) FILTER (WHERE pontos_ganhos = 5)::int as cravadas,
            RANK() OVER (ORDER BY COALESCE(SUM(pontos_ganhos), 0) DESC, COUNT(*) FILTER (WHERE pontos_ganhos = 5) DESC, username ASC) as posicao
        FROM palpites
        WHERE processado = true
        GROUP BY username
      )
      SELECT posicao FROM Ranking WHERE username = $1;
    `;

    const { rows: resultados } = await pool.query(queryPalpites, [username.toLowerCase()]);
    const { rows: rankRows } = await pool.query(queryPosicao, [username.toLowerCase()]);

    if (resultados.length === 0) {
      return res.status(404).json({ message: 'Nenhum palpite encontrado para este usuário.' });
    }

    const posicao = rankRows.length > 0 ? parseInt(rankRows[0].posicao, 10) : null;

    res.status(200).json({ username, posicao, palpites: resultados });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar palpites.' });
  }
});

// Endpoint para estatísticas - Trending Games (jogos mais acirrados em votação)
app.get('/api/stats/trending-games', async (req, res) => {
  try {
    const query = `
      SELECT 
        j.id,
        j.time_a,
        j.time_b,
        j.data_jogo,
        COUNT(p.id)::int as total_palpites,
        COALESCE(SUM(CASE WHEN (p.palpite_a > p.palpite_b) THEN 1 ELSE 0 END), 0)::int as votos_time_a,
        COALESCE(SUM(CASE WHEN (p.palpite_a < p.palpite_b) THEN 1 ELSE 0 END), 0)::int as votos_time_b,
        COALESCE(SUM(CASE WHEN (p.palpite_a = p.palpite_b) THEN 1 ELSE 0 END), 0)::int as votos_empate
      FROM jogos j
      LEFT JOIN palpites p ON j.id = p.jogo_id
      WHERE j.status = 'SCHEDULED'
      GROUP BY j.id, j.time_a, j.time_b, j.data_jogo
      HAVING COUNT(p.id) > 0
      ORDER BY (ABS((COALESCE(SUM(CASE WHEN (p.palpite_a > p.palpite_b) THEN 1 ELSE 0 END), 0) - 
                     COALESCE(SUM(CASE WHEN (p.palpite_a < p.palpite_b) THEN 1 ELSE 0 END), 0)))) ASC,
               (ABS((COALESCE(SUM(CASE WHEN (p.palpite_a > p.palpite_b) THEN 1 ELSE 0 END), 0) - 
                     COALESCE(SUM(CASE WHEN (p.palpite_a = p.palpite_b) THEN 1 ELSE 0 END), 0)))) ASC
      LIMIT 5
    `;

    const { rows } = await pool.query(query);
    res.status(200).json({ trendingGames: rows });
  } catch (error) {
    console.error('Erro em trending-games:', error);
    res.status(500).json({ error: 'Erro ao buscar trending games.' });
  }
});

// Endpoint para estatísticas - Contrarian Bets (palpites zebra)
app.get('/api/stats/contrarian-bets', async (req, res) => {
  try {
    const query = `
      WITH results AS (
        SELECT 
          j.id as jogo_id,
          j.time_a,
          j.time_b,
          j.data_jogo,
          p.username,
          p.palpite_a,
          p.palpite_b,
          CONCAT(p.palpite_a, '-', p.palpite_b) as placar,
          CASE 
            WHEN p.palpite_a > p.palpite_b THEN 'time_a'
            WHEN p.palpite_a < p.palpite_b THEN 'time_b'
            ELSE 'empate'
          END as resultado_palpite
        FROM palpites p
        JOIN jogos j ON p.jogo_id = j.id
        WHERE j.status = 'SCHEDULED'
      ),
      result_votes AS (
        SELECT 
          jogo_id,
          time_a,
          time_b,
          data_jogo,
          resultado_palpite,
          COUNT(*) as votos,
          ROW_NUMBER() OVER (PARTITION BY jogo_id ORDER BY COUNT(*) DESC, resultado_palpite ASC) as rank
        FROM results
        GROUP BY jogo_id, time_a, time_b, data_jogo, resultado_palpite
      ),
      main_result AS (
        SELECT 
          jogo_id,
          time_a,
          time_b,
          data_jogo,
          resultado_palpite as main_resultado,
          votos as main_votos
        FROM result_votes
        WHERE rank = 1
      ),
      minority_results AS (
        SELECT 
          rv.jogo_id,
          rv.resultado_palpite,
          rv.votos as resultado_votos,
          mr.main_resultado,
          mr.main_votos
        FROM result_votes rv
        JOIN main_result mr ON rv.jogo_id = mr.jogo_id
        WHERE rv.resultado_palpite != mr.main_resultado
          AND rv.votos <= 3
        ORDER BY rv.votos ASC
      )
      SELECT 
        r.jogo_id,
        r.time_a,
        r.time_b,
        r.data_jogo,
        r.username,
        r.placar as placar_zebra,
        CASE 
          WHEN mr.main_resultado = 'time_a' THEN CONCAT(r.time_a, ' ganha')
          WHEN mr.main_resultado = 'time_b' THEN CONCAT(r.time_b, ' ganha')
          ELSE 'Empate'
        END as main_placar,
        CASE 
          WHEN r.resultado_palpite = 'time_a' THEN CONCAT(r.time_a, ' ganha')
          WHEN r.resultado_palpite = 'time_b' THEN CONCAT(r.time_b, ' ganha')
          ELSE 'Empate'
        END as resultado_zebra,
        mr.main_votos::int,
        mr.resultado_votos::int as placar_votos
      FROM results r
      JOIN minority_results mr ON r.jogo_id = mr.jogo_id AND r.resultado_palpite = mr.resultado_palpite
      WHERE r.resultado_palpite != mr.main_resultado
      ORDER BY mr.resultado_votos ASC, r.data_jogo ASC, RANDOM()
      LIMIT 8
    `;

    const { rows } = await pool.query(query);
    res.status(200).json({ contrarianBets: rows });
  } catch (error) {
    console.error('Erro em contrarian-bets:', error);
    res.status(500).json({ error: 'Erro ao buscar contrarian bets.' });
  }
});

// Endpoint de Ranking Completo
app.get('/api/ranking', async (req, res) => {
  try {
    const query = `
      WITH TodosOsPontos AS (
          SELECT 
              username,
              pontos_ganhos,
              (pontos_ganhos = 5) as is_cravada
          FROM palpites
          WHERE processado = true
          
          UNION ALL
          
          SELECT 
              username,
              pontos_ganhos,
              false as is_cravada
          FROM respostas_extras
          WHERE processada = true
      )
      SELECT 
          username,
          COALESCE(SUM(pontos_ganhos), 0)::int as total_pontos,
          COUNT(*) FILTER (WHERE is_cravada = true)::int as cravadas
      FROM TodosOsPontos
      GROUP BY username
      ORDER BY 
          total_pontos DESC,
          cravadas DESC,
          username ASC;
    `;
    const { rows } = await pool.query(query);

    // Formatar com posição
    const ranking = rows.map((r, i) => ({
      posicao: i + 1,
      username: r.username,
      total_pontos: r.total_pontos,
      cravadas: r.cravadas
    }));

    res.status(200).json({ ranking });
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ error: 'Erro interno ao carregar o ranking.' });
  }
});

// Endpoint para buscar todos os jogos
app.get('/api/jogos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM jogos ORDER BY data_jogo ASC, id ASC');
    res.status(200).json({ jogos: rows });
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    res.status(500).json({ error: 'Erro ao buscar jogos.' });
  }
});

// Endpoint para excluir um jogo (e seus palpites associados para não quebrar a Foreign Key)
app.delete('/api/jogos/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Exclui primeiro os palpites daquele jogo
    await client.query('DELETE FROM palpites WHERE jogo_id = $1', [id]);

    // Depois exclui o jogo
    const { rowCount } = await client.query('DELETE FROM jogos WHERE id = $1', [id]);

    if (rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Jogo não encontrado.' });
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Jogo e palpites associados excluídos com sucesso!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao excluir jogo:', error);
    res.status(500).json({ error: 'Erro ao excluir o jogo.' });
  } finally {
    client.release();
  }
});

// Endpoint de Administração: Sincronizar Jogos com a API Externa
// Isso irá adicionar o api_id e corrigir a data_jogo usando o utcDate oficial.
const { syncJogos } = require('./scripts/syncJogosApi');
app.post('/api/admin/sync-games', async (req, res) => {
  try {
    const atualizados = await syncJogos();
    res.status(200).json({ message: `Sincronização concluída! ${atualizados} jogos foram atualizados com o ID e data oficiais da API.` });
  } catch (error) {
    console.error('Erro na rota de sync:', error);
    res.status(500).json({ error: 'Falha ao sincronizar jogos com a API externa.' });
  }
});

// Endpoint para adicionar múltiplos jogos manualmente (em lote)
app.post('/api/jogos', async (req, res) => {
  const { jogos } = req.body;

  if (!Array.isArray(jogos) || jogos.length === 0) {
    return res.status(400).json({ error: 'Envie um array de jogos no formato { "jogos": [ ... ] }.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Como sua tabela não usa SERIAL, calculamos o próximo ID sequencial a partir do maior existente
    const { rows: maxIdRow } = await client.query('SELECT COALESCE(MAX(id), 1000) as max_id FROM jogos');
    let proximoId = parseInt(maxIdRow[0].max_id, 10) + 1;

    const inseridos = [];

    const query = `
      INSERT INTO jogos (id, api_id, time_a, time_b, data_jogo, status, gols_a, gols_b) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (api_id) DO NOTHING
      RETURNING *;
    `;

    for (const jogo of jogos) {
      const { api_id, time_a, time_b, data_jogo, status, gols_a, gols_b } = jogo;

      const { rows } = await client.query(query, [
        proximoId,
        api_id || null,
        time_a,
        time_b,
        data_jogo,
        status || 'SCHEDULED',
        gols_a !== undefined ? gols_a : null,
        gols_b !== undefined ? gols_b : null
      ]);

      // Só incrementa o proximoId e adiciona aos inseridos se ele realmente gravou no banco (não foi ignorado)
      if (rows.length > 0) {
        inseridos.push(rows[0]);
        proximoId++;
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ message: `${inseridos.length} jogos criados com sucesso!`, jogos: inseridos });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar jogos:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'Um dos jogos inseridos possui um api_id que já está cadastrado.' });
    } else {
      res.status(500).json({ error: 'Erro interno ao criar os jogos.' });
    }
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 3000;

// Endpoint para buscar perguntas extras ativas
app.get('/api/perguntas-ativas', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM perguntas_extras WHERE status = 'ABERTA' ORDER BY id ASC");
    res.status(200).json({ perguntas: rows });
  } catch (error) {
    console.error('Erro ao buscar perguntas ativas:', error);
    res.status(500).json({ error: 'Erro ao buscar perguntas ativas.' });
  }
});

// Endpoint para enviar um palpite de pergunta extra
app.post('/api/palpites-extras', async (req, res) => {
  const { email, pergunta_id, resposta } = req.body;

  if (!email || !pergunta_id || !resposta) {
    return res.status(400).json({ error: 'Dados incompletos. Envie email, pergunta_id e resposta.' });
  }

  const username = email.split('@')[0].toLowerCase();

  try {
    // Verifica se a pergunta ainda está aberta
    const { rows: pergunta } = await pool.query('SELECT status FROM perguntas_extras WHERE id = $1', [pergunta_id]);
    if (pergunta.length === 0 || pergunta[0].status !== 'ABERTA') {
      return res.status(403).json({ error: 'Esta pergunta não está mais aceitando respostas.' });
    }

    const query = `
      INSERT INTO respostas_extras (pergunta_id, username, resposta_escolhida)
      VALUES ($1, $2, $3)
      ON CONFLICT (username, pergunta_id) 
      DO UPDATE SET resposta_escolhida = EXCLUDED.resposta_escolhida
    `;
    await pool.query(query, [pergunta_id, username, resposta]);
    
    res.status(200).json({ message: 'Resposta salva com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar palpite extra:', error);
    res.status(500).json({ error: 'Erro ao salvar sua resposta.' });
  }
});

// Endpoint de Administração: Criar uma nova pergunta especial
app.post('/api/admin/criar-pergunta', async (req, res) => {
  const { descricao, opcoes, pontos_valendo, jogo_id } = req.body;

  if (!descricao || !opcoes || !Array.isArray(opcoes)) {
    return res.status(400).json({ error: 'Envie a descricao e um array de opcoes.' });
  }

  try {
    const query = `
      INSERT INTO perguntas_extras (descricao, opcoes, pontos_valendo, jogo_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [
      descricao, 
      JSON.stringify(opcoes), 
      pontos_valendo || 2, 
      jogo_id || null
    ]);

    res.status(201).json({ message: 'Pergunta criada com sucesso!', pergunta: rows[0] });
  } catch (error) {
    console.error('Erro ao criar pergunta extra:', error);
    res.status(500).json({ error: 'Erro interno ao criar pergunta.' });
  }
});

// Endpoint de Administração: Resolver Pergunta Especial Manualmente
app.post('/api/admin/resolver-pergunta', async (req, res) => {
  const { pergunta_id, resposta_correta } = req.body;

  if (!pergunta_id || !resposta_correta) {
    return res.status(400).json({ error: 'Envie o pergunta_id e a resposta_correta.' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Atualiza a tabela da pergunta dizendo qual foi o resultado oficial
    const queryPergunta = `
      UPDATE perguntas_extras 
      SET resposta_correta = $1, status = 'PROCESSADA'
      WHERE id = $2 AND status != 'PROCESSADA'
      RETURNING pontos_valendo;
    `;
    const { rows: resultPergunta } = await client.query(queryPergunta, [resposta_correta, pergunta_id]);

    if (resultPergunta.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pergunta não encontrada ou já processada.' });
    }

    const pontosDaPergunta = resultPergunta[0].pontos_valendo;

    // 2. Dá os pontos para quem ACERTOU
    const queryAcertos = `
      UPDATE respostas_extras 
      SET pontos_ganhos = $1, processada = true
      WHERE pergunta_id = $2 AND resposta_escolhida = $3;
    `;
    const { rowCount: acertos } = await client.query(queryAcertos, [pontosDaPergunta, pergunta_id, resposta_correta]);

    // 3. Zera os pontos de quem ERROU
    const queryErros = `
      UPDATE respostas_extras 
      SET pontos_ganhos = 0, processada = true
      WHERE pergunta_id = $1 AND resposta_escolhida != $2;
    `;
    const { rowCount: erros } = await client.query(queryErros, [pergunta_id, resposta_correta]);

    await client.query('COMMIT');
    
    res.status(200).json({ 
      message: 'Pergunta resolvida com sucesso!',
      estatisticas: {
        acertos: acertos,
        erros: erros,
        pontos_distribuidos: acertos * pontosDaPergunta
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao resolver pergunta especial:', error);
    res.status(500).json({ error: 'Erro interno ao processar pontuação da pergunta.' });
  } finally {
    client.release();
  }
});
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
