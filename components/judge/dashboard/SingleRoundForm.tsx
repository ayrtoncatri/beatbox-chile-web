'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Criterio, ScoreStatus, RoundPhase } from '@prisma/client';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { debounce } from 'lodash';
import { submitScoreSchema, SubmitScorePayload } from '@/lib/schemas/judging';
import { submitScore } from '@/app/judge/actions';

// --- Tipos de Props ---
type FullJudgeAssignment = {
  eventoId: string;
  categoriaId: string;
  phase: RoundPhase;
}
type FullScore = {
  status: ScoreStatus;
  notes: string | null;
  details: { criterioId: string; value: number }[];
} | null;

interface SingleRoundFormProps {
  battleId: string;
  participantId: string;
  participantName: string;
  assignment: FullJudgeAssignment;
  criterios: Criterio[];
  roundNumber: 1 | 2;
  existingScore: FullScore;
  onScoreSubmitted: (participantId: string, roundNumber: 1 | 2) => void;
}

// Helper para generar <option>
const generateOptions = (max: number) => {
  return Array.from({ length: max + 1 }, (_, i) => i);
};

// --- (Componente Reutilizable para evaluar 1 Round) ---
export function SingleRoundForm({
  battleId,
  participantId,
  participantName,
  assignment,
  criterios,
  roundNumber,
  existingScore,
  onScoreSubmitted,
}: SingleRoundFormProps) {
  
  const [isPending, startTransition] = useTransition();
  const [total, setTotal] = useState(0);
  const [formStatus, setFormStatus] = useState(existingScore?.status || ScoreStatus.DRAFT);

  // 1. React-Hook-Form
  const form = useForm<SubmitScorePayload>({
    resolver: zodResolver(submitScoreSchema),
    
    defaultValues: {
      eventoId: assignment.eventoId,
      categoriaId: assignment.categoriaId,
      phase: assignment.phase,
      participantId: participantId,
      battleId: battleId,
      roundNumber: roundNumber,
      notes: existingScore?.notes || undefined,       
      status: existingScore?.status ?? ScoreStatus.DRAFT,
      scores: criterios.map((c) => {
        const existingDetail = existingScore?.details.find(
          (d) => d.criterioId === c.id
        );
        return {
          criterioId: c.id,
          value: existingDetail?.value ?? 0,
        };
      }),
    },
  });

  // 2. Cálculo de Total
  const watchedScores = useWatch({ control: form.control, name: 'scores' });
  useEffect(() => {
    const newTotal = watchedScores.reduce(
      (acc, current) => acc + Number(current.value || 0), 0
    );
    setTotal(newTotal);
  }, [watchedScores]);

  
  // 3. Lógica de Autosave (DRAFT) - REFACTORIZADA
  // <-- (SOLUCIÓN BUG 2: Parte 1) Usamos useRef para mantener una referencia estable a la función
  const debouncedSaveRef = useRef(
    debounce(async (payload: SubmitScorePayload) => {
      // El estado del form ya está en DRAFT, solo llamamos a la acción
      startTransition(async () => {
        await submitScore({ ...payload, status: ScoreStatus.DRAFT });
      });
    }, 2000)
  );

  useEffect(() => {
    // No suscribir al autosave si el formulario ya se envió final
    if (formStatus === ScoreStatus.SUBMITTED) {
      return;
    }

    const subscription = form.watch((data) => {
      const result = submitScoreSchema.safeParse(data);
      if (result.success) {
        // Llamamos a la función de debounce a través de la referencia
        debouncedSaveRef.current(result.data);
      }
    });

    return () => {
      subscription.unsubscribe();
      // Cancelamos cualquier debounce pendiente si el componente se desmonta o el efecto re-ejecuta
      debouncedSaveRef.current.cancel();
    };
  }, [form, formStatus]); // <-- Dependencias limpias

  // 4. Envío Final (SUBMITTED) - REFACTORIZADO
  const onSubmit = (data: SubmitScorePayload) => {
    if (formStatus === ScoreStatus.SUBMITTED) return;

    // --- ¡LA SOLUCIÓN CLAVE (Bug 2: Parte 2)! ---
    // Cancelamos cualquier autosave DRAFT pendiente ANTES de enviar el SUBMITTED.
    debouncedSaveRef.current.cancel();
    // ---------------------------------------------

    startTransition(async () => {
      const result = await submitScore({ ...data, status: ScoreStatus.SUBMITTED });
      if (result.success) {
        setFormStatus(ScoreStatus.SUBMITTED);

        // --- ¡LA SOLUCIÓN (Bug 1: Parte 3)! ---
        // Notificar al componente padre que este round específico
        // ha sido enviado exitosamente.
        onScoreSubmitted(participantId, roundNumber);
        // ------------------------------------------
      } else {
        console.error('Error al enviar el puntaje final:', result.error);
        alert('Error al enviar: ' + JSON.stringify(result.error));
      }
    });
  };

  // 5. Renderizado (JSX)
  return (
    <form 
      onSubmit={form.handleSubmit(onSubmit)} 
      // (Estilo más sutil para el formulario anidado)
      className="rounded-lg border bg-gray-50 p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <h4 className="text-lg font-semibold text-gray-800">
          {participantName} - <span className="text-indigo-600">Round {roundNumber}</span>
        </h4>
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
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

        <div className="flex flex-col justify-end rounded-md bg-white p-3 text-center lg:col-start-6 border">
          <span className="text-sm font-medium text-gray-500">Total Round</span>
          <span className="text-3xl font-bold text-gray-900">{total}</span>
        </div>
      </div>

      <div className="mt-6 border-t pt-4">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notas (Round {roundNumber})
        </label>
        <textarea
          id="notes"
          {...form.register('notes')}
          rows={2}
          disabled={formStatus === ScoreStatus.SUBMITTED}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
          placeholder="Comentarios sobre este round..."
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
            ? `✔ Round ${roundNumber} Enviado`
            : `Enviar Round ${roundNumber}`}
        </button>
      </div>
    </form>
  )
}