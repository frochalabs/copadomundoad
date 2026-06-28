const { Client } = require('pg');
require('dotenv').config();

const mapaTimes = require('./src/utils/mapaTimes');

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : { host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, port: process.env.DB_PORT || 5432 };

const client = new Client(poolConfig);

async function run() {
  try {
    await client.connect();
    
    // Add columns
    console.log("Adicionando colunas bandeira_a e bandeira_b...");
    await client.query('ALTER TABLE jogos ADD COLUMN IF NOT EXISTS bandeira_a VARCHAR;');
    await client.query('ALTER TABLE jogos ADD COLUMN IF NOT EXISTS bandeira_b VARCHAR;');
    
    console.log("Buscando times da API...");
    const res = await fetch('https://api.football-data.org/v4/competitions/WC/teams', {
      headers: { 'X-Auth-Token': process.env.API_KEY || '' }
    });
    
    if (!res.ok) throw new Error("Erro ao buscar times");
    const data = await res.json();
    const teams = data.teams || [];
    
    const crests = {};
    for (const team of teams) {
      if (team.tla && mapaTimes[team.tla]) {
        crests[mapaTimes[team.tla]] = team.crest;
      }
    }
    
    console.log("Atualizando jogos no banco de dados...");
    const { rows: jogos } = await client.query('SELECT id, time_a, time_b FROM jogos;');
    
    let atualizados = 0;
    for (const jogo of jogos) {
      const bandeira_a = crests[jogo.time_a] || 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Missing_flag.svg/1024px-Missing_flag.svg.png';
      const bandeira_b = crests[jogo.time_b] || 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Missing_flag.svg/1024px-Missing_flag.svg.png';
      
      await client.query(
        'UPDATE jogos SET bandeira_a = $1, bandeira_b = $2 WHERE id = $3',
        [bandeira_a, bandeira_b, jogo.id]
      );
      atualizados++;
    }
    
    console.log(`✅ ${atualizados} jogos atualizados com as bandeiras.`);
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
