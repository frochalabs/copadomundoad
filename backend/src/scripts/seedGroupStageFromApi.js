require('dotenv').config({ path: '../../.env' });

// Dicionário De-Para (Sigla TLA da API -> Nome no seu Banco em PT-BR)
const mapaTimes = {
  "MEX": "México",
  "RSA": "África do Sul",
  "KOR": "Coreia do Sul",
  "CZE": "Tchéquia",
  "CAN": "Canadá",
  "BIH": "Bósnia e Herzegovina",
  "USA": "Estados Unidos",
  "PAR": "Paraguai",
  "QAT": "Catar",
  "SUI": "Suíça",
  "BRA": "Brasil",
  "MAR": "Marrocos",
  "HAI": "Haiti",
  "SCO": "Escócia",
  "AUS": "Austrália",
  "TUR": "Turquia",
  "GER": "Alemanha",
  "CUW": "Curaçao",
  "NED": "Holanda",
  "JPN": "Japão",
  "CIV": "Costa do Marfim",
  "ECU": "Equador",
  "SWE": "Suécia",
  "TUN": "Tunísia",
  "ESP": "Espanha",
  "CPV": "Cabo Verde",
  "BEL": "Bélgica",
  "EGY": "Egito",
  "KSA": "Arábia Saudita",
  "URY": "Uruguai",
  "IRN": "Irã",
  "NZL": "Nova Zelândia",
  "FRA": "França",
  "SEN": "Senegal",
  "IRQ": "Iraque",
  "NOR": "Noruega",
  "ARG": "Argentina",
  "ALG": "Argélia",
  "AUT": "Áustria",
  "JOR": "Jordânia",
  "POR": "Portugal",
  "COD": "RD Congo",
  "ENG": "Inglaterra",
  "CRO": "Croácia",
  "GHA": "Gana",
  "PAN": "Panamá",
  "UZB": "Uzbequistão",
  "COL": "Colômbia"
};

async function seedGroupStage() {
  try {
    console.log("1. Buscando jogos da fase de grupos na API da FIFA...");

    // O parâmetro stage=GROUP_STAGE filtra apenas a fase de grupos
    const res = await fetch('https://api.football-data.org//v4/competitions/WC/matches?stage=GROUP_STAGE', {
      headers: { 'X-Auth-Token': process.env.API_KEY || '' }
    });

    if (!res.ok) {
      throw new Error(`Erro na API externa: ${res.status} - ${res.statusText}`);
    }

    const data = await res.json();
    const jogosDaApi = data.matches || [];

    console.log(`Foram encontrados ${jogosDaApi.length} jogos da fase de grupos.`);

    const jogosParaInserir = [];

    // Formatando os dados da API para o formato que a nossa API local aceita
    for (const jogo of jogosDaApi) {
      if (!jogo.homeTeam?.tla || !jogo.awayTeam?.tla) continue;

      const nomePtCasa = mapaTimes[jogo.homeTeam.tla];
      const nomePtFora = mapaTimes[jogo.awayTeam.tla];

      if (!nomePtCasa || !nomePtFora) {
        console.log(`[Aviso] Pulando jogo ID ${jogo.id} pois falta a tradução para as siglas: ${jogo.homeTeam.tla} ou ${jogo.awayTeam.tla}`);
        continue;
      }

      jogosParaInserir.push({
        api_id: jogo.id,
        time_a: nomePtCasa,
        time_b: nomePtFora,
        data_jogo: jogo.utcDate,
        status: jogo.status || 'SCHEDULED',
        gols_a: jogo.score?.fullTime?.home ?? null,
        gols_b: jogo.score?.fullTime?.away ?? null
      });
    }

    if (jogosParaInserir.length === 0) {
      console.log("Nenhum jogo válido encontrado para inserir (verifique as traduções).");
      return;
    }

    console.log(`2. Disparando POST para adicionar ${jogosParaInserir.length} jogos no nosso banco local...`);

    const localRes = await fetch('https://copadomundoad.onrender.com/api/jogos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jogos: jogosParaInserir })
    });

    const localData = await localRes.json();

    if (localRes.ok) {
      console.log('✅ Sucesso absoluto:', localData.message);
    } else {
      console.error('❌ Erro retornado pela nossa API:', localData.error);
    }

  } catch (error) {
    console.error("❌ Erro fatal no script:", error);
  }
}

seedGroupStage();
