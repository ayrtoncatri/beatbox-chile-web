// prisma/scripts/backfill-battle-votes.cts
// Usamos sintaxis CommonJS (require) debido al formato .cts
const { PrismaClient, ScoreStatus } = require('@prisma/client');

// Asegúrate de que PrismaClient se inicialice
const prisma = new PrismaClient();

/**
 * Este script rellena los votos (winnerVotes, loserVotes) de batallas
 * que ya finalizaron pero que se registraron antes de
 * implementar la lógica de votación (Fase 1 del bracket).
 */
async function main() {
  console.log('Iniciando script de backfill para votos de batallas...');

  // 1. Encontramos todas las batallas que YA tienen un ganador,
  //    pero que aún no tienen el registro de votos (están en 0).
  const battlesToUpdate = await prisma.battle.findMany({
    where: {
      winnerId: { not: null }, // Ya tiene ganador
      participantBId: { not: null }, // Asegurarnos que es una batalla completa (no un bye)
      // Y que los votos están en su estado por defecto (0)
      AND: [
        { winnerVotes: 0 },
        { loserVotes: 0 },
      ],
    },
    select: {
      id: true,
      participantAId: true,
      participantBId: true,
      winnerId: true,
    },
  });

  if (battlesToUpdate.length === 0) {
    console.log('✅ No hay batallas que necesiten actualización. Todos los datos históricos están en orden.');
    return;
  }

  console.log(`ℹ️ Se encontraron ${battlesToUpdate.length} batallas para actualizar.`);

  const updatePromises = [];
  let updatedCount = 0;

  // 2. Iteramos sobre cada batalla y recalculamos los votos
  for (const battle of battlesToUpdate) {
    // 3. Obtenemos los puntajes de CADA JUEZ (R1+R2)
    const judgeScores = await prisma.score.groupBy({
      by: ['judgeId', 'participantId'],
      where: {
        battleId: battle.id,
        status: ScoreStatus.SUBMITTED, // Solo puntajes finales
      },
      _sum: {
        totalScore: true, // Suma R1 + R2 para ese juez/participante
      },
    });

    // --- SOLUCIÓN AL ERROR DE TIPO 'ANY' ---
    // TypeScript necesita ayuda para inferir el tipo de 's' en .find()
    // Creamos un tipo 'JudgeScoreGroup' basado en la respuesta de 'judgeScores'
    type JudgeScoreGroup = (typeof judgeScores)[0];
    // ----------------------------------------

    const judgeIds = [...new Set(judgeScores.map((s: JudgeScoreGroup) => s.judgeId))]; // Tipado añadido aquí también
    let votosA = 0;
    let votosB = 0;

    // 4. Hacemos el conteo de votos (misma lógica de la Server Action)
    for (const judgeId of judgeIds) {
      const scoreA =
        judgeScores.find(
          // --- SOLUCIÓN AL ERROR DE TIPO 'ANY' ---
          (s: JudgeScoreGroup) => // <-- Se añade el tipo explícito
            s.judgeId === judgeId && s.participantId === battle.participantAId
        )?._sum.totalScore || 0;

      const scoreB =
        judgeScores.find(
          // --- SOLUCIÓN AL ERROR DE TIPO 'ANY' ---
          (s: JudgeScoreGroup) => // <-- Se añade el tipo explícito
            s.judgeId === judgeId && s.participantId === battle.participantBId
        )?._sum.totalScore || 0;

      if (scoreA > scoreB) {
        votosA++;
      } else if (scoreB > scoreA) {
        votosB++;
      }
      // Si empatan, no se suma voto
    }

    // 5. Determinamos quién tuvo cuántos votos
    const finalWinnerVotes = (battle.winnerId === battle.participantAId) ? votosA : votosB;
    const finalLoserVotes = (battle.winnerId === battle.participantAId) ? votosB : votosA;

    console.log(`  -> Actualizando Batalla ${battle.id}: Resultado ${finalWinnerVotes}-${finalLoserVotes}`);

    // 6. Preparamos la promesa de actualización
    const updatePromise = prisma.battle.update({
      where: { id: battle.id },
      data: {
        winnerVotes: finalWinnerVotes,
        loserVotes: finalLoserVotes,
      },
    });

    updatePromises.push(updatePromise);
    updatedCount++;
  }

  // 7. Ejecutamos todas las actualizaciones en paralelo
  await Promise.all(updatePromises);

  console.log('🎉 ¡Backfill completado!');
  console.log(`Se actualizaron ${updatedCount} batallas.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error durante el script de backfill:', e);
    await prisma.$disconnect();
    process.exit(1);
  });