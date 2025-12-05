'use server' 

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { submitScoreSchema, SubmitScorePayload } from '@/lib/schemas/judging'
import { authOptions } from '@/lib/auth'
// CORRECCIÓN: Añadimos ScoreStatus a la importación
import { RoundPhase, ScoreStatus } from '@prisma/client'
import { z } from 'zod'

const bulkSubmitSchema = z.array(submitScoreSchema)

// Esta es la función que llamará nuestro formulario individual (Mantener igual)
export async function submitScore(
  payload: SubmitScorePayload
): Promise<{ success: boolean; error?: any; data?: any }> {
  
  // 1. VALIDACIÓN (ZOD): Validamos el payload primero
  const validation = submitScoreSchema.safeParse(payload)
  if (!validation.success) {
    console.error('Error de validación de Zod:', validation.error.format())
    return { success: false, error: validation.error.format() }
  }

  // Desestructuramos los datos validados
  const { 
    eventoId, 
    categoriaId, 
    phase, 
    participantId, 
    scores, 
    notes, 
    status,
    battleId,       
    roundNumber
  } = validation.data

  try {
    // 2. AUTENTICACIÓN (Next-Auth v4)
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: 'No autorizado' }
    }
    const judgeId = session.user.id

    // 3. AUTORIZACIÓN (Regla de Negocio): ¿Está el juez asignado?
    const assignment = await prisma.judgeAssignment.findUnique({
      where: {
        judgeId_eventoId_categoriaId_phase: {
          judgeId,
          eventoId,
          categoriaId,
          phase,
        },
      },
    })

    if (!assignment) {
      return { success: false, error: 'No estás asignado para evaluar esta categoría/fase.' }
    }

    const isBattlePhase = phase !== RoundPhase.WILDCARD && phase !== RoundPhase.PRELIMINAR;
    if (isBattlePhase && !battleId) {
      return { success: false, error: 'Esta evaluación es de una batalla pero no se proporcionó un ID de batalla.' }
    }

    // 4. VALIDACIÓN DE CRITERIOS (Regla de Negocio)
    const criterios = await prisma.criterio.findMany({
      where: { categoriaId },
      select: { id: true, maxScore: true, name: true },
    })

    let totalScore = 0 // REGLA DE CÁLCULO 1: Total del Juez
    for (const score of scores) {
      const criterio = criterios.find((c) => c.id === score.criterioId)
      if (!criterio) {
        return { success: false, error: `Criterio ${score.criterioId} no válido.` }
      }
      if (score.value > criterio.maxScore) {
        return { success: false, error: `Puntaje ${score.value} excede el máximo (${criterio.maxScore}) para ${criterio.name}` }
      }
      totalScore += score.value // Sumamos al total
    }

    // 5. GUARDADO EN BASE DE DATOS (UPSERT)
    const savedScore = await prisma.score.upsert({
      where: {
        // La llave única que definimos en el schema
        eventoId_categoriaId_phase_judgeId_participantId_roundNumber: {
          eventoId,
          categoriaId,
          phase,
          judgeId,
          participantId,
          roundNumber: roundNumber || 1,
        },
      },
      create: {
        eventoId,
        categoriaId,
        phase,
        judgeId,
        participantId,
        totalScore,
        notes,
        status,
        battleId: battleId,
        roundNumber: roundNumber,
        details: {
          create: scores.map((s) => ({
            criterioId: s.criterioId,
            value: s.value,
          })),
        },
      },
      update: {
        totalScore,
        notes,
        status,
        battleId: battleId,
        roundNumber: roundNumber,
        details: {
          deleteMany: {},
          create: scores.map((s) => ({
            criterioId: s.criterioId,
            value: s.value,
          })),
        },
      },
    })

    // 6. ÉXITO
    // Refrescamos la data de esta página para que la UI se actualice
    revalidatePath('/judge/dashboard') 
    return { success: true, data: savedScore }

  } catch (error) {
    console.error('Error en Server Action submitScore:', error)
    return { success: false, error: 'Error interno del servidor' }
  }
}

// === NUEVA FUNCIÓN: BULK SUBMIT ===
export async function submitBulkScores(
  payloads: SubmitScorePayload[]
): Promise<{ success: boolean; count?: number; error?: any }> {
  try {
    // 1. Validación Zod del Array
    const validation = bulkSubmitSchema.safeParse(payloads)
    if (!validation.success) {
      return { success: false, error: validation.error.format() }
    }
    const dataList = validation.data
    if (dataList.length === 0) return { success: true, count: 0 }

    // 2. Auth
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: 'No autorizado' }
    }
    const judgeId = session.user.id

    // 3. Cargar TODOS los criterios necesarios en una sola query (fuera de la tx)
    const categoriaIds = Array.from(
      new Set(dataList.map((d) => d.categoriaId))
    )

    const criteriosAll = await prisma.criterio.findMany({
      where: { categoriaId: { in: categoriaIds } },
      select: { id: true, maxScore: true, categoriaId: true },
    })

    // Map de categoriaId -> lista de criterios
    const criteriosPorCategoria = new Map<
      string,
      { id: string; maxScore: number }[]
    >()

    for (const c of criteriosAll) {
      const list = criteriosPorCategoria.get(c.categoriaId) ?? []
      list.push({ id: c.id, maxScore: c.maxScore })
      criteriosPorCategoria.set(c.categoriaId, list)
    }

    // 4. Construir todas las operaciones de upsert en memoria
    const operations = dataList.map((data) => {
      const criterios = criteriosPorCategoria.get(data.categoriaId)
      if (!criterios) {
        throw new Error(
          `No hay criterios configurados para la categoría ${data.categoriaId}`
        )
      }

      let totalScore = 0

      // normalizamos los detalles y calculamos el total
      const detailsData = data.scores.map((s) => {
        const crit = criterios.find((c) => c.id === s.criterioId)
        if (!crit) {
          throw new Error(
            `Criterio ${s.criterioId} no válido para la categoría ${data.categoriaId}`
          )
        }

        const safeValue = Math.min(s.value, crit.maxScore)
        totalScore += safeValue

        return {
          criterioId: s.criterioId,
          value: safeValue,
        }
      })

      const roundNumber = data.roundNumber || 1

      // Devolvemos el PrismaPromise que se ejecutará dentro de la transacción
      return prisma.score.upsert({
        where: {
          eventoId_categoriaId_phase_judgeId_participantId_roundNumber: {
            eventoId: data.eventoId,
            categoriaId: data.categoriaId,
            phase: data.phase,
            judgeId,
            participantId: data.participantId,
            roundNumber,
          },
        },
        create: {
          eventoId: data.eventoId,
          categoriaId: data.categoriaId,
          phase: data.phase,
          judgeId,
          participantId: data.participantId,
          roundNumber,
          battleId: data.battleId,
          totalScore,
          notes: data.notes,
          status: ScoreStatus.SUBMITTED, // forzamos SUBMITTED
          details: {
            // un solo batch insert para los detalles
            createMany: {
              data: detailsData,
            },
          },
        },
        update: {
          totalScore,
          notes: data.notes,
          status: ScoreStatus.SUBMITTED,
          battleId: data.battleId,
          roundNumber,
          details: {
            // borramos detalles previos y volvemos a crear en batch
            deleteMany: {},
            createMany: {
              data: detailsData,
            },
          },
        },
      })
    })

    // 5. Ejecutamos TODO en UNA sola transacción atómica
    // Timeout < 10s porque estás en Hobby. 9000ms deja margen.
    await prisma.$transaction(operations)

    // 6. Revalidar el dashboard
    revalidatePath('/judge/dashboard')
    return { success: true, count: dataList.length }
  } catch (error) {
    console.error('Bulk Submit Error:', error)
    return { success: false, error: 'Error procesando el envío masivo.' }
  }
}