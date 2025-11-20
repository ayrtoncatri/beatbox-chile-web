'use client';

import { generateBrackets } from '@/app/actions/admin/battles';
import {  useFormStatus } from 'react-dom';
import { RoundPhase } from '@prisma/client';
import { InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon, TrophyIcon, CogIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { useState, useEffect, useActionState } from 'react'

const PHASE_PARTICIPANTS_MAP: Record<string, number> = {
  "OCTAVOS": 16,
  "CUARTOS": 8,
  "SEMIFINAL": 4,
  "TERCER_LUGAR": 2,
  "FINAL": 2
};

type Category = {
  id: string;
  name: string;
};

interface BracketGeneratorProps {
  eventoId: string;
  activeCategories: Category[]; 
}

const battlePhases = Object.values(RoundPhase).filter(
  (phase) => phase !== 'WILDCARD' && phase !== 'PRELIMINAR'
);


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

export function BracketGenerator({ eventoId, activeCategories }: BracketGeneratorProps) {
  const initialState = { error: undefined, success: undefined, log: [] };
  const [state, dispatch] = useActionState(generateBrackets, initialState);

  const [selectedPhase, setSelectedPhase] = useState<string>(
    battlePhases.includes(RoundPhase.OCTAVOS) ? RoundPhase.OCTAVOS : battlePhases[0]
  );
  
  const [participantCount, setParticipantCount] = useState<number>(16);

  // Efecto: Cuando cambia la fase, actualiza automáticamente el número de participantes requeridos
  useEffect(() => {
    const count = PHASE_PARTICIPANTS_MAP[selectedPhase] || 0;
    setParticipantCount(count);
  }, [selectedPhase]);

  return (
    <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 rounded-2xl shadow-lg overflow-hidden">
      
      {/* --- Título --- */}
      <div className="px-6 py-4 border-b border-blue-700/30">
        <h3 className="text-lg font-semibold leading-6 text-blue-200 flex items-center gap-2">
          <TrophyIcon className="w-6 h-6 text-blue-400" />
          Generador de Llaves de Batalla
        </h3>
        <p className="mt-1 text-sm text-blue-300/70">
          Crea las batallas (Octavos, Cuartos, etc.) basado en el ranking del Showcase (Preliminar).
        </p>
      </div>

      {/* --- Formulario --- */}
      <form action={dispatch} className="p-6 space-y-6">
        <input type="hidden" name="eventoId" value={eventoId} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dropdown de Categoría */}
          <div>
            <label htmlFor="categoriaId" className="block text-sm font-semibold leading-6 text-blue-300">
              Categoría
            </label>
            <select
              id="categoriaId"
              name="categoriaId"
              required
              className="mt-2 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 bg-blue-950/50 border-blue-700/50 text-blue-100 shadow-sm
                         ring-1 ring-inset ring-blue-700/50 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
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
            <label htmlFor="phase" className="block text-sm font-semibold leading-6 text-blue-300">
              Fase a Crear
            </label>
            <select
              id="phase"
              name="phase"
              required
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="mt-2 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 bg-blue-950/50 border-blue-700/50 text-blue-100 shadow-sm ring-1 ring-inset ring-blue-700/50 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
            >
              {battlePhases.map((phase) => (
                <option key={phase} value={phase}>
                  {phase}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown de # de Participantes */}
          <div>
            <label htmlFor="participantCountDisplay" className="block text-sm font-semibold leading-6 text-blue-300">
              Nº de Participantes (Auto)
            </label>
            
            {/* Input visual deshabilitado para UX */}
            <input 
                type="text" 
                id="participantCountDisplay"
                value={`Top ${participantCount}`}
                readOnly
                disabled
                className="mt-2 block w-full rounded-md border-0 py-2.5 pl-3 bg-blue-900/30 text-blue-400 shadow-sm ring-1 ring-inset ring-blue-800/50 sm:text-sm sm:leading-6 cursor-not-allowed font-mono"
            />
            
            {/* Input hidden real para enviar el valor al Server Action */}
            <input type="hidden" name="participantCount" value={participantCount} />
          </div>
        </div>

        {/* --- Botón y Mensajes de Estado --- */}
        <div className="border-t border-blue-700/30 pt-6">
          <SubmitButton />
        </div>

        {/* --- Área de Resultados y Log (Estilizada) --- */}
        {(state.success || state.error || (state.log && state.log.length > 0)) && (
          <div className="mt-6 border-t border-blue-700/30 pt-6 space-y-4">
            
            {/* Mensaje de Éxito */}
            {state.success && (
              <div className="rounded-md bg-green-900/50 p-4 shadow-sm border border-green-700/30">
                <div className="flex">
                  <div className="flex-shrink-0"><CheckCircleIcon className="h-5 w-5 text-green-400" /></div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-300">Éxito</h3>
                    <p className="mt-2 text-sm text-green-200">{state.success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje de Error */}
            {state.error && (
              <div className="rounded-md bg-red-900/50 p-4 shadow-sm border border-red-700/30">
                <div className="flex">
                  <div className="flex-shrink-0"><ExclamationTriangleIcon className="h-5 w-5 text-red-400" /></div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-300">Error</h3>
                    <p className="mt-2 text-sm text-red-200">{state.error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Log de Proceso */}
            {state.log && state.log.length > 0 && (
              <div className="rounded-md bg-blue-950/80 p-6 shadow-lg border border-blue-700/30">
                <div className="flex">
                  <div className="flex-shrink-0"><InformationCircleIcon className="h-5 w-5 text-blue-400" /></div>
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
    </div>
  );
}