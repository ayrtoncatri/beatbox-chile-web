import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { JudgePanel } from '@/components/judge/dashboard/JudgePanel'
import { RoundPhase, ScoreStatus, WildcardStatus } from '@prisma/client'
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'

/**
 * Esta es la página principal del dashboard del Juez.
 * Es un Server Component, por lo que podemos fetchear datos directamente.
 */
export default async function JudgeDashboardPage() {
  
  // 1. AUTENTICACIÓN: Obtener la sesión
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/judge/dashboard')
  }

  // 2. AUTORIZACIÓN (ROL): Verificar que el usuario es un Juez
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId: session.user.id,
      role: {
        name: 'judge',
      },
    },
  })

  if (!userRole) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
        <p>No tienes permisos para acceder a esta página. Debes tener el rol de Juez.</p>
      </div>
    )
  }

  // 3. OBTENER DATOS (Asignaciones): Cargar todas las asignaciones de este juez
  const assignments = await prisma.judgeAssignment.findMany({
    where: { judgeId: session.user.id },
    include: {
      evento: true,
      categoria: true,
    },
    orderBy: { evento: { fecha: 'desc' } },
  })

  if (assignments.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Dashboard del Juez</h1>
        <p>No tienes ninguna evaluación asignada por el momento.</p>
      </div>
    )
  }

  // IDs de las tareas asignadas (NECESARIOS para el Promise.all)
  const assignedEventoIds = assignments.map((a) => a.eventoId)
  const assignedCategoriaIds = assignments.map((a) => a.categoriaId)

  // 4. OBTENER DATOS ADICIONALES (Criterios, Participantes, Batallas, Puntajes)
  const [allCriterios, participants, battles, existingScores, approvedWildcards] = await Promise.all([
    
    // Cargar todos los Criterios
    prisma.criterio.findMany({
      where: {
        categoriaId: { in: assignedCategoriaIds },
      },
    }),

    // Cargar todos los PARTICIPANTES (Inscripciones)
    prisma.inscripcion.findMany({
      where: {
        eventoId: { in: assignedEventoIds },
        categoriaId: { in: assignedCategoriaIds },
      },
      include: {
        user: {
          include: { 
            profile: true, 
          },
        },
        wildcard: {
          select: { youtubeUrl: true }
        }
      },
    }),

    // Cargar todas las BATALLAS
    prisma.battle.findMany({
      where: {
        eventoId: { in: assignedEventoIds },
        categoriaId: { in: assignedCategoriaIds },
      },
      include: {
        participantA: { include: { profile: true, inscripciones: { select: { nombreArtistico: true }, take: 1, orderBy: {createdAt: 'desc'} } } },
        participantB: { include: { profile: true, inscripciones: { select: { nombreArtistico: true }, take: 1, orderBy: {createdAt: 'desc'} } } },
      }
    }),

    // Cargar los puntajes existentes
    prisma.score.findMany({
      where: {
        judgeId: session.user.id,
        eventoId: { in: assignedEventoIds },
        categoriaId: { in: assignedCategoriaIds },
      },
      include: {
        details: true,
      },
    }),

    prisma.wildcard.findMany({
      where: {
        eventoId: { in: assignedEventoIds },
        categoriaId: { in: assignedCategoriaIds },
        status: WildcardStatus.APPROVED, // <-- La nueva lógica de negocio
      },
      include: {
        user: {
          include: { profile: true }
        }
      }
    })
  ]);

  // 5. RENDERIZAR EL PANEL
  return (
    // --- (1) Contenedor principal con max-width ---
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
      
      {/* --- (2) Cabecero Estilizado (Fase 10.7) --- */}
      <div className="flex justify-center items-center gap-4">
        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600">
          <ClipboardDocumentCheckIcon className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white text-center text-gray900">
            Panel de Evaluación
          </h1>
          <p className="mt-1 text-base text-white text-center text-gray600">
            Selecciona una tarea para comenzar a evaluar participantes.
          </p>
        </div>
      </div>
      
      {/* --- (3) El Panel de Juez (Ahora se renderiza con el estilo de tarjeta claro) --- */}
      <JudgePanel
        assignments={assignments}
        allCriterios={allCriterios}
        participants={participants}
        battles={battles}
        initialScores={existingScores}
        approvedWildcards={approvedWildcards}
      />
    </div>
  )
}