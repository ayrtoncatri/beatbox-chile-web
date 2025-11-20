'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { InscripcionSource, Prisma, RoundPhase, ScoreStatus } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Tipo de estado (sin cambios)
interface ActionState {
  error?: string;
  success?: string;
  log?: string[];
}

// --- (1) CORRECCIÓN DEL SCHEMA ---
const BracketSchema = z.object({
  eventoId: z.string().cuid(),
  categoriaId: z.string().cuid(),
  phase: z.nativeEnum(RoundPhase), // Fase INICIAL (ej: OCTAVOS)
  participantCount: z.coerce.number().int().positive(), // ej: 16
});

const PHASE_SIZE_MAP: Record<string, number> = {
  [RoundPhase.FINAL]: 2,
  [RoundPhase.SEMIFINAL]: 4,
  [RoundPhase.CUARTOS]: 8,
  [RoundPhase.OCTAVOS]: 16,
  [RoundPhase.TERCER_LUGAR]: 2,
  // Si agregas DIECISEISAVOS en tu schema, añádelo aquí con valor 32
};

function getSeedingOrder(size: number): number[] {
  if (size === 2) return [1, 2];

  const prevOrder = getSeedingOrder(size / 2);
  const currentOrder: number[] = [];

  for (const x of prevOrder) {
    currentOrder.push(x);
    currentOrder.push(size + 1 - x);
  }

  return currentOrder;
}

/**
 * Acción principal que genera las llaves de batalla
 * basado en el ranking de la fase PRELIMINAR o los ganadores de la fase anterior.
 */
export async function generateBrackets(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  
  let log: string[] = ['Iniciando generación de árbol de torneo...'];

  // 1. Seguridad
  const session = await getServerSession(authOptions);
  const userRoles = (session?.user as any)?.roles || [];
  if (!session?.user?.id || !userRoles.includes('admin')) {
    return { error: 'No autorizado.', log };
  }

  // 2. Validación de Inputs
  const rawData = {
    eventoId: formData.get('eventoId'),
    categoriaId: formData.get('categoriaId'),
    phase: formData.get('phase'),
    participantCount: formData.get('participantCount'),
  };

  const validatedFields = BracketSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message, log };
  }
  
  const { eventoId, categoriaId, phase: startPhase, participantCount } = validatedFields.data;
  log.push(`Configuración: ${startPhase} con ${participantCount} participantes.`);

  try {
    // 3. Obtener Ranking de Clasificación (Showcase)
    // Necesitamos los participantes ordenados por puntaje TOTAL para aplicar el seeding correcto
    log.push('Obteniendo ranking de clasificación...');
    
    // Usamos groupBy para obtener la suma total de los puntajes SUBMITTED
    const rankingScores = await prisma.score.groupBy({
      by: ['participantId'],
      where: { 
        eventoId, 
        categoriaId, 
        phase: RoundPhase.PRELIMINAR, // Asumimos que el seeding viene de la Preliminar
        status: ScoreStatus.SUBMITTED 
      },
      _sum: { totalScore: true }, 
      orderBy: { _sum: { totalScore: 'desc' } },
    });

    if (rankingScores.length < participantCount) {
      return { 
        error: `Insuficientes participantes clasificados. Se requieren ${participantCount}, hay ${rankingScores.length}.`, 
        log 
      };
    }

    // Extraemos solo los IDs de los clasificados en orden (Seed 1, Seed 2, ...)
    const qualifiedIds = rankingScores.slice(0, participantCount).map(r => r.participantId);
    log.push(`Clasificados seleccionados: ${qualifiedIds.length}`);

    // 4. Calcular Orden de Seeds (Emparejamientos)
    // El algoritmo nos da índices base 1 (1, 16, 8...). Restamos 1 para usar en el array.
    const seedIndices = getSeedingOrder(participantCount);
    // seededParticipants es el array FINAL ordenado para las batallas (ej: [User1, User16, User8, User9...])
    const seededParticipants = seedIndices.map(seedIndex => qualifiedIds[seedIndex - 1]);

    // 5. Generación del Árbol en Transacción (Todo o Nada)
    await prisma.$transaction(async (tx) => {
      
      // 1. Limpieza
      log.push('Limpiando brackets existentes...');
      await tx.battle.deleteMany({
        where: {
          eventoId,
          categoriaId,
          phase: { 
            in: [RoundPhase.OCTAVOS, RoundPhase.CUARTOS, RoundPhase.SEMIFINAL, RoundPhase.FINAL, RoundPhase.TERCER_LUGAR] 
          }
        }
      });

      // 2. Rondas a crear
      const roundsToCreate: RoundPhase[] = [RoundPhase.FINAL];
      if (startPhase !== RoundPhase.FINAL) roundsToCreate.push(RoundPhase.SEMIFINAL);
      if (startPhase === RoundPhase.CUARTOS || startPhase === RoundPhase.OCTAVOS) roundsToCreate.push(RoundPhase.CUARTOS);
      if (startPhase === RoundPhase.OCTAVOS) roundsToCreate.push(RoundPhase.OCTAVOS);

      let nextRoundBattles: { id: string }[] = [];

      // 3. Bucle de creación
      for (const currentPhase of roundsToCreate) {
        const roundSize = PHASE_SIZE_MAP[currentPhase]; 
        const battlesCount = roundSize / 2; 
        const currentRoundBattleIds: { id: string }[] = [];

        log.push(`Creando fase ${currentPhase}...`);

        for (let i = 0; i < battlesCount; i++) {
          const nextBattleId = currentPhase !== RoundPhase.FINAL 
            ? nextRoundBattles[Math.floor(i / 2)]?.id 
            : undefined;

          // --- CORRECCIÓN CRÍTICA AQUÍ ---
          // Solo asignamos participantes si es la fase de inicio (startPhase).
          // Para fases futuras, pA y pB se quedan como undefined (null en DB).
          let pA = undefined;
          let pB = undefined;

          if (currentPhase === startPhase) {
            pA = seededParticipants[i * 2];
            pB = seededParticipants[i * 2 + 1];
          }

          const battle = await tx.battle.create({
            data: {
              eventoId,
              categoriaId,
              phase: currentPhase,
              orderInRound: i + 1,
              nextBattleId: nextBattleId,
              // Ahora pasamos undefined si no hay nadie, Prisma pondrá NULL
              participantAId: pA, 
              participantBId: pB, 
            },
            select: { id: true }
          });
          
          currentRoundBattleIds.push(battle);
        }
        nextRoundBattles = currentRoundBattleIds;
      }

      // 4. Tercer Lugar (Vacío inicialmente, a menos que empecemos en 3er lugar)
      if (startPhase !== RoundPhase.FINAL) {
        await tx.battle.create({
            data: {
                eventoId,
                categoriaId,
                phase: RoundPhase.TERCER_LUGAR,
                orderInRound: 1,
                participantAId: undefined, // Vacío hasta que lleguen perdedores
                participantBId: undefined  // Vacío hasta que lleguen perdedores
            }
        });
      }
    });

    log.push('¡Árbol de torneo generado exitosamente!');
    revalidatePath(`/admin/eventos/${eventoId}`);
    return { success: `Se generaron todas las llaves desde ${startPhase} hasta la FINAL (incluyendo 3er Lugar).`, log };

  } catch (error: any) {
    console.error('Error generando brackets:', error);
    return { error: 'Error interno: ' + (error.message || error), log };
  }
}