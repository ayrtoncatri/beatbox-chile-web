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

    if (!battle || !battle.participantBId) {
      return { error: 'Batalla incompleta o no encontrada.' };
    }
    
    const judgeScores = await prisma.score.groupBy({
      by: ['judgeId', 'participantId'], // <--- CAMBIO CLAVE
      where: {
        battleId: battleId,
        status: ScoreStatus.SUBMITTED, // Solo puntajes finales
      },
      _sum: {
        totalScore: true, // Suma R1 + R2 para ese juez/participante
      },
    });

    // 4. Mapear puntajes y contar VOTOS
    type JudgeScoreGroup = (typeof judgeScores)[0];
    const judgeIds = [...new Set(judgeScores.map((s) => s.judgeId))];
    const totalJudges = judgeIds.length;

    if (totalJudges < 2) {
      // Regla: Mínimo 2 jueces para declarar ganador
      return {
        error: `Solo ${totalJudges} juez(es) han enviado puntajes finales.`,
      };
    }

    let votosA = 0;
    let votosB = 0;

    // Iteramos por cada juez que haya votado
    for (const judgeId of judgeIds) {
      // Obtenemos el puntaje total de este juez para el Participante A
      const scoreA =
        judgeScores.find(
          (s) =>
            s.judgeId === judgeId && s.participantId === battle.participantAId
        )?._sum.totalScore || 0;

      // Obtenemos el puntaje total de este juez para el Participante B
      const scoreB =
        judgeScores.find(
          (s) =>
            s.judgeId === judgeId && s.participantId === battle.participantBId
        )?._sum.totalScore || 0;

      // Comparamos y asignamos el voto
      if (scoreA > scoreB) {
        votosA++;
      } else if (scoreB > scoreA) {
        votosB++;
      }
      // Si (scoreA === scoreB), es un empate para ese juez. No se suma voto.
    }

    // 5. Decidir ganador por VOTOS
    let winnerId: string;
    let winnerName: string;
    let finalWinnerVotes: number;
    let finalLoserVotes: number;

    if (votosA > votosB) {
      // <--- Lógica de victoria actualizada
      winnerId = battle.participantAId;
      winnerName =
        battle.participantA.inscripciones[0]?.nombreArtistico || 'Participante A';
      finalWinnerVotes = votosA; 
      finalLoserVotes = votosB;
    } else if (votosB > votosA) {
      // <--- Lógica de victoria actualizada
      winnerId = battle.participantBId;
      winnerName =
        battle.participantB?.inscripciones[0]?.nombreArtistico || 'Participante B';
      finalWinnerVotes = votosA; // Guardamos el recuento de A
      finalLoserVotes = votosB;
    } else {
      // Empate en VOTOS (ej. 1-1, o 0-0 si todos empataron)
      return {
        error: `¡Empate en votos! (${votosA} a ${votosB}). Se requiere un sistema de réplica (Replica).`,
      };
    }

    // 6. Actualizar la Batalla con el Ganador
    await prisma.battle.update({
      where: { id: battleId },
      data: {
        winnerId: winnerId,
        winnerVotes: finalWinnerVotes,
        loserVotes: finalLoserVotes,
        // TODO: En fases posteriores, aquí actualizarías 'nextBattleId'
      },
    });

    revalidatePath('/judge/dashboard');
    revalidatePath(`/admin/eventos/${battle.eventoId}`);

    return { 
      success: 'Ganador declarado.', 
      winnerName: winnerName 
    };

  } catch (e) {
    console.error('Error al declarar ganador:', e);
    return { error: 'Error interno al procesar el ganador.' };
  }
}