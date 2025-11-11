// components/judge/dashboard/JudgeScoreForm.tsx
'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Criterio, ScoreStatus, RoundPhase } from '@prisma/client'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { debounce } from 'lodash'
import toast from 'react-hot-toast'
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

import {
  submitScoreSchema,
  SubmitScorePayload,
} from '@/lib/schemas/judging'

import { submitScore } from '@/app/judge/actions'

type FullJudgeAssignment = {
  id: string
  eventoId: string
  categoriaId: string
  phase: RoundPhase
}
type FullWildcard = {
  id: string
  userId: string
  nombreArtistico: string | null
  youtubeUrl: string
  user: { id: string; profile: { nombres: string | null; apellidoPaterno: string | null } | null }
}
type FullScore = {
  status: ScoreStatus
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

function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;
    }
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
  } catch (error) {
    console.error("URL de YouTube inválida:", url, error);
    return null;
  }
  return null;
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

  const videoId = getYouTubeVideoId(wildcard.youtubeUrl);
  const form = useForm<SubmitScorePayload>({
    resolver: zodResolver(submitScoreSchema),
    defaultValues: {
      eventoId: assignment.eventoId,
      categoriaId: assignment.categoriaId,
      phase: assignment.phase,
      participantId: wildcard.userId,
      roundNumber: 1,
      notes: existingScore?.notes || undefined,
      status: existingScore?.status ?? ScoreStatus.DRAFT,

      scores: criterios.map((c) => {
        const existingDetail = existingScore?.details.find(
          (d) => d.criterioId === c.id
        )
        return {
          criterioId: c.id,
          value: existingDetail?.value ?? 0,
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

    const loadingToast = toast.loading('Enviando puntaje...');
    startTransition(async () => {
      const result = await submitScore({ ...data, status: ScoreStatus.SUBMITTED })
      if (result.success) {
        setFormStatus(ScoreStatus.SUBMITTED)
        toast.success('Puntaje enviado correctamente', { id: loadingToast })
      } else {
        console.error("Error al enviar el puntaje final:", result.error)
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : 'Error al enviar el puntaje';
        toast.error(errorMessage, { id: loadingToast })
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
      className="w-full transition-all space-y-6 md:space-y-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-blue-50">
          {participantName}
        </h3>
      </div>

      {assignment.phase === RoundPhase.WILDCARD && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c12]">
          {videoId ? (
            <LiteYouTubeEmbed
              id={videoId}
              title={`Wildcard de ${participantName}`}
              adNetwork={false}
              noCookie={true}
            />
          ) : (
            // Fallback si la URL es inválida
            <div className="aspect-video bg-neutral-900 flex items-center justify-center">
              <p className="text-red-300 font-semibold">
                URL de video inválida o no encontrada.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-3 lg:grid-cols-6">
        {criterios.map((criterio, index) => (
          <div key={criterio.id}>
            <label
              htmlFor={`scores.${index}.value`}
              className="flex items-center gap-1 text-sm font-semibold text-blue-100/90"
              title={criterio.description || 'Sin descripción'}
            >
              <span>{criterio.name} (0-{criterio.maxScore})</span>
              <InformationCircleIcon className="h-4 w-4 text-blue-300/70" />
            </label>
            <select
              id={`scores.${index}.value`}
              {...form.register(`scores.${index}.value`, { valueAsNumber: true })}
              disabled={formStatus === ScoreStatus.SUBMITTED}
              className="mt-1 block w-full rounded-lg border border-white/10 bg-[#0c0c12] text-blue-50 shadow-sm
              focus:border-fuchsia-400/40 focus:ring-2 focus:ring-fuchsia-400/30 disabled:bg-neutral-800"
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

        <div className="flex flex-col justify-end rounded-lg bg-white/5 p-4 text-center lg:col-start-6 border border-white/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-100/80">Total Juez</span>
          <span className="text-4xl md:text-5xl font-extrabold text-blue-50">{total}</span>
        </div>
      </div>

      <div className="mt-6 pt-4">
        <label htmlFor="notes" className="block text-sm font-semibold text-blue-100/90">
          Notas (privadas)
        </label>
        <textarea
          id="notes"
          {...form.register('notes')}
          rows={2}
          disabled={formStatus === ScoreStatus.SUBMITTED}
          className="mt-1 block w-full rounded-xl border border-white/10 bg-[#0c0c12] text-blue-50 shadow-sm
          placeholder:text-blue-200/40 focus:border-fuchsia-400/40 focus:ring-2 focus:ring-fuchsia-400/30
          disabled:bg-neutral-800"
          placeholder="Comentarios sobre el participante..."
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isPending || formStatus === ScoreStatus.SUBMITTED}
          className={`rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all
          ${formStatus === ScoreStatus.SUBMITTED
              ? 'cursor-not-allowed bg-green-600/90 hover:bg-green-600'
              : 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-sky-600 hover:from-fuchsia-500 hover:to-sky-500'
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