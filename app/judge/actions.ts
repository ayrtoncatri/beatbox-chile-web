// app/judge/actions.ts
'use server' // ¡Muy importante! Marca este archivo como Server Actions

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { submitScoreSchema, SubmitScorePayload } from '@/lib/schemas/judging'
import { authOptions } from '@/lib/auth'
import { RoundPhase } from '@prisma/client'

// Esta es la función que llamará nuestro formulario
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