const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const initDatabase = require('./config/init-db');

const app = express();
app.use(cors());
app.use(express.json());

// Inicializa as tabelas antes de abrir o servidor
initDatabase();

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
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Busca a data do primeiro jogo para validação de prazo
    const { rows: firstGame } = await client.query('SELECT data_jogo FROM jogos ORDER BY data_jogo ASC LIMIT 1');
    
    if (firstGame.length > 0) {
      const dataPrimeiroJogo = new Date(firstGame[0].data_jogo);
      const hoje = new Date();
      
      // Zera as horas para comparar apenas a data (dia/mês/ano)
      hoje.setHours(0, 0, 0, 0);
      dataPrimeiroJogo.setHours(0, 0, 0, 0);
      
      if (hoje > dataPrimeiroJogo) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'O prazo para alterar os palpites encerrou. As alterações só eram permitidas até o dia do primeiro jogo.' });
      }
    }

    // 2. Insere ou atualiza os palpites (Sobrescrevendo os antigos caso já existam)
    const upsertQuery = `
      INSERT INTO palpites (email, username, jogo_id, palpite_a, palpite_b)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email, jogo_id) 
      DO UPDATE SET 
        palpite_a = EXCLUDED.palpite_a, 
        palpite_b = EXCLUDED.palpite_b
    `;

    for (const p of palpites) {
      await client.query(upsertQuery, [email, username, p.jogoId, p.palpiteA, p.palpiteB]);
    }

    await client.query('COMMIT');
    res.status(200).json({ message: `Palpites de ${username} registrados com sucesso!` });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar palpites.' });
  } finally {
    client.release();
  }
});

// Endpoint para buscar palpites de um usuário específico
app.get('/api/palpites/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const query = `
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

    const { rows: resultados } = await pool.query(query, [username.toLowerCase()]);

    if (resultados.length === 0) {
      return res.status(404).json({ message: 'Nenhum palpite encontrado para este usuário.' });
    }

    res.status(200).json({ username, palpites: resultados });
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
          RANK() OVER (PARTITION BY jogo_id ORDER BY COUNT(*) DESC) as rank
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
