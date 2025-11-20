'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { RoundPhase, ScoreStatus } from '@prisma/client';
import { z } from 'zod';

interface WinnerActionState {
  error?: string;
  success?: string;
  winnerName?: string;
}

const WinnerSchema = z.object({
  battleId: z.string().cuid('ID de batalla no válido'),
});

/**
 * Declara el ganador de una batalla basándose en el puntaje total
 * de todos los jueces para los rounds 1 y 2.
 */
export async function declareBattleWinner(
  prevState: WinnerActionState,
  formData: FormData
): Promise<WinnerActionState> {
  
  const battleId = formData.get('battleId') as string;
  
  // 1. Validar y autenticar
  const validatedFields = WinnerSchema.safeParse({ battleId });
  if (!validatedFields.success) {
    return { error: 'Datos de batalla inválidos.' };
  }
  
  const session = await getServerSession(authOptions);
  const userRoles = (session?.user as any)?.roles || [];
  if (!session?.user?.id || !userRoles.includes('judge')) {
    return { error: 'No autorizado. Debes ser juez.' };
  }

  try {
    // 2. Obtener la Batalla y Participantes
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        participantA: { 
          select: { 
            id: true, 
            inscripciones: { select: { nombreArtistico: true }, take: 1 } 
          }, 
        },
        participantB: { 
          select: { 
            id: true, inscripciones: { select: { nombreArtistico: true }, take: 1 } 
          },
        },
      },
    });

    // --- CORRECCIÓN AQUÍ: Validamos que existan AMBOS participantes ---
    // Como ahora en la DB son opcionales, aquí debemos ser estrictos:
    // No se puede declarar ganador si falta alguno de los dos.
    if (!battle || !battle.participantAId || !battle.participantBId || !battle.participantA || !battle.participantB) {
      return { error: 'Batalla incompleta (faltan participantes) o no encontrada.' };
    }
    
    // === VALIDACIÓN DE QUÓRUM DE JUECES ===
    const totalAssignedJudges = await prisma.judgeAssignment.count({
        where: {
            eventoId: battle.eventoId,
            categoriaId: battle.categoriaId,
            phase: battle.phase
        }
    });

    const judgeScores = await prisma.score.groupBy({
      by: ['judgeId', 'participantId'],
      where: {
        battleId: battleId,
        status: ScoreStatus.SUBMITTED,
      },
      _sum: {
        totalScore: true,
      },
    });

    const votingJudgesIds = [...new Set(judgeScores.map((s) => s.judgeId))];
    const currentVotesCount = votingJudgesIds.length;

    if (currentVotesCount < totalAssignedJudges && currentVotesCount < 3) {
        return {
            error: `Faltan votos. Han votado ${currentVotesCount} de ${totalAssignedJudges} jueces. Se requieren al menos 3.`
        };
    }

    // ---------------------------------------------------------

    let votosA = 0;
    let votosB = 0;

    for (const judgeId of votingJudgesIds) {
      const scoreA = judgeScores.find(
          (s) => s.judgeId === judgeId && s.participantId === battle.participantAId
        )?._sum.totalScore || 0;

      const scoreB = judgeScores.find(
          (s) => s.judgeId === judgeId && s.participantId === battle.participantBId
        )?._sum.totalScore || 0;

      if (scoreA > scoreB) votosA++;
      else if (scoreB > scoreA) votosB++;
    }

    // 5. Decidir ganador por VOTOS
    let winnerId: string;
    let winnerName: string;
    let finalWinnerVotes: number;
    let finalLoserVotes: number;

    if (votosA > votosB) {
      // TypeScript ya sabe que participantAId existe por la validación inicial, 
      // pero battle.participantA podría ser null según el tipo autogenerado.
      // Hacemos un check de seguridad extra o usamos '!' si estamos seguros.
      if (!battle.participantA) return { error: 'Error en datos de Participante A' };

      winnerId = battle.participantAId!;
      winnerName = battle.participantA.inscripciones[0]?.nombreArtistico || 'Participante A';
      finalWinnerVotes = votosA; 
      finalLoserVotes = votosB;

    } else if (votosB > votosA) {
      if (!battle.participantB) return { error: 'Error en datos de Participante B' };

      winnerId = battle.participantBId!;
      winnerName = battle.participantB.inscripciones[0]?.nombreArtistico || 'Participante B';
      finalWinnerVotes = votosB;
      finalLoserVotes = votosA;
    } else {
      return {
        error: `¡Empate en votos! (${votosA} a ${votosB}). Se requiere desempate (Réplica).`,
      };
    }

    // 6. Actualizar la Batalla y AVANZAR AL GANADOR
    await prisma.$transaction(async (tx) => {
        // A. Cerrar batalla actual
        await tx.battle.update({
            where: { id: battleId },
            data: {
                winnerId: winnerId,
                winnerVotes: finalWinnerVotes,
                loserVotes: finalLoserVotes,
            },
        });

        // B. Mover al GANADOR a la siguiente batalla
        if (battle.nextBattleId) {
            const nextBattle = await tx.battle.findUnique({ where: { id: battle.nextBattleId } });
            if (nextBattle) {
                const isOddBattle = battle.orderInRound % 2 !== 0;
                const updateData = isOddBattle ? { participantAId: winnerId } : { participantBId: winnerId };
                await tx.battle.update({
                    where: { id: battle.nextBattleId },
                    data: updateData
                });
            }
        }

        // C. Si es SEMIFINAL, mover al PERDEDOR al Tercer Lugar
        if (battle.phase === RoundPhase.SEMIFINAL) {
            const thirdPlaceBattle = await tx.battle.findFirst({
                where: {
                    eventoId: battle.eventoId,
                    categoriaId: battle.categoriaId,
                    phase: RoundPhase.TERCER_LUGAR
                }
            });

            if (thirdPlaceBattle) {
                // El perdedor es el ID que NO es el winnerId
                // Como ya validamos al inicio que A y B existen, podemos usarlos directo.
                const loserId = (winnerId === battle.participantAId) ? battle.participantBId! : battle.participantAId!;
                
                const isOddBattle = battle.orderInRound % 2 !== 0;
                const updateData = isOddBattle ? { participantAId: loserId } : { participantBId: loserId };
                
                await tx.battle.update({
                    where: { id: thirdPlaceBattle.id },
                    data: updateData
                });
            }
        }
    });

    revalidatePath('/judge/dashboard');
    revalidatePath(`/admin/eventos/${battle.eventoId}`);

    return { 
      success: 'Ganador declarado y avanzado.', 
      winnerName: winnerName 
    };

  } catch (e) {
    console.error('Error al declarar ganador:', e);
    return { error: 'Error interno al procesar el ganador.' };
  }
}