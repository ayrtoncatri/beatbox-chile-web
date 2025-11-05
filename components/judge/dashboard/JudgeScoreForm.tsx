// components/judge/dashboard/JudgeScoreForm.tsx
'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
// ===== CORRECCIÓN 1: Importar RoundPhase =====
import { Criterio, ScoreStatus, RoundPhase } from '@prisma/client' 
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { debounce } from 'lodash'

// Tipos y Zod Schema
import {
  submitScoreSchema,
  SubmitScorePayload,
} from '@/lib/schemas/judging'
// ===== CORRECCIÓN 2: Ruta de importación correcta =====
import { submitScore } from '@/app/judge/actions' 

// --- Tipos de los props ---
// ===== CORRECCIÓN 3: Tipo de 'phase' corregido =====
type FullJudgeAssignment = {
  id: string
  eventoId: string
  categoriaId: string
  phase: RoundPhase // <-- CORREGIDO (antes 'any')
}
type FullWildcard = {
  id: string
  userId: string
  nombreArtistico: string | null
  youtubeUrl: string
  user: { id: string; profile: { nombres: string | null; apellidoPaterno: string | null } | null }
}
type FullScore = {
  status: ScoreStatus // <-- CORREGIDO
  notes: string | null
  details: { criterioId: string; value: number }[]
} | null
// --- Fin de los Tipos ---

interface JudgeScoreFormProps {
  wildcard: FullWildcard
  assignment: FullJudgeAssignment
  criterios: Criterio[]
  existingScore: FullScore
}

const generateOptions = (max: number) => {
  return Array.from({ length: max + 1 }, (_, i) => i)
}

export function JudgeScoreForm({
  wildcard,
  assignment,
  criterios,
  existingScore,
}: JudgeScoreFormProps) {
  
  const [isPending, startTransition] = useTransition()
  const [total, setTotal] = useState(0)
  const [formStatus, setFormStatus] = useState(existingScore?.status || ScoreStatus.DRAFT)

  // 1. CONFIGURACIÓN DE REACT-HOOK-FORM
  const form = useForm<SubmitScorePayload>({
    resolver: zodResolver(submitScoreSchema),
    
    // ===== CORRECCIÓN 4: Añadir 'optional chaining' (?.) =====
    defaultValues: {
      eventoId: assignment.eventoId,
      categoriaId: assignment.categoriaId,
      phase: assignment.phase,
      participantId: wildcard.userId,
      notes: existingScore?.notes ?? undefined, // <-- CORREGIDO
      status: existingScore?.status ?? ScoreStatus.DRAFT, // <-- CORREGIDO
      
      scores: criterios.map((c) => {
        const existingDetail = existingScore?.details.find( // <-- CORREGIDO
          (d) => d.criterioId === c.id
        )
        return {
          criterioId: c.id,
          value: existingDetail?.value ?? 0, // <-- CORREGIDO
        }
      }),
    },
  })

  // 2. CÁLCULO DE TOTAL (REGLA 1)
  const watchedScores = useWatch({ control: form.control, name: 'scores' })
  
  useEffect(() => {
    const newTotal = watchedScores.reduce(
      (acc, current) => acc + Number(current.value || 0), 
      0
    )
    setTotal(newTotal)
  }, [watchedScores])


  // 3. LÓGICA DE AUTOSAVE (DRAFT)
  useEffect(() => {
    const debouncedSave = debounce(async (payload: SubmitScorePayload) => {
      if (formStatus === ScoreStatus.SUBMITTED) return
      
      startTransition(async () => {
        await submitScore({ ...payload, status: ScoreStatus.DRAFT })
      })
    }, 2000) 

    const subscription = form.watch((data) => {    // <-- CORREGIDO
      const result = submitScoreSchema.safeParse(data) // <-- Esto ahora funcionará
      if (result.success) {
        debouncedSave(result.data)
      }
    })
    
    return () => subscription.unsubscribe()
  }, [form, formStatus, startTransition])


  // 4. ENVÍO FINAL (SUBMITTED)
  const onSubmit = (data: SubmitScorePayload) => {
    if (formStatus === ScoreStatus.SUBMITTED) return

    startTransition(async () => {
      const result = await submitScore({ ...data, status: ScoreStatus.SUBMITTED })
      if (result.success) {
        setFormStatus(ScoreStatus.SUBMITTED) 
      } else {
        console.error("Error al enviar el puntaje final:", result.error)
        alert("Error al enviar: " + JSON.stringify(result.error))
      }
    })
  }
  
  const participantName =
    wildcard.nombreArtistico ||
    `${wildcard.user.profile?.nombres} ${wildcard.user.profile?.apellidoPaterno}`


  // 5. RENDERIZADO (JSX)
  return (
    <form 
      onSubmit={form.handleSubmit(onSubmit)} 
      className="rounded-lg border bg-white p-4 shadow-md transition-all"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <h3 className="text-xl font-semibold text-gray-900">
          {participantName}
        </h3>
        <a
          href={wildcard.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white no-underline shadow-sm hover:bg-red-500"
        >
          Ver Wildcard (YouTube)
        </a>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-3 lg:grid-cols-6">
        {criterios.map((criterio, index) => (
          <div key={criterio.id}>
            <label 
              htmlFor={`scores.${index}.value`} 
              className="flex items-center space-x-1 text-sm font-medium text-gray-700"
              title={criterio.description || 'Sin descripción'}
            >
              <span>{criterio.name} (0-{criterio.maxScore})</span>
              <InformationCircleIcon className="h-4 w-4 text-gray-400" />
            </label>
            <select
              id={`scores.${index}.value`}
              {...form.register(`scores.${index}.value`, { valueAsNumber: true })}
              disabled={formStatus === ScoreStatus.SUBMITTED}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100"
            >
              {generateOptions(criterio.maxScore).map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
            <input
              type="hidden"
              {...form.register(`scores.${index}.criterioId`)}
              value={criterio.id}
            />
          </div>
        ))}

        <div className="flex flex-col justify-end rounded-md bg-gray-50 p-3 text-center lg:col-start-6">
          <span className="text-sm font-medium text-gray-500">Total Juez</span>
          <span className="text-3xl font-bold text-gray-900">{total}</span>
        </div>
      </div>

      <div className="mt-6 border-t pt-4">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notas (privadas)
        </label>
        <textarea
          id="notes"
          {...form.register('notes')}
          rows={2}
          disabled={formStatus === ScoreStatus.SUBMITTED}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100"
          placeholder="Comentarios sobre el participante..."
        />
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isPending || formStatus === ScoreStatus.SUBMITTED}
          className={`rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${
            formStatus === ScoreStatus.SUBMITTED
              ? 'cursor-not-allowed bg-green-600'
              : 'bg-blue-600 hover:bg-blue-700'
          } ${isPending ? 'animate-pulse' : ''}`}
        >
          {isPending
            ? 'Guardando...'
            : formStatus === ScoreStatus.SUBMITTED
            ? '✔ Enviado'
            : 'Enviar Puntaje Final'}
        </button>
      </div>
    </form>
  )
}