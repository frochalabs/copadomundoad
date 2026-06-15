const pool = require('./db');

async function initDatabase() {
  try {
    // Tabela de Jogos (ID vindo da API externa)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jogos (
        id INT PRIMARY KEY,
        time_a VARCHAR(100) NOT NULL,
        time_b VARCHAR(100) NOT NULL,
        gols_a INT DEFAULT NULL,
        gols_b INT DEFAULT NULL,
        data_jogo TIMESTAMPTZ NOT NULL,
        status VARCHAR(50) DEFAULT 'SCHEDULED'
      );
    `);

    // Garante que a coluna de relacionamento com a API exista, mesmo se a tabela já foi criada antes
    await pool.query(`
      ALTER TABLE jogos ADD COLUMN IF NOT EXISTS api_id INTEGER UNIQUE;
    `);

    // Garante que bancos de dados legados convertam a coluna de data para TIMESTAMPTZ (UTC)
    await pool.query(`
      ALTER TABLE jogos ALTER COLUMN data_jogo TYPE TIMESTAMPTZ USING data_jogo AT TIME ZONE 'UTC';
    `);

    // Tabela de Palpites
    await pool.query(`
      CREATE TABLE IF NOT EXISTS palpites (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        username VARCHAR(100) NOT NULL,
        jogo_id INT NOT NULL,
        palpite_a INT NOT NULL,
        palpite_b INT NOT NULL,
        pontos_ganhos INT DEFAULT 0,
        processado BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (jogo_id) REFERENCES jogos(id),
        UNIQUE (username, jogo_id)
      );
    `);

    // Migração de Segurança: Se a tabela antiga permitiu duplicidades por email, nós limpamos
    await pool.query(`
      DELETE FROM palpites
      WHERE id NOT IN (
          SELECT MAX(id)
          FROM palpites
          GROUP BY username, jogo_id
      );
    `);

    // Remove a constraint antiga (baseada em email) e força a nova (baseada em username)
    try {
      await pool.query(`ALTER TABLE palpites DROP CONSTRAINT IF EXISTS palpites_email_jogo_id_key;`);
      await pool.query(`ALTER TABLE palpites ADD CONSTRAINT palpites_username_jogo_id_key UNIQUE (username, jogo_id);`);
    } catch (e) {
      // Se a constraint nova já existir, segue a vida
    }

    // Tabela de Perguntas Extras (Palpites Bônus)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS perguntas_extras (
        id SERIAL PRIMARY KEY,
        jogo_id INT,
        descricao TEXT NOT NULL,
        opcoes JSONB NOT NULL,
        pontos_valendo INT DEFAULT 2,
        resposta_correta TEXT,
        status VARCHAR(50) DEFAULT 'ABERTA',
        FOREIGN KEY (jogo_id) REFERENCES jogos(id) ON DELETE CASCADE
      );
    `);

    // Tabela de Respostas Extras
    await pool.query(`
      CREATE TABLE IF NOT EXISTS respostas_extras (
        id SERIAL PRIMARY KEY,
        pergunta_id INT NOT NULL,
        username VARCHAR(100) NOT NULL,
        resposta_escolhida TEXT NOT NULL,
        pontos_ganhos INT DEFAULT 0,
        processada BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (pergunta_id) REFERENCES perguntas_extras(id) ON DELETE CASCADE,
        UNIQUE (username, pergunta_id)
      );
    `);

    console.log('Tabelas verificadas/criadas com sucesso no PostgreSQL.');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    process.exit(1);
  }
}

module.exports = initDatabase;
