const pool = require('./src/config/db');

async function run() {
  const { rows: palpites } = await pool.query("SELECT * FROM palpites WHERE username='fabiano.sales'");
  console.log('Palpites:', palpites);
  
  const { rows: jogos } = await pool.query("SELECT * FROM jogos");
  console.log('Jogos:', jogos);
  
  process.exit(0);
}

run();
