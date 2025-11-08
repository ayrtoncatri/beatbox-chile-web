'use client';

import { runCnClassification } from '@/app/actions/admin/classification';
import {  useFormStatus } from 'react-dom';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import {useActionState, useEffect} from 'react';
import toast from 'react-hot-toast';

// --- (1) Tipo de los eventos que recibe la página ---
type CNEvento = {
  id: string;
  nombre: string;
  fecha: Date;
};

// --- (2) Botón de envío con estado ---
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white
                 bg-gradient-to-r from-red-600 to-red-500 shadow-lg hover:from-red-700 hover:to-red-600 transition-colors
                 disabled:opacity-50 disabled:cursor-wait"
    >
      <ShieldCheckIcon className="w-5 h-5" />
      {pending ? 'Ejecutando Clasificación...' : 'Ejecutar Clasificación'}
    </button>
  );
}

// --- (3) Formulario Principal ---
export function ClassificationForm({ cnEventos }: { cnEventos: CNEvento[] }) {
  
  const initialState = { error: undefined, success: undefined, log: [] };
  const [state, dispatch] = useActionState(runCnClassification, initialState);

  // Obtener el año actual para el input
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state.success, state.error]);

  return (
    <form action={dispatch} className="space-y-6">
      
      {/* --- Inputs del Formulario --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="cnEventoId" className="block text-sm font-semibold leading-6 text-blue-200">
            Campeonato Nacional (Destino)
          </label>
          <p className="text-xs text-blue-300/70 mb-2">Selecciona el evento al cual se inscribirán los clasificados.</p>
          <select
            id="cnEventoId"
            name="cnEventoId"
            required
            className="block w-full rounded-md border-0 py-2 px-3 bg-blue-950/50 border-blue-700/50 text-blue-100 shadow-sm
                       ring-1 ring-inset ring-blue-700/50 placeholder:text-blue-400/50
                       focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
          >
            {cnEventos.length === 0 && <option value="">No hay eventos de CN creados</option>}
            {cnEventos.map((evento) => (
              <option key={evento.id} value={evento.id}>
                {evento.nombre} ({new Date(evento.fecha).getFullYear()})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="year" className="block text-sm font-semibold leading-6 text-blue-200">
            Año del Ciclo de Clasificación
          </label>
           <p className="text-xs text-blue-300/70 mb-2">Ingresa el año del cual se obtendrán los ganadores (ej. 2025).</p>
          <input
            type="number"
            id="year"
            name="year"
            required
            defaultValue={currentYear}
            className="block w-full rounded-md border-0 py-2 px-3 bg-blue-950/50 border-blue-700/50 text-blue-100 shadow-sm
                       ring-1 ring-inset ring-blue-700/50 placeholder:text-blue-400/50
                       focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      {/* --- Botón de Envío --- */}
      <div className="border-t border-blue-700/30 pt-6">
        <SubmitButton />
      </div>

      {/* --- (4) Área de Resultados y Log --- */}
      {(state.success || state.error || (state.log && state.log.length > 0)) && (
        <div className="mt-6 border-t border-blue-700/30 pt-6 space-y-4">
          
          {/* Mensaje de Éxito */}
          {state.success && (
            <div className="rounded-md bg-green-900/50 p-4 shadow-sm border border-green-700/30">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-300">Clasificación Exitosa</h3>
                  <div className="mt-2 text-sm text-green-200">
                    <p>{state.success}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de Error */}
          {state.error && (
            <div className="rounded-md bg-red-900/50 p-4 shadow-sm border border-red-700/30">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-300">Error en la Clasificación</h3>
                  <div className="mt-2 text-sm text-red-200">
                    <p>{state.error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Log de Proceso */}
          {state.log && state.log.length > 0 && (
            <div className="rounded-md bg-blue-950/80 p-6 shadow-lg border border-blue-700/30">
              <div className="flex">
                <div className="flex-shrink-0">
                  <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-300 mb-2">Log del Proceso</h3>
                  <div className="mt-2 text-sm text-blue-200 font-mono">
                    <ul role="list" className="space-y-1">
                      {state.log.map((entry, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-blue-400">&gt;</span>
                          <span>{entry}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </form>
  );
}