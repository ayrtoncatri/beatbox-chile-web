'use client';

import { generateBrackets } from '@/app/actions/admin/battles';
import {  useFormStatus } from 'react-dom';
import { RoundPhase } from '@prisma/client';
import { InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon, TrophyIcon, CogIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { useActionState } from 'react'

// --- (1) Definir los tipos de props ---
type Category = {
  id: string;
  name: string;
};

interface BracketGeneratorProps {
  eventoId: string;
  activeCategories: Category[]; // Las categorías activas para este evento
}

// --- (2) Filtrar las fases para mostrar solo las de Batalla ---
const battlePhases = Object.values(RoundPhase).filter(
  (phase) => phase !== 'WILDCARD' && phase !== 'PRELIMINAR'
);

// --- (3) Botón de Envío Estilizado ---
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white
                 shadow-sm transition-all hover:bg-indigo-500
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                 disabled:opacity-50 disabled:cursor-wait"
    >
      <CogIcon className={`w-5 h-5 ${pending ? 'animate-spin' : ''}`} />
      {pending ? 'Generando Llaves...' : 'Generar Llaves'}
    </button>
  );
}

// --- (4) Componente Principal del Formulario ---
export function BracketGenerator({ eventoId, activeCategories }: BracketGeneratorProps) {
  const initialState = { error: undefined, success: undefined, log: [] };
  const [state, dispatch] = useActionState(generateBrackets, initialState);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      
      {/* --- Título --- */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold leading-6 text-gray-900 flex items-center gap-2">
          <TrophyIcon className="w-6 h-6 text-indigo-600" />
          Generador de Llaves de Batalla
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Crea las batallas (Octavos, Cuartos, etc.) basado en el ranking del Showcase (Preliminar).
        </p>
      </div>

      {/* --- Formulario --- */}
      <form action={dispatch} className="p-6 space-y-6">
        <input type="hidden" name="eventoId" value={eventoId} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dropdown de Categoría */}
          <div>
            <label htmlFor="categoriaId" className="block text-sm font-semibold leading-6 text-gray-900">
              Categoría
            </label>
            <select
              id="categoriaId"
              name="categoriaId"
              required
              className="mt-2 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 shadow-sm
                         ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              {activeCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown de Fase */}
          <div>
            <label htmlFor="phase" className="block text-sm font-semibold leading-6 text-gray-900">
              Fase a Crear
            </label>
            <select
              id="phase"
              name="phase"
              required
              className="mt-2 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 shadow-sm
                         ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              {battlePhases.map((phase) => (
                <option key={phase} value={phase}>
                  {phase} (ej. 1v1)
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown de # de Participantes */}
          <div>
            <label htmlFor="participantCount" className="block text-sm font-semibold leading-6 text-gray-900">
              Nº de Participantes
            </label>
            <select
              id="participantCount"
              name="participantCount"
              required
              className="mt-2 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 shadow-sm
                         ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="32">Top 32 (Dieciseisavos)</option>
              <option value="16">Top 16 (Octavos)</option>
              <option value="8">Top 8 (Cuartos)</option>
              <option value="4">Top 4 (Semifinal)</option>
              <option value="2">Top 2 (Final)</option>
            </select>
          </div>
        </div>

        {/* --- Botón y Mensajes de Estado --- */}
        <div className="border-t border-gray-200 pt-6">
          <SubmitButton />
        </div>

        {/* --- Área de Resultados y Log (Estilizada) --- */}
        {(state.success || state.error || (state.log && state.log.length > 0)) && (
          <div className="mt-6 border-t border-gray-200 pt-6 space-y-4">
            
            {/* Mensaje de Éxito */}
            {state.success && (
              <div className="rounded-md bg-green-50 p-4 shadow-sm border border-green-200">
                <div className="flex">
                  <div className="flex-shrink-0"><CheckCircleIcon className="h-5 w-5 text-green-400" /></div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Éxito</h3>
                    <p className="mt-2 text-sm text-green-700">{state.success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje de Error */}
            {state.error && (
              <div className="rounded-md bg-red-50 p-4 shadow-sm border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0"><ExclamationTriangleIcon className="h-5 w-5 text-red-400" /></div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="mt-2 text-sm text-red-700">{state.error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Log de Proceso */}
            {state.log && state.log.length > 0 && (
              <div className="rounded-md bg-gray-900 p-6 shadow-lg">
                <div className="flex">
                  <div className="flex-shrink-0"><InformationCircleIcon className="h-5 w-5 text-indigo-400" /></div>
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
    </div>
  );
}