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
          select: { id: true, inscripciones: { select: { nombreArtistico: true }, take: 1 } } 
        },
        participantB: { 
          select: { id: true, inscripciones: { select: { nombreArtistico: true }, take: 1 } } 
        },
      },
    });

    if (!battle || !battle.participantBId) {
      return { error: 'Batalla incompleta o no encontrada.' };
    }
    
    // 3. Calcular el puntaje TOTAL (R1 + R2 de TODOS los jueces)
    const totalScores = await prisma.score.groupBy({
      by: ['participantId'],
      where: {
        battleId: battleId,
        status: ScoreStatus.SUBMITTED, // Solo puntajes finales
      },
      _sum: {
        totalScore: true,
      },
    });

    
    const distinctJudges = await prisma.score.groupBy({
        by: ['judgeId'],
        where: { battleId: battleId, status: ScoreStatus.SUBMITTED },
        // No necesitamos _count aquí, solo los IDs distintos
    });
    const totalJudges = distinctJudges.length;

    // 4. Mapear puntajes a participantes A y B
    const scoreA = totalScores.find(s => s.participantId === battle.participantAId)?._sum.totalScore || 0;
    const scoreB = totalScores.find(s => s.participantId === battle.participantBId)?._sum.totalScore || 0;


    if (totalJudges < 2) { // Regla: Mínimo 2 jueces para declarar ganador
        return { error: `Solo ${totalJudges} juez(es) han enviado puntajes finales.` };
    }

    let winnerId: string;
    let winnerName: string;

    if (scoreA > scoreB) {
      winnerId = battle.participantAId;
      winnerName = battle.participantA.inscripciones[0]?.nombreArtistico || 'Participante A';
    } else if (scoreB > scoreA) {
      winnerId = battle.participantBId;
      winnerName = battle.participantB?.inscripciones[0]?.nombreArtistico || 'Participante B';
    } else {
      // Regla de Desempate (Replica): Por ahora, bloqueamos
      return { error: '¡Empate! Se requiere un sistema de réplica (Replica).' };
    }

    // 5. Actualizar la Batalla con el Ganador
    await prisma.battle.update({
      where: { id: battleId },
      data: {
        winnerId: winnerId,
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