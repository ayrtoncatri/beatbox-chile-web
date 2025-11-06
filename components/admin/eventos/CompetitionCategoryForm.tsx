// components/admin/eventos/CompetitionCategoryForm.tsx
'use client'

import { useFormStatus } from 'react-dom'
import { useRef , useActionState } from 'react'
import { Categoria } from '@prisma/client'
import { upsertCompetitionCategoryAction } from '@/app/admin/eventos/actions'

interface CompetitionCategoryFormProps {
  eventoId: string
  allCategories: Categoria[] // Todas las categorías posibles (SOLO, LOOPSTATION, etc.)
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      {pending ? 'Guardando...' : 'Guardar Cupos'}
    </button>
  )
}

export function CompetitionCategoryForm({ eventoId, allCategories }: CompetitionCategoryFormProps) {
  const initialState = { ok: false, error: undefined, message: undefined }
  const [state, dispatch] = useActionState(upsertCompetitionCategoryAction, initialState as any)

  return (
    <div className="rounded-lg border border-purple-300 bg-white p-4 shadow">
      <h3 className="mb-4 text-lg font-semibold text-purple-900">
        1. Cupos y Categorías Activas
      </h3>
      <p className="mb-4 text-sm text-gray-600">Define cuántos cupos clasifican por Wildcard en cada categoría.</p>
      
      <form action={dispatch} className="space-y-4">
        <input type="hidden" name="eventoId" value={eventoId} />

        <div className="grid grid-cols-2 gap-4">
          {/* Selector de Categoría */}
          <div>
            <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              id="categoriaId"
              name="categoriaId"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Seleccionar categoría...</option>
              {allCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campo de Cupos */}
          <div>
            <label htmlFor="wildcardSlots" className="block text-sm font-medium text-gray-700">
              Cupos Clasificados
            </label>
            <input
              id="wildcardSlots"
              name="wildcardSlots"
              type="number"
              defaultValue={0}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Ej: 8"
            />
          </div>
        </div>

        {/* Botón de Envío y Mensajes */}
        <div className="mt-4 flex items-center justify-end gap-4">
          {state.error && (
            <p className="text-sm text-red-600">Error: {state.error}</p>
          )}
          {state.message && state.ok && (
            <p className="text-sm text-green-600">{state.message}</p>
          )}
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}