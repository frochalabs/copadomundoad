const cron = require('node-cron');
const pool = require('../config/db');

// Para testar o cálculo de um jogo específico, defina o ID local dele aqui (ex: 1001).
// Quando for subir para produção, deixe como null.
const SIMULAR_JOGO_ID = null;

const iniciarWorker = () => {
  // Roda a cada 10 segundos no modo simulação, senão a cada 5 minutos
  const cronTime = SIMULAR_JOGO_ID ? '*/10 * * * * *' : '*/5 * * * *';

  console.log(`[Worker] Inicializado. Simulação ativada para o jogo: ${SIMULAR_JOGO_ID || 'Nenhum (Produção)'}`);

  cron.schedule(cronTime, async () => {
    // console.log('[Worker] Verificando jogos pendentes...');
    const client = await pool.connect();

    try {
      // Se estivermos simulando, ignora as regras de data
      const queryJogos = `
        SELECT id, api_id, time_a, time_b 
        FROM jogos 
        WHERE status != 'FINISHED' AND api_id IS NOT NULL
        ${SIMULAR_JOGO_ID ? '' : "AND data_jogo <= NOW() - INTERVAL '110 minutes' AND data_jogo >= NOW() - INTERVAL '5 hours'"}
      `;

      const { rows: jogosPendentes } = await client.query(queryJogos);

      if (jogosPendentes.length === 0) return;

      for (const jogo of jogosPendentes) {
        let apiData;

        if (SIMULAR_JOGO_ID && jogo.id === SIMULAR_JOGO_ID) {
          console.log(`[Worker] Mockando resultado para: ${jogo.time_a} x ${jogo.time_b}`);
          // Placar fixo para facilitar seu teste: 3x0 para o time da casa
          apiData = {
            status: 'FINISHED',
            score: { fullTime: { home: 3, away: 0 } }
          };
        } else if (!SIMULAR_JOGO_ID) {
          // Buscando os dados oficiais da API football-data.org (só roda se NÃO estivermos simulando um jogo manualmente)
          try {
            console.log(`[Worker] Consultando API externa para o jogo da API ID ${jogo.api_id} (Local: ${jogo.time_a} x ${jogo.time_b})`);
            const res = await fetch(`https://api.football-data.org/v4/matches${jogo.api_id}`, {
              headers: { 'X-Auth-Token': process.env.API_KEY || '' }
            });
            apiData = await res.json();
          } catch (err) {
            console.error(`[Worker] Falha ao consultar a API para o jogo ${jogo.id}:`, err);
          }
        }

        if (apiData && apiData.status === 'FINISHED') {
          const golsA = apiData.score.fullTime.home;
          const golsB = apiData.score.fullTime.away;

          await processarJogo(client, jogo.id, golsA, golsB);
        }
      }
    } catch (error) {
      console.error('[Worker] Erro ao buscar jogos:', error);
    } finally {
      client.release();
    }
  });
};

const processarJogo = async (client, jogoId, golsA, golsB) => {
  try {
    await client.query('BEGIN');

    // 1. Atualizar placar e status na tabela de jogos
    await client.query(
      'UPDATE jogos SET gols_a = $1, gols_b = $2, status = $3 WHERE id = $4',
      [golsA, golsB, 'FINISHED', jogoId]
    );

    // 2. Buscar palpites não processados para este jogo
    const { rows: palpites } = await client.query(
      'SELECT id, palpite_a, palpite_b FROM palpites WHERE jogo_id = $1 AND processado = false',
      [jogoId]
    );

    let acertosExatos = 0;
    let acertosVencedor = 0;

    for (const p of palpites) {
      let pontos = 0;

      // Regra 1: Placar Exato (5 pontos)
      if (p.palpite_a === golsA && p.palpite_b === golsB) {
        pontos = 5;
        acertosExatos++;
      }
      // Regra 2: Acertou o Vencedor ou Empate (3 pontos)
      else {
        const palpiteVencedor = p.palpite_a > p.palpite_b ? 'A' : (p.palpite_a < p.palpite_b ? 'B' : 'E');
        const resultadoReal = golsA > golsB ? 'A' : (golsA < golsB ? 'B' : 'E');

        if (palpiteVencedor === resultadoReal) {
          pontos = 3;
          acertosVencedor++;
        }
      }

      // Atualizar a pontuação e marcar como processado
      await client.query(
        'UPDATE palpites SET pontos_ganhos = $1, processado = true WHERE id = $2',
        [pontos, p.id]
      );
    }

    await client.query('COMMIT');
    console.log(`[Worker] Jogo ${jogoId} finalizado (${golsA}x${golsB}). Palpites processados (${acertosExatos} exatos, ${acertosVencedor} vencedores).`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`[Worker] Erro ao processar jogo ${jogoId}:`, err);
  }
};

module.exports = { iniciarWorker };
