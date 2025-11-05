// app/judge/dashboard/JudgePanel.tsx
'use client' // ¡Importante! Este es un Componente Cliente

import { useState } from 'react'
// Importamos los tipos generados por Prisma
import type { 
  JudgeAssignment, 
  Criterio, 
  Wildcard, 
  Score, 
  ScoreDetail, 
  User, 
  UserProfile, 
  Evento, 
  Categoria 
} from '@prisma/client'
import { JudgeScoreForm } from '@/components/judge/dashboard/JudgeScoreForm' // Crearemos este archivo a continuación

// Creamos tipos "enriquecidos" basados en los 'include' que hicimos en la página
type FullJudgeAssignment = JudgeAssignment & { evento: Evento; categoria: Categoria }
type FullWildcard = Wildcard & { user: { id: string; profile: UserProfile | null } }
type FullScore = Score & { details: ScoreDetail[] }

interface JudgePanelProps {
  assignments: FullJudgeAssignment[]
  allCriterios: Criterio[]
  wildcards: FullWildcard[]
  initialScores: FullScore[]
}

export function JudgePanel({ 
  assignments, 
  allCriterios, 
  wildcards, 
  initialScores 
}: JudgePanelProps) {
  
  // Estado para guardar qué asignación está viendo el juez
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(assignments[0]?.id || '')

  const selectedAssignment = assignments.find(a => a.id === selectedAssignmentId)

  // Filtramos los datos que le pasaremos al formulario
  const relevantWildcards = selectedAssignment 
    ? wildcards.filter(w => 
        w.eventoId === selectedAssignment.eventoId &&
        w.categoriaId === selectedAssignment.categoriaId
      )
    : []
  
  const relevantCriterios = selectedAssignment
    ? allCriterios.filter(
        c => c.categoriaId === selectedAssignment.categoriaId
      )
    : []

  return (
    <div className="space-y-6">
      {/* Selector de Tareas de Evaluación */}
      <div>
        <label htmlFor="assignment" className="block text-sm font-medium text-gray-700">
          Selecciona una evaluación:
        </label>
        <select
          id="assignment"
          name="assignment"
          value={selectedAssignmentId}
          onChange={(e) => setSelectedAssignmentId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          {assignments.map(a => (
            <option key={a.id} value={a.id}>
              {a.evento.nombre} - {a.categoria.name} ({a.phase})
            </option>
          ))}
        </select>
      </div>

      <hr />

      {/* Lista de Formularios para Evaluar */}
      {selectedAssignment && (
        <div className="space-y-4">
          {relevantWildcards.length === 0 && <p>No hay wildcards aprobados para evaluar en esta categoría.</p>}
          
          {relevantWildcards.map(wildcard => {
            // Buscamos si ya existe un puntaje para este wildcard
            const existingScore = initialScores.find(s => 
              s.participantId === wildcard.userId &&
              s.eventoId === selectedAssignment.eventoId &&
              s.categoriaId === selectedAssignment.categoriaId &&
              s.phase === selectedAssignment.phase
            )
            
            return (
              <JudgeScoreForm
                key={wildcard.id}
                wildcard={wildcard}
                assignment={selectedAssignment}
                criterios={relevantCriterios}
                existingScore={existingScore || null}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}