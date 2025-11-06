'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { InscripcionSource, Prisma, RoundPhase, ScoreStatus } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Tipo de estado para el formulario
interface ActionState {
  error?: string;
  success?: string;
  log?: string[]; // Log para mostrar el proceso al admin
}

// Zod Schema para validar el formulario
const BracketSchema = z.object({
  eventoId: z.string().cuid('Evento no válido'),
  categoriaId: z.string().cuid('Categoría no válida'),
  // La fase que VAMOS A CREAR (ej. Octavos)
  phase: z.nativeEnum(RoundPhase), 
  // El número de participantes (8, 16, 32)
  participantCount: z.enum(['8', '16', '32'], {
    message: 'Debe seleccionar un número válido de participantes (8, 16, o 32)',
  }).transform(Number),
});

/**
 * Acción principal que genera las llaves de batalla
 * basado en el ranking de la fase PRELIMINAR.
 */
export async function generateBrackets(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  
  let log: string[] = ['Iniciando generación de llaves...'];

  // --- 1. Seguridad: Verificar Sesión de Admin ---
  const session = await getServerSession(authOptions);
  const userRoles = (session?.user as any)?.roles || [];
  if (!session?.user?.id || !userRoles.includes('admin')) {
    return { error: 'No autorizado. Se requiere ser administrador.', log };
  }
  log.push(`Admin verificado: ${session.user.email}`);

  // --- 2. Validación de Inputs ---
  const validatedFields = BracketSchema.safeParse({
    eventoId: formData.get('eventoId'),
    categoriaId: formData.get('categoriaId'),
    phase: formData.get('phase'), // (ej. 'OCTAVOS')
    participantCount: formData.get('participantCount'), // (ej. '16')
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message, log };
  }
  
  const { eventoId, categoriaId, phase, participantCount } = validatedFields.data;
  log.push(`Generando llaves de ${phase} para ${participantCount} participantes...`);

  // (Validación de lógica de negocio)
  if (phase === RoundPhase.PRELIMINAR || phase === RoundPhase.WILDCARD) {
    return { error: 'No se pueden generar llaves para PRELIMINAR o WILDCARD.', log };
  }

  try {
    // --- 3. Verificar si ya existen llaves para esta fase ---
    const existingBattles = await prisma.battle.count({
      where: { eventoId, categoriaId, phase }
    });
    if (existingBattles > 0) {
      return { error: `Error: Ya existen ${existingBattles} batallas para la fase ${phase} de este evento.`, log };
    }

    // --- 4. Obtener el Ranking de la fase PRELIMINAR ---
    // (Esta es la lógica clave: leemos el showcase)
    const ranking = await prisma.score.groupBy({
      by: ['participantId'],
      where: {
        eventoId,
        categoriaId,
        phase: RoundPhase.PRELIMINAR, // <-- Basado en el showcase
        status: ScoreStatus.SUBMITTED, // Solo puntajes finales
      },
      _avg: {
        totalScore: true, // Promedio de notas de jueces
      },
      orderBy: {
        _avg: {
          totalScore: 'desc', // Del más alto al más bajo
        },
      },
    });
    log.push(`Ranking de PRELIMINAR encontrado: ${ranking.length} participantes evaluados.`);

    // --- 5. Validar si tenemos suficientes participantes ---
    if (ranking.length < participantCount) {
      return { 
        error: `No hay suficientes participantes evaluados (${ranking.length}) para una llave de ${participantCount}.`, 
        log 
      };
    }
    
    // Tomamos solo el Top N (ej. Top 16)
    const participants = ranking.slice(0, participantCount);

    // --- 6. Generar los Emparejamientos (Seeds) ---
    // (1º vs 16º, 2º vs 15º, etc.)
    const battlesToCreate: Prisma.BattleCreateManyInput[] = [];
    const numBattles = participantCount / 2; // (ej. 16 / 2 = 8 batallas de Octavos)
    
    for (let i = 0; i < numBattles; i++) {
      const participantAId = participants[i].participantId; // (ej. Rango 1)
      const participantBId = participants[participantCount - 1 - i].participantId; // (ej. Rango 16)
      
      battlesToCreate.push({
        eventoId,
        categoriaId,
        phase,
        orderInRound: i + 1, // (Batalla 1, Batalla 2, ...)
        participantAId: participantAId,
        participantBId: participantBId,
        // winnerId y nextBattleId se dejan en null
      });
    }
    log.push(`Se generaron ${battlesToCreate.length} emparejamientos (ej. 1v${participantCount}, 2v${participantCount-1}, ...).`);

    // --- 7. Crear las Batallas en la Base de Datos ---
    const result = await prisma.battle.createMany({
      data: battlesToCreate,
    });

    log.push(`¡Éxito! Se crearon ${result.count} batallas en la base de datos.`);
    
    // Revalidamos la página del admin para que pueda ver las llaves
    revalidatePath(`/admin/eventos/${eventoId}`);

    return { success: `Llaves de ${phase} generadas exitosamente.`, log };

  } catch (error) {
    console.error('Error al generar llaves:', error);
    return { error: 'Error del servidor al generar las llaves.', log };
  }
}