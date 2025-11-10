'use client';
import { approveWildcard, rejectWildcard } from '@/app/admin/wildcards/actions';
import { WildcardStatus } from '@prisma/client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon, ClockIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import React from 'react';
import toast from 'react-hot-toast';

type Status = WildcardStatus;

export default function ReviewButtons({ id, status, isClassified }: { id: string; status: Status; isClassified: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleApprove = () => {
    if (!confirm('¿Estás seguro de que quieres APROBAR este wildcard? El video será habilitado para evaluación de los jueces.')) return;

    const loadingToast = toast.loading('Aprobando wildcard...');
    startTransition(async () => {
      const result = await approveWildcard(id);
      if (result.error) {
        toast.error(`Error: ${result.error}`, { id: loadingToast });
      } else {
        toast.success('Wildcard aprobado correctamente', { id: loadingToast });
        router.refresh(); 
      }
    });
  };

  const handleReject = () => {
    if (!confirm('¿Estás seguro de que quieres RECHAZAR este wildcard?')) return;

    const loadingToast = toast.loading('Rechazando wildcard...');
    startTransition(async () => {
      // --- (3) Llamada a la acción sin ID de admin ---
      const result = await rejectWildcard(id);
      if (result.error) {
        toast.error(`Error: ${result.error}`, { id: loadingToast });
      } else {
        toast.success('Wildcard rechazado correctamente', { id: loadingToast });
        router.refresh();
      }
    });
  };

  // --- (4) LÓGICA DE RENDERIZADO CON NUEVOS ESTILOS TAILWIND ---

  // Estado: PENDIENTE (Mostrar botones de acción)
  if (status === WildcardStatus.PENDING) {
    return (
      <React.Fragment>
        <div className="flex flex-col gap-0.5">
          <button
          type="button"
          disabled={isPending}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white
                     bg-green-600 shadow-sm hover:bg-green-700 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleApprove}
        >
          <CheckCircleIcon className="w-4 h-4" />
          {isPending ? '...' : 'Aprobar'}
        </button>
        <button
          type="button"
          disabled={isPending}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white
                     bg-red-600 shadow-sm hover:bg-red-700 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleReject}
        >
          <XCircleIcon className="w-4 h-4" />
          {isPending ? '...' : 'Rechazar'}
        </button>
        </div>
      </React.Fragment>
    );
  }

  // Estado: APROBADO (Mostrar estado de inscripción)
  if (status === WildcardStatus.APPROVED) {
    if (isClassified) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border 
                         bg-green-900/50 text-green-300 border-green-700/30">
          <CheckBadgeIcon className="w-4 h-4" />
          Clasificado
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border 
                         bg-yellow-900/50 text-yellow-300 border-yellow-700/30">
          <ClockIcon className="w-4 h-4" />
            Pendiente de clasificación
        </span>
      );
    }
  }

  // Estado: RECHAZADO (Mostrar badge de rechazo)
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium 
                     bg-red-100 text-red-800">
      <XCircleIcon className="w-4 h-4" />
      Rechazado
    </span>
  );
}