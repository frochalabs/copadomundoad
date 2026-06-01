const pool = require('./src/config/db');

async function run() {
  const [palpites] = await pool.query("SELECT * FROM palpites WHERE username='fabiano.sales'");
  console.log('Palpites:', palpites);
  
  const [jogos] = await pool.query("SELECT * FROM jogos");
  console.log('Jogos:', jogos);
  
  process.exit(0);
}

run();
