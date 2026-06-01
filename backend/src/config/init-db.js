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
        data_jogo TIMESTAMP NOT NULL,
        status VARCHAR(50) DEFAULT 'SCHEDULED'
      );
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
        UNIQUE (email, jogo_id)
      );
    `);

    console.log('Tabelas verificadas/criadas com sucesso no PostgreSQL.');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    process.exit(1);
  }
}

module.exports = initDatabase;
