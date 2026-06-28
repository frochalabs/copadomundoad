const pool = require('./src/config/db.js');

async function test() {
  try {
    const { rows: userBets } = await pool.query("SELECT * FROM palpites WHERE username = 'marcelo.vieira'");
    console.log("Marcelo Vieira Bets:", userBets);
    
    const { rows: games } = await pool.query("SELECT id, time_a, time_b, data_jogo, status FROM jogos ORDER BY data_jogo ASC LIMIT 5");
    console.log("First 5 Games:", games);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

test();
