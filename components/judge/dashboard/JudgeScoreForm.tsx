'use client'

import { useEffect, useState, useTransition, useCallback, useMemo  } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Criterio, ScoreStatus, RoundPhase } from '@prisma/client'
import { debounce } from 'lodash'
import toast from 'react-hot-toast'
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import { CheckCircleIcon } from '@heroicons/react/24/solid' 

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
  onDataChange?: (participantId: string, data: SubmitScorePayload | null, isValid: boolean) => void
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
  onDataChange
}: JudgeScoreFormProps) {

  const [isPending, startTransition] = useTransition()
  const [total, setTotal] = useState(0)
  
  // Estado local inicial
  const [formStatus, setFormStatus] = useState(existingScore?.status || ScoreStatus.DRAFT)
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  // === NUEVO: Sincronización de Estado ===
  // Si el padre (JudgePanel) nos manda un existingScore nuevo (ej: después del Bulk Submit),
  // actualizamos el estado local para reflejar que ya está SUBMITTED.
  useEffect(() => {
    if (existingScore?.status && existingScore.status !== formStatus) {
      setFormStatus(existingScore.status)
    }
  }, [existingScore, formStatus])
  // ======================================

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
          value: existingDetail?.value ?? undefined, 
        }
      }),
    },
  })

  const watchedScores = useWatch({ control: form.control, name: 'scores' })
  const watchedNotes = useWatch({ control: form.control, name: 'notes' })

  const isFormComplete = watchedScores.every(s => typeof s.value === 'number' && !isNaN(s.value));

  // AUTOSAVE (Debounce 2.5s)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedDraftSave = useMemo(
  () =>
    debounce(async (payload: SubmitScorePayload) => {
      try {
        setIsAutoSaving(true)
        const res = await submitScore({ ...payload, status: ScoreStatus.DRAFT })
        if (!res.success) {
          console.error('Error autosave:', res.error)
        }
      } finally {
        setIsAutoSaving(false)
      }
    }, 2500),
  []
)

  useEffect(() => {
  // a) Total
  const newTotal = watchedScores.reduce((acc, current) => {
    const val = isNaN(Number(current.value)) ? 0 : Number(current.value)
    return acc + val
  }, 0)
  setTotal(newTotal)

  // Si ya está SUBMITTED, cancelamos cualquier autosave pendiente y salimos
  if (formStatus === ScoreStatus.SUBMITTED) {
    debouncedDraftSave.cancel()
    return
  }

  // b) Lógica de estado + comunicación con el padre
  if (isFormComplete) {
    const currentValues = form.getValues()

    // Payload que el padre usará para el envío masivo (SUBMITTED)
    const payloadForParent: SubmitScorePayload = {
      ...currentValues,
      status: ScoreStatus.SUBMITTED,
    }

    // Payload que usará el autosave (DRAFT)
    const payloadForDraft: SubmitScorePayload = {
      ...currentValues,
      status: ScoreStatus.DRAFT,
    }

    if (onDataChange) {
      onDataChange(wildcard.userId, payloadForParent, true)
    }

    // Guardado automático en DRAFT
    debouncedDraftSave(payloadForDraft)
  } else {
    // Formulario incompleto -> no está listo para envío masivo
    if (onDataChange) {
      onDataChange(wildcard.userId, null, false)
    }
    debouncedDraftSave.cancel()
  }
}, [
  watchedScores,
  watchedNotes,
  form,
  wildcard.userId,
  onDataChange,
  formStatus,
  isFormComplete,
  debouncedDraftSave,
])


  const onSubmit = (data: SubmitScorePayload) => {
    if (formStatus === ScoreStatus.SUBMITTED) return
    const loadingToast = toast.loading('Enviando...');
    startTransition(async () => {
      const result = await submitScore({ ...data, status: ScoreStatus.SUBMITTED })
      if (result.success) {
        setFormStatus(ScoreStatus.SUBMITTED)
        toast.success('Enviado', { id: loadingToast })
        if (onDataChange) onDataChange(wildcard.userId, null, false); 
      } else {
        toast.error('Error', { id: loadingToast })
      }
    })
  }

  const participantName = wildcard.nombreArtistico || `${wildcard.user.profile?.nombres || ''} ${wildcard.user.profile?.apellidoPaterno || ''}`

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={`w-full transition-all space-y-6 md:space-y-8 ${formStatus === ScoreStatus.SUBMITTED ? 'opacity-60 grayscale-[0.5]' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-blue-50 flex items-center gap-3">
          {participantName}
          {isAutoSaving && <span className="text-xs font-normal text-blue-400 animate-pulse">Guardando...</span>}
          {formStatus === ScoreStatus.SUBMITTED && <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">ENVIADO</span>}
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
                      disabled={formStatus === ScoreStatus.SUBMITTED}
                      {...restRegister}
                      onChange={(e) => {
                          let val = parseInt(e.target.value);
                          if (isNaN(val)) { onChange(e); return; }
                          if (val > criterio.maxScore) {
                              val = criterio.maxScore;
                              e.target.value = val.toString();
                              toast.error(`Máximo: ${criterio.maxScore}`, { duration: 1000, position: 'bottom-center', style: { background: '#333', color: '#fff', fontSize: '12px'} });
                          } else if (val < 0) {
                              val = 0;
                              e.target.value = "0";
                          }
                          onChange(e);
                      }}
                      onFocus={(e) => e.target.select()} 
                      className={`
                        block w-full rounded-xl border bg-[#0c0c12] text-center text-2xl font-bold text-white shadow-sm p-3
                        focus:ring-2 focus:outline-none transition-all duration-200
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                        disabled:bg-neutral-900/50 disabled:text-neutral-500 disabled:border-transparent
                        ${error 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                            : (formStatus === ScoreStatus.SUBMITTED || isFormComplete)
                                ? 'border-green-500/40 text-green-400 bg-green-500/5'
                                : 'border-white/10 focus:border-fuchsia-500 focus:ring-fuchsia-500/20 hover:border-white/20'
                        }
                      `}
                    />
                </div>
              </div>
            )
        })}

        <div className={`flex flex-col justify-center items-center rounded-2xl p-4 text-center lg:col-start-6 border backdrop-blur-sm transition-colors duration-300 ${isFormComplete ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-gradient-to-br from-white/5 to-white/0'}`}>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200/60 mb-1">Total</span>
          <span className={`text-5xl font-black text-transparent bg-clip-text ${isFormComplete ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-blue-400 to-fuchsia-400'}`}>
            {total}
          </span>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <label className="block text-sm font-semibold text-blue-100/90 mb-2">Feedback (Privado)</label>
        <textarea
          {...form.register('notes')}
          rows={1}
          disabled={formStatus === ScoreStatus.SUBMITTED}
          className="block w-full rounded-xl border border-white/10 bg-[#0c0c12] text-blue-50 shadow-sm p-3 focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 disabled:bg-neutral-800 resize-none text-sm"
          placeholder="Opcional..."
        />
      </div>

      <div className="mt-6 flex justify-end">
        {formStatus === ScoreStatus.SUBMITTED ? (
             // CASO: YA ENVIADO (Desde servidor o local) -> Bloqueado
             <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold">
                <CheckCircleIcon className="w-5 h-5" /> Puntaje Enviado
             </div>
        ) : isFormComplete ? (
             // CASO: LISTO (Pero no enviado) -> Botón oculto, badge de "Listo"
             <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                 <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-full border border-green-400/20 shadow-[0_0_15px_rgba(74,222,128,0.1)]">
                    <CheckCircleIcon className="w-5 h-5" /> 
                    <span className="text-sm font-bold">Listo para Envío Masivo</span>
                 </div>
                 
                 <button
                   type="submit"
                   disabled={isPending}
                   className="text-xs text-white/30 hover:text-white/80 transition-colors underline decoration-dotted underline-offset-4"
                 >
                    Enviar solo este
                 </button>
             </div>
        ) : (
             // CASO: INCOMPLETO -> Botón visible
             <button
               type="submit"
               disabled={isPending}
               className="relative overflow-hidden rounded-full px-8 py-3 text-sm font-bold text-white shadow-lg transition-all bg-[#1a1a24] border border-white/10 hover:border-white/30 hover:bg-[#252530]"
               >
               {isPending ? 'Guardando...' : 'Confirmar Individualmente'}
             </button>
        )}
      </div>
    </form>
  )
}