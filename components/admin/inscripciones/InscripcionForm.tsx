'use client';

import { registerParticipantForLeague } from '@/app/actions/admin/inscripciones';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useState, useEffect } from 'react';
// (Importar íconos para los mensajes de estado)
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

// (Tipos de datos se mantienen)
type LigaData = {
  id: string;
  nombre: string;
  categorias: { id: string; name: string }[];
};
type UserData = { id: string; name: string };
interface FormProps {
  ligas: LigaData[];
  users: UserData[];
}

// --- Botón de Envío Estilizado ---
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      // (Clases de Tailwind para un botón de admin moderno)
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white 
                 shadow-sm transition-all hover:bg-indigo-500
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                 disabled:opacity-50 disabled:cursor-wait"
    >
      {pending ? 'Inscribiendo...' : 'Inscribir Participante'}
    </button>
  );
}

export function InscripcionForm({ ligas, users }: FormProps) {
  const initialState = { error: undefined, success: undefined };
  const [state, dispatch] = useActionState(registerParticipantForLeague, initialState);

  const [selectedLigaId, setSelectedLigaId] = useState<string>(ligas[0]?.id || '');
  const [availableCategories, setAvailableCategories] = useState(
    ligas[0]?.categorias || []
  );

  useEffect(() => {
    const selectedLiga = ligas.find((l) => l.id === selectedLigaId);
    setAvailableCategories(selectedLiga?.categorias || []);
  }, [selectedLigaId, ligas]);

  return (
    <form action={dispatch} className="space-y-6">
      
      {/* --- Selector de Liga (Estilo Claro) --- */}
      <div>
        <label htmlFor="eventoId" className="block text-sm font-semibold leading-6 text-gray-900">
          Seleccionar Liga (Evento)
        </label>
        <select
          id="eventoId"
          name="eventoId"
          required
          value={selectedLigaId}
          onChange={(e) => setSelectedLigaId(e.target.value)}
          // (Clases de Tailwind para un <select> moderno y claro)
          className="mt-2 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 shadow-sm
                     ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                     focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          {ligas.length === 0 && <option value="">No hay ligas publicadas</option>}
          {ligas.map((liga) => (
            <option key={liga.id} value={liga.id}>
              {liga.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* --- Selector de Categoría (Estilo Claro) --- */}
      <div>
        <label htmlFor="categoriaId" className="block text-sm font-semibold leading-6 text-gray-900">
          Categoría de la Liga
        </label>
        <select
          id="categoriaId"
          name="categoriaId"
          required
          disabled={availableCategories.length === 0}
          className="mt-2 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 shadow-sm
                     ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                     focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6
                     disabled:bg-gray-50 disabled:cursor-not-allowed"
        >
          {availableCategories.length > 0 ? (
            availableCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))
          ) : (
            <option value="">-- Esta liga no tiene categorías asignadas --</option>
          )}
        </select>
      </div>

      <div>
        <label htmlFor="nombreArtistico" className="block text-sm font-semibold leading-6 text-gray-900">
          Nombre Artístico (Beatboxer)
        </label>
        <input
          type="text"
          id="nombreArtistico"
          name="nombreArtistico"
          required
          placeholder="Ej: CYTRIX"
          className="mt-2 block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm
                     ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                     focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
      </div>

      {/* --- Selector de Usuario (Estilo Claro) --- */}
      <div>
        <label htmlFor="userId" className="block text-sm font-semibold leading-6 text-gray-900">
          Seleccionar Usuario (Participante)
        </label>
        <select
          id="userId"
          name="userId"
          required
          className="mt-2 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 shadow-sm
                     ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                     focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          {users.length === 0 && <option value="">No hay usuarios en el sistema</option>}
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {/* --- Botón y Mensajes de Estado Estilizados --- */}
      <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-6">
        <SubmitButton />

        {/* Mensaje de Éxito */}
        {state.success && (
          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
            <CheckCircleIcon className="h-5 w-5" />
            {state.success}
          </div>
        )}
        
        {/* Mensaje de Error */}
        {state.error && (
          <div className="flex items-center gap-2 text-sm font-medium text-red-600">
            <ExclamationTriangleIcon className="h-5 w-5" />
            {state.error}
          </div>
        )}
      </div>
    </form>
  );
}