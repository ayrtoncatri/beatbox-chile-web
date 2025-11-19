'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Criterio, ScoreStatus, RoundPhase } from '@prisma/client'
import { InformationCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { debounce } from 'lodash'
import toast from 'react-hot-toast'
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

import {
  submitScoreSchema,
  SubmitScorePayload,
} from '@/lib/schemas/judging'

import { submitScore } from '@/app/judge/actions'

// --- Tipos ---
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
    return null;
  }
  return null;
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
    mode: 'onChange',
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

  // 2. CÁLCULO DE TOTAL
  const watchedScores = useWatch({ control: form.control, name: 'scores' })

  useEffect(() => {
    const newTotal = watchedScores.reduce((acc, current) => {
        const val = isNaN(Number(current.value)) ? 0 : Number(current.value);
        return acc + val;
    }, 0)
    setTotal(newTotal)
  }, [watchedScores])


  // 3. AUTOSAVE
  useEffect(() => {
    const debouncedSave = debounce(async (payload: SubmitScorePayload) => {
      if (formStatus === ScoreStatus.SUBMITTED) return
      startTransition(async () => {
        await submitScore({ ...payload, status: ScoreStatus.DRAFT })
      })
    }, 2000)

    const subscription = form.watch((data) => {
      const result = submitScoreSchema.safeParse(data)
      if (result.success) {
        debouncedSave(result.data)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, formStatus, startTransition])


  // 4. SUBMIT FINAL
  const onSubmit = (data: SubmitScorePayload) => {
    if (formStatus === ScoreStatus.SUBMITTED) return

    const loadingToast = toast.loading('Enviando puntaje...');
    startTransition(async () => {
      const result = await submitScore({ ...data, status: ScoreStatus.SUBMITTED })
      if (result.success) {
        setFormStatus(ScoreStatus.SUBMITTED)
        toast.success('Puntaje enviado correctamente', { id: loadingToast })
      } else {
        toast.error(typeof result.error === 'string' ? result.error : 'Error al enviar', { id: loadingToast })
      }
    })
  }

  const participantName = wildcard.nombreArtistico || `${wildcard.user.profile?.nombres} ${wildcard.user.profile?.apellidoPaterno}`

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full transition-all space-y-6 md:space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-blue-50">
          {participantName}
        </h3>
      </div>

      {assignment.phase === RoundPhase.WILDCARD && videoId && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c12]">
            <LiteYouTubeEmbed id={videoId} title={`Wildcard de ${participantName}`} adNetwork={false} noCookie={true} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-3 lg:grid-cols-6">
        {criterios.map((criterio, index) => {
            const error = form.formState.errors.scores?.[index]?.value;
            
            // Desestructuramos el register para inyectar nuestra propia lógica de onChange
            const { onChange, ...restRegister } = form.register(`scores.${index}.value`, { 
                valueAsNumber: true,
                min: { value: 0, message: 'Mín 0' },
                max: { value: criterio.maxScore, message: `Máx ${criterio.maxScore}` }
            });

            return (
              <div key={criterio.id} className="relative">
                <label htmlFor={`scores.${index}.value`} className="flex items-center gap-1 text-sm font-semibold text-blue-100/90 mb-2">
                  <span className="truncate">{criterio.name}</span>
                  <span className="text-blue-400 text-xs ml-1">/{criterio.maxScore}</span>
                </label>
                
                <div className="relative">
                    <input
                      type="number"
                      id={`scores.${index}.value`}
                      min={0}
                      max={criterio.maxScore}
                      disabled={formStatus === ScoreStatus.SUBMITTED}
                      // Inyectamos las propiedades del register
                      {...restRegister}
                      // Lógica Custom para "Hard Cap"
                      onChange={(e) => {
                          let val = parseInt(e.target.value);
                          
                          // Si es NaN (borró todo), dejamos que el input esté vacío temporalmente
                          if (isNaN(val)) {
                             onChange(e);
                             return;
                          }

                          // VALIDACIÓN ESTRICTA EN TIEMPO REAL
                          if (val > criterio.maxScore) {
                              val = criterio.maxScore; // Lo bajamos al máximo
                              e.target.value = val.toString(); // Actualizamos visualmente
                              toast.error(`El máximo para ${criterio.name} es ${criterio.maxScore}`, { duration: 1500, position: 'bottom-center' });
                          } else if (val < 0) {
                              val = 0;
                              e.target.value = "0";
                          }

                          // Pasamos el evento modificado a React Hook Form
                          onChange(e);
                      }}
                      onFocus={(e) => e.target.select()} 
                      className={`
                        block w-full rounded-xl border bg-[#0c0c12] text-center text-2xl font-bold text-white shadow-sm p-3
                        focus:ring-2 focus:outline-none transition-all duration-200
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                        disabled:bg-neutral-800 disabled:text-neutral-500
                        ${error 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                            : 'border-white/10 focus:border-fuchsia-500 focus:ring-fuchsia-500/20 hover:border-white/20'
                        }
                      `}
                    />
                </div>
                {error && (
                    <div className="absolute -bottom-5 left-0 w-full text-center text-xs text-red-400 font-medium animate-pulse">
                        {error.message}
                    </div>
                )}
              </div>
            )
        })}

        <div className="flex flex-col justify-center items-center rounded-2xl bg-gradient-to-br from-white/5 to-white/0 p-4 text-center lg:col-start-6 border border-white/10 backdrop-blur-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200/60 mb-1">Total</span>
          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-fuchsia-400">
            {total}
          </span>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <label className="block text-sm font-semibold text-blue-100/90 mb-2">Feedback (Privado)</label>
        <textarea
          {...form.register('notes')}
          rows={2}
          disabled={formStatus === ScoreStatus.SUBMITTED}
          className="block w-full rounded-xl border border-white/10 bg-[#0c0c12] text-blue-50 shadow-sm p-3 focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 disabled:bg-neutral-800 resize-none"
          placeholder="Comentarios técnicos..."
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isPending || formStatus === ScoreStatus.SUBMITTED}
          className={`relative overflow-hidden rounded-full px-8 py-3 text-sm font-bold text-white shadow-lg transition-all 
          ${formStatus === ScoreStatus.SUBMITTED ? 'cursor-not-allowed bg-green-600' : 'bg-gradient-to-r from-fuchsia-600 to-sky-600 hover:shadow-fuchsia-500/25'}`}
          >
          {isPending ? 'Guardando...' : formStatus === ScoreStatus.SUBMITTED ? '✔ Enviado' : 'Confirmar Puntaje'}
        </button>
      </div>
    </form>
  )
}