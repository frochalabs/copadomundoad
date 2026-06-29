const pool = require('../config/db');

async function fixScore() {
  const jogoId = 1037;
  const golsA = 4;
  const golsB = 0;
  
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log(`Corrigindo jogo ${jogoId} para ${golsA}x${golsB}...`);

    // 1. Atualizar placar
    await client.query(
      'UPDATE jogos SET gols_a = $1, gols_b = $2, status = $3 WHERE id = $4',
      [golsA, golsB, 'FINISHED', jogoId]
    );

    // 2. Buscar palpites (ignorando se já foi processado ou não, pois queremos reprocessar)
    const { rows: palpites } = await client.query(
      'SELECT id, palpite_a, palpite_b FROM palpites WHERE jogo_id = $1',
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

      // Atualizar a pontuação e garantir que marque como processado
      await client.query(
        'UPDATE palpites SET pontos_ganhos = $1, processado = true WHERE id = $2',
        [pontos, p.id]
      );
    }

    await client.query('COMMIT');
    console.log(`Sucesso! Jogo ${jogoId} finalizado (${golsA}x${golsB}). Palpites reprocessados (${acertosExatos} exatos, ${acertosVencedor} vencedores, de um total de ${palpites.length} palpites).`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Erro ao processar jogo ${jogoId}:`, err);
  } finally {
    client.release();
    pool.end();
  }
}

fixScore();
