'use client';

// Importamos la Server Action que creamos
import { registerParticipantForLeague } from '@/app/actions/admin/inscripciones';

// Hooks de React 19 para Server Actions y estado
import { useFormStatus } from 'react-dom'
import { useState, useEffect , useActionState } from 'react';

// --- Definimos los tipos de datos que este componente recibe como props ---
// (Estos tipos coinciden con lo que retorna 'getRegistrationFormData')

type LigaData = {
  id: string;
  nombre: string;
  categorias: { id: string; name: string }[];
};

type UserData = {
  id: string;
  name: string;
};

interface RegistrationFormProps {
  ligas: LigaData[];
  users: UserData[];
}

// --- Componente interno para el botón de envío ---
// Muestra un estado de carga mientras la Server Action se ejecuta
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 text-lg font-semibold text-white bg-blue-600 rounded-md shadow-sm
                 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Inscribiendo...' : 'Inscribir Participante'}
    </button>
  );
}

// --- Componente principal del formulario ---
export function RegistrationForm({ ligas, users }: RegistrationFormProps) {
  // 1. Hook 'useFormState' para manejar la respuesta de la Server Action
  const initialState = { error: undefined, success: undefined };
  const [state, dispatch] = useActionState(registerParticipantForLeague, initialState);

  // 2. Estado local para los dropdowns dinámicos
  // Seteamos el valor inicial del dropdown de Liga
  const [selectedLigaId, setSelectedLigaId] = useState<string>(ligas[0]?.id || '');
  
  // Seteamos las categorías iniciales basadas en esa Liga
  const [availableCategories, setAvailableCategories] = useState(
    ligas[0]?.categorias || []
  );

  // 3. 'useEffect' para actualizar las categorías cuando la Liga seleccionada cambia
  useEffect(() => {
    const selectedLiga = ligas.find((l) => l.id === selectedLigaId);
    setAvailableCategories(selectedLiga?.categorias || []);
  }, [selectedLigaId, ligas]); // Se ejecuta si 'selectedLigaId' o 'ligas' cambian

  return (
    // 'action={dispatch}' conecta este formulario a la Server Action
    <form action={dispatch} className="space-y-6">
      
      {/* --- Selector de Evento (Liga) --- */}
      <div>
        <label htmlFor="eventoId" className="block text-sm font-medium text-gray-300">
          Seleccionar Liga (Evento)
        </label>
        <select
          id="eventoId"
          name="eventoId"
          required
          value={selectedLigaId} // Controlado por el estado
          onChange={(e) => setSelectedLigaId(e.target.value)} // Actualiza el estado
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md
                     text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {ligas.map((liga) => (
            <option key={liga.id} value={liga.id}>
              {liga.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* --- Selector de Categoría (Dinámico) --- */}
      <div>
        <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-300">
          Categoría de la Liga
        </label>
        <select
          id="categoriaId"
          name="categoriaId"
          required
          // Se deshabilita si no hay categorías disponibles para la liga seleccionada
          disabled={availableCategories.length === 0}
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md
                     text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* --- Selector de Usuario (Participante) --- */}
      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-gray-300">
          Seleccionar Usuario (Participante)
        </label>
        <select
          id="userId"
          name="userId"
          required
          // (Nota: Para producción, si hay +100 usuarios, esto debería
          // ser un <Combobox> de búsqueda para mejor UX)
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md
                     text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {/* --- Mensajes de Estado (Error o Éxito) --- */}
      {state.error && (
        <p className="text-sm text-red-400 font-medium">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-400 font-medium">{state.success}</p>
      )}
      
      {/* --- Botón de Envío (con estado de carga) --- */}
      <SubmitButton />
    </form>
  );
}