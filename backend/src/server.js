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
  const { email, palpites } = req.body; // palpites = [{ jogoId: 1006, palpiteA: 2, palpiteB: 1 }, ...]

  if (!email || !Array.isArray(palpites)) {
    return res.status(400).json({ error: 'Dados incompletos.' });
  }

  // Extrai o nome antes do @ para usar como rota no frontend (/username)
  const username = email.split('@')[0].toLowerCase();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query = `
      INSERT INTO palpites (email, username, jogo_id, palpite_a, palpite_b)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email, jogo_id) DO UPDATE SET 
        palpite_a = EXCLUDED.palpite_a,
        palpite_b = EXCLUDED.palpite_b;
    `;

    for (const p of palpites) {
      await client.query(query, [email, username, p.jogoId, p.palpiteA, p.palpiteB]);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
