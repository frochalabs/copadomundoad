const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    await client.connect();
    
    const { rows: jogos } = await client.query("SELECT id FROM jogos WHERE fase != 'grupos'");
    const username = 'fabiano.sales';
    const email = 'fabiano.sales@mock.com';

    let inseridos = 0;
    for (const jogo of jogos) {
      const palpite_a = Math.floor(Math.random() * 4);
      const palpite_b = Math.floor(Math.random() * 4);
      
      const query = `
        INSERT INTO palpites (username, email, jogo_id, palpite_a, palpite_b, processado, pontos_ganhos)
        VALUES ($1, $2, $3, $4, $5, false, 0)
        ON CONFLICT (username, jogo_id) 
        DO UPDATE SET palpite_a = $4, palpite_b = $5
      `;
      
      await client.query(query, [username, email, jogo.id, palpite_a, palpite_b]);
      inseridos++;
    }
    console.log(`✅ ${inseridos} palpites criados.`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
