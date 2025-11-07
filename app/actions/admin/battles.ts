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
  eventoId: z.string().cuid('Evento no válido'),
  categoriaId: z.string().cuid('Categoría no válida'),
  phase: z.nativeEnum(RoundPhase),
  // (Permitimos 2, 4, 8, 16, 32)
  participantCount: z.enum(['2', '4', '8', '16', '32'], {
    message: 'Debe seleccionar un número válido de participantes (2, 4, 8, 16, o 32)',
  }).transform(Number),
});

/**
 * Acción principal que genera las llaves de batalla
 * basado en el ranking de la fase PRELIMINAR o los ganadores de la fase anterior.
 */
export async function generateBrackets(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  
  let log: string[] = ['Iniciando generación de llaves...'];

  // --- 1. Seguridad (Sin cambios) ---
  const session = await getServerSession(authOptions);
  const userRoles = (session?.user as any)?.roles || [];
  if (!session?.user?.id || !userRoles.includes('admin')) {
    return { error: 'No autorizado. Se requiere ser administrador.', log };
  }
  log.push(`Admin verificado: ${session.user.email}`);

  // --- 2. Validación de Inputs (Ahora acepta 2 y 4) ---
  const validatedFields = BracketSchema.safeParse({
    eventoId: formData.get('eventoId'),
    categoriaId: formData.get('categoriaId'),
    phase: formData.get('phase'),
    participantCount: formData.get('participantCount'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message, log };
  }
  
  const { eventoId, categoriaId, phase, participantCount } = validatedFields.data;
  log.push(`Generando llaves de ${phase} para ${participantCount} participantes...`);

  // (Validación de lógica de negocio - sin cambios)
  if (phase === RoundPhase.PRELIMINAR || phase === RoundPhase.WILDCARD) {
    return { error: 'No se pueden generar llaves para PRELIMINAR o WILDCARD.', log };
  }

  try {
    // --- 3. Verificar si ya existen llaves (Sin cambios) ---
    const existingBattles = await prisma.battle.count({
      where: { eventoId, categoriaId, phase }
    });
    if (existingBattles > 0) {
      return { error: `Error: Ya existen ${existingBattles} batallas para la fase ${phase} de este evento.`, log };
    }

    // --- (2) CORRECCIÓN DE LÓGICA DE DATOS ---
    // (Reemplazamos la lógica antigua que SOLO buscaba en PRELIMINAR)

    let participants: string[] = []; // Array de IDs de participantes a emparejar
    let sourcePhase: RoundPhase | null = null; // De dónde vienen los participantes

    // Determinar la fase de origen
    switch (phase) {
      case RoundPhase.OCTAVOS:
        sourcePhase = RoundPhase.PRELIMINAR; // Viene del ranking
        break;
      case RoundPhase.CUARTOS:
        // Puede venir de OCTAVOS (si hubo) o PRELIMINAR (si es Top 8)
        const octavosDone = await prisma.battle.count({ where: { eventoId, categoriaId, phase: RoundPhase.OCTAVOS }});
        sourcePhase = octavosDone > 0 ? RoundPhase.OCTAVOS : RoundPhase.PRELIMINAR;
        break;
      case RoundPhase.SEMIFINAL:
        sourcePhase = RoundPhase.CUARTOS; // Debe venir de ganadores de Cuartos
        break;
      case RoundPhase.FINAL:
        sourcePhase = RoundPhase.SEMIFINAL; // Debe venir de ganadores de Semifinal
        break;
      case RoundPhase.TERCER_LUGAR:
        sourcePhase = RoundPhase.SEMIFINAL; // Debe venir de PERDEDORES de Semifinal
        break;
    }

    if (!sourcePhase) {
      return { error: `Fase de origen no determinada para ${phase}.`, log };
    }
    
    // --- 4. Obtener la lista de participantes ---
    
    if (sourcePhase === RoundPhase.PRELIMINAR) {
      // Lógica original: Obtener ranking de Showcase
      log.push(`Obteniendo ranking de ${sourcePhase}...`);
      const ranking = await prisma.score.groupBy({
        by: ['participantId'],
        where: { eventoId, categoriaId, phase: sourcePhase, status: ScoreStatus.SUBMITTED },
        _avg: { totalScore: true },
        orderBy: { _avg: { totalScore: 'desc' } },
      });
      log.push(`Ranking de ${sourcePhase} encontrado: ${ranking.length} participantes evaluados.`);

      if (ranking.length < participantCount) {
        return { error: `No hay suficientes participantes evaluados (${ranking.length}) para una llave de ${participantCount}.`, log };
      }
      participants = ranking.slice(0, participantCount).map(p => p.participantId);

    } else {
      // Nueva lógica: Obtener ganadores (o perdedores) de la fase anterior
      log.push(`Obteniendo resultados de ${sourcePhase}...`);
      const prevPhaseBattles = await prisma.battle.findMany({
        where: {
          eventoId,
          categoriaId,
          phase: sourcePhase,
        },
        include: {
          participantA: { select: { id: true } },
          participantB: { select: { id: true } },
        },
        orderBy: { orderInRound: 'asc' }, // ¡Importante!
      });

      if (prevPhaseBattles.length === 0) {
        return { error: `No se encontraron batallas de la fase anterior (${sourcePhase}).`, log };
      }
      
      if (phase === RoundPhase.TERCER_LUGAR) {
        // Lógica especial para 3er Lugar: buscar perdedores
        const winners = new Set(prevPhaseBattles.map(b => b.winnerId).filter(Boolean));
        const participantsInPhase = new Set(prevPhaseBattles.flatMap(b => [b.participantAId, b.participantBId].filter(Boolean) as string[]));
        
        participants = Array.from(participantsInPhase).filter(id => !winners.has(id));
        log.push(`Perdedores de ${sourcePhase} encontrados: ${participants.length}`);

      } else {
        // Lógica normal: buscar ganadores
        participants = prevPhaseBattles.map(b => b.winnerId).filter(Boolean) as string[];
        log.push(`Ganadores de ${sourcePhase} encontrados: ${participants.length}`);
      }

      if (participants.length !== participantCount) {
        return { error: `Se esperaban ${participantCount} participantes de ${sourcePhase}, pero se encontraron ${participants.length}. ¿Declaraste a todos los ganadores?`, log };
      }
    }

    // --- 6. Generar los Emparejamientos (Seeds) ---
    const battlesToCreate: Prisma.BattleCreateManyInput[] = [];
    const numBattles = participantCount / 2;
    
    if (sourcePhase === RoundPhase.PRELIMINAR) {
      // Lógica de Ranking (1º vs Último)
      log.push(`Generando ${numBattles} emparejamientos (1vN, 2vN-1...)...`);
      for (let i = 0; i < numBattles; i++) {
        const participantAId = participants[i];
        const participantBId = participants[participantCount - 1 - i];
        
        battlesToCreate.push({
          eventoId, categoriaId, phase,
          orderInRound: i + 1,
          participantAId: participantAId,
          participantBId: participantBId,
        });
      }
    } else {
      // Lógica de Llaves (1v2, 3v4) - "Ganador Q1 vs Ganador Q2", etc.
      log.push(`Generando ${numBattles} emparejamientos (1v2, 3v4...)...`);
      for (let i = 0; i < numBattles; i++) {
        const participantAId = participants[i * 2];
        const participantBId = participants[i * 2 + 1];
        
        if (!participantAId || !participantBId) {
          return { error: 'Error de lógica al emparejar ganadores.', log };
        }

        battlesToCreate.push({
          eventoId, categoriaId, phase,
          orderInRound: i + 1,
          participantAId: participantAId,
          participantBId: participantBId,
        });
      }
    }

    // --- 7. Crear las Batallas en la Base de Datos ---
    const result = await prisma.battle.createMany({
      data: battlesToCreate,
    });

    log.push(`¡Éxito! Se crearon ${result.count} batallas en la base de datos.`);
    
    revalidatePath(`/admin/eventos/${eventoId}`);
    return { success: `Llaves de ${phase} generadas exitosamente.`, log };

  } catch (error) {
    console.error('Error al generar llaves:', error);
    return { error: 'Error del servidor al generar las llaves.', log };
  }
}