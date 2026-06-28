const pool = require('../config/db');
const mapaTimes = require('../utils/mapaTimes');

async function syncJogos() {
  const client = await pool.connect();

  try {
    console.log("1. Adicionando coluna api_id no banco...");
    await client.query('ALTER TABLE jogos ADD COLUMN IF NOT EXISTS api_id INTEGER UNIQUE;');

    console.log("2. Buscando todos os jogos da Copa na API externa...");
    // A rota /v4/competitions/WC/matches traz os jogos do World Cup (Copa do Mundo)
    const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
      headers: { 'X-Auth-Token': process.env.API_KEY || '' }
    });

    if (!res.ok) {
      throw new Error(`Erro na API externa: ${res.status} - ${res.statusText}`);
    }

    const data = await res.json();
    const jogosDaApi = data.matches || [];

    console.log(`Foram encontrados ${jogosDaApi.length} jogos na API.`);

    let atualizados = 0;

    console.log("3. Fazendo o vínculo (De-Para)...");
    for (const jogoApi of jogosDaApi) {
      if (!jogoApi.homeTeam?.tla || !jogoApi.awayTeam?.tla) continue;

      // Pega a sigla (TLA) que vem da API
      const tlaCasa = jogoApi.homeTeam.tla;
      const tlaFora = jogoApi.awayTeam.tla;

      // Traduz para o nome em português do seu banco
      const nomePtCasa = mapaTimes[tlaCasa];
      const nomePtFora = mapaTimes[tlaFora];

      if (!nomePtCasa || !nomePtFora) {
        // Se esquecemos de colocar algum time no dicionário, ele avisa
        console.log(`[Aviso] Faltou traduzir os times: ${tlaCasa} ou ${tlaFora}`);
        continue;
      }

      // Procura no seu banco um jogo com esses dois times para salvar o api_id e a data_jogo nele
      // Usamos OR para garantir que mesmo se os times estiverem invertidos (comum no mata-mata) ele ache o jogo
      const query = `
        UPDATE jogos 
        SET api_id = $1, data_jogo = $4
        WHERE (time_a = $2 AND time_b = $3) OR (time_a = $3 AND time_b = $2)
        RETURNING id;
      `;
      
      const { rowCount } = await client.query(query, [jogoApi.id, nomePtCasa, nomePtFora, jogoApi.utcDate]);
      
      if (rowCount > 0) {
        atualizados++;
        console.log(`Vínculo criado: ${nomePtCasa} x ${nomePtFora} -> api_id = ${jogoApi.id} | data = ${jogoApi.utcDate}`);
      }
    }

    console.log(`\n✅ Sincronização concluída! ${atualizados} jogos vinculados no banco de dados.`);
    return atualizados;
  } catch (err) {
    console.error("❌ Erro na sincronização:", err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { syncJogos };
