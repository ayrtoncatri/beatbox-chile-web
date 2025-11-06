'use client';

import { runCnClassification } from '@/app/actions/admin/classification';
import {  useFormStatus } from 'react-dom';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import {useActionState} from 'react';

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
                 bg-red-600 shadow-sm hover:bg-red-700 transition-colors
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

  return (
    <form action={dispatch} className="space-y-6">
      
      {/* --- Inputs del Formulario --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="cnEventoId" className="block text-sm font-semibold leading-6 text-gray-900">
            Campeonato Nacional (Destino)
          </label>
          <p className="text-xs text-gray-500 mb-2">Selecciona el evento al cual se inscribirán los clasificados.</p>
          <select
            id="cnEventoId"
            name="cnEventoId"
            required
            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm
                       ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                       focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
          <label htmlFor="year" className="block text-sm font-semibold leading-6 text-gray-900">
            Año del Ciclo de Clasificación
          </label>
           <p className="text-xs text-gray-500 mb-2">Ingresa el año del cual se obtendrán los ganadores (ej. 2025).</p>
          <input
            type="number"
            id="year"
            name="year"
            required
            defaultValue={currentYear}
            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm
                       ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                       focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      {/* --- Botón de Envío --- */}
      <div className="border-t border-gray-200 pt-6">
        <SubmitButton />
      </div>

      {/* --- (4) Área de Resultados y Log --- */}
      {(state.success || state.error || (state.log && state.log.length > 0)) && (
        <div className="mt-6 border-t border-gray-200 pt-6 space-y-4">
          
          {/* Mensaje de Éxito */}
          {state.success && (
            <div className="rounded-md bg-green-50 p-4 shadow-sm border border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Clasificación Exitosa</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{state.success}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de Error */}
          {state.error && (
            <div className="rounded-md bg-red-50 p-4 shadow-sm border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error en la Clasificación</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{state.error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Log de Proceso */}
          {state.log && state.log.length > 0 && (
            <div className="rounded-md bg-gray-900 p-6 shadow-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <InformationCircleIcon className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-indigo-300 mb-2">Log del Proceso</h3>
                  <div className="mt-2 text-sm text-gray-300 font-mono">
                    <ul role="list" className="space-y-1">
                      {state.log.map((entry, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-gray-500">&gt;</span>
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