'use client';

import { registerParticipantForLeague } from '@/app/actions/admin/inscripciones';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

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
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white 
                 shadow-lg transition-all hover:from-blue-700 hover:to-blue-600
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
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

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state.success, state.error]);

  return (
    <form action={dispatch} className="space-y-6">
      
      {/* --- Selector de Liga (Estilo Oscuro) --- */}
      <div>
        <label htmlFor="eventoId" className="block text-sm font-semibold leading-6 text-blue-200">
          Seleccionar Liga (Evento)
        </label>
        <select
          id="eventoId"
          name="eventoId"
          required
          value={selectedLigaId}
          onChange={(e) => setSelectedLigaId(e.target.value)}
          className="mt-2 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 bg-blue-950/50 border-blue-700/50 text-blue-100 shadow-sm
                     ring-1 ring-inset ring-blue-700/50 placeholder:text-blue-400/50
                     focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
        >
          {ligas.length === 0 && <option value="">No hay ligas publicadas</option>}
          {ligas.map((liga) => (
            <option key={liga.id} value={liga.id}>
              {liga.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* --- Selector de Categoría (Estilo Oscuro) --- */}
      <div>
        <label htmlFor="categoriaId" className="block text-sm font-semibold leading-6 text-blue-200">
          Categoría de la Liga
        </label>
        <select
          id="categoriaId"
          name="categoriaId"
          required
          disabled={availableCategories.length === 0}
          className="mt-2 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 bg-blue-950/50 border-blue-700/50 text-blue-100 shadow-sm
                     ring-1 ring-inset ring-blue-700/50 placeholder:text-blue-400/50
                     focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6
                     disabled:bg-blue-900/30 disabled:text-blue-300/50 disabled:cursor-not-allowed"
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
        <label htmlFor="nombreArtistico" className="block text-sm font-semibold leading-6 text-blue-200">
          Nombre Artístico (Beatboxer)
        </label>
        <input
          type="text"
          id="nombreArtistico"
          name="nombreArtistico"
          required
          placeholder="Ej: CYTRIX"
          className="mt-2 block w-full rounded-md border-0 py-2.5 px-3 bg-blue-950/50 border-blue-700/50 text-blue-100 shadow-sm
                     ring-1 ring-inset ring-blue-700/50 placeholder:text-blue-400/50
                     focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
        />
      </div>

      {/* --- Selector de Usuario (Estilo Oscuro) --- */}
      <div>
        <label htmlFor="userId" className="block text-sm font-semibold leading-6 text-blue-200">
          Seleccionar Usuario (Participante)
        </label>
        <select
          id="userId"
          name="userId"
          required
          className="mt-2 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 bg-blue-950/50 border-blue-700/50 text-blue-100 shadow-sm
                     ring-1 ring-inset ring-blue-700/50 placeholder:text-blue-400/50
                     focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
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
      <div className="flex items-center justify-between gap-4 border-t border-blue-700/30 pt-6">
        <SubmitButton />
      </div>
    </form>
  );
}