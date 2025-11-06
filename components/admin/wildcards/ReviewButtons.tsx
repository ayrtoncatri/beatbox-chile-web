'use client';

import { approveWildcard, rejectWildcard } from '@/app/admin/wildcards/actions';
import { WildcardStatus } from '@prisma/client';
import { useActionState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon, ClockIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import React from 'react';

type Status = WildcardStatus;

export default function ReviewButtons({ id, status, isInscrito }: { id: string; status: Status; isInscrito: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleApprove = () => {
    if (!confirm('¿Estás seguro de que quieres APROBAR este wildcard? Esto creará una inscripción.')) return;

    startTransition(async () => {
      const result = await approveWildcard(id);
      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        router.refresh(); 
      }
    });
  };

  const handleReject = () => {
    if (!confirm('¿Estás seguro de que quieres RECHAZAR este wildcard?')) return;

    startTransition(async () => {
      // --- (3) Llamada a la acción sin ID de admin ---
      const result = await rejectWildcard(id);
      if (result.error) {
        alert(`Error: ${result.error}`); // (O usa un toast)
      } else {
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
    if (isInscrito) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium 
                         bg-green-100 text-green-800">
          <CheckBadgeIcon className="w-4 h-4" />
          Inscrito
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium 
                         bg-yellow-100 text-yellow-800">
          <ClockIcon className="w-4 h-4" />
          Inscripción Pendiente
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