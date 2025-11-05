// app/judge/dashboard/page.tsx
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { JudgePanel } from '@/components/judge/dashboard/JudgePanel' // Crearemos este archivo a continuación

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
        name: 'judge', // Usamos 'judge' (en minúsculas) como definimos en el seed
      },
    },
  })

  // Si no tiene el rol 'judge', lo redirigimos
  if (!userRole) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
        <p>No tienes permisos para acceder a esta página. Debes tener el rol de Juez.</p>
      </div>
    )
  }

  // 3. OBTENER DATOS: Cargar todas las asignaciones de este juez
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

  // 4. OBTENER DATOS ADICIONALES (Criterios, Wildcards, Puntajes)

  // IDs de las tareas asignadas
  const assignedEventoIds = assignments.map((a) => a.eventoId)
  const assignedCategoriaIds = assignments.map((a) => a.categoriaId)

  // Cargar todos los Criterios de las categorías asignadas
  const allCriterios = await prisma.criterio.findMany({
    where: {
      categoriaId: { in: assignedCategoriaIds },
    },
  })

  // Cargar todos los Wildcards de los eventos y categorías asignados
  // (Aquí asumimos que evaluamos Wildcards, luego adaptamos para presencial)
  const wildcards = await prisma.wildcard.findMany({
    where: {
      eventoId: { in: assignedEventoIds },
      categoriaId: { in: assignedCategoriaIds },
      status: 'APPROVED', // Solo evaluamos Wildcards aprobados por el admin
    },
    include: {
      user: {
        include: { 
          profile: true, 
        },
      },
    },
  })

  // Cargar los puntajes que este juez YA ha emitido (para pre-llenar)
  const existingScores = await prisma.score.findMany({
    where: {
      judgeId: session.user.id,
      eventoId: { in: assignedEventoIds },
      categoriaId: { in: assignedCategoriaIds },
    },
    include: {
      details: true, // Cargar los detalles de cada criterio
    },
  })

  // 5. RENDERIZAR EL PANEL (Componente Cliente)
  // Pasamos todos los datos al componente cliente que manejará la interacción.
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">Panel de Evaluación</h1>
      <JudgePanel
        assignments={assignments}
        allCriterios={allCriterios}
        wildcards={wildcards}
        initialScores={existingScores}
      />
    </div>
  )
}