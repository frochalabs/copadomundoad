const { Pool } = require('pg');
require('dotenv').config();

// Define se vai usar a URL do Render (produção) ou as variáveis separadas (local)
const poolConfig = process.env.DATABASE_URL
  ? {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      // O SSL é obrigatório no Render para conexões com o banco
      rejectUnauthorized: false,
    },
  }
  : {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
  };

// Instancia o Pool com a configuração correta e os limites de timeout
const pool = new Pool({
  ...poolConfig,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000, // Aumentado para 15 segundos devido à latência do Render Free
});

module.exports = pool;