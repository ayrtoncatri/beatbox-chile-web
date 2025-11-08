// components/admin/eventos/CompetitionCategoryForm.tsx
'use client'

import { useFormStatus } from 'react-dom'
import { useRef , useActionState, useEffect } from 'react'
import { Categoria } from '@prisma/client'
import { upsertCompetitionCategoryAction } from '@/app/admin/eventos/actions'
import toast from 'react-hot-toast'

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
      className="rounded-md bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:from-purple-700 hover:to-purple-600 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      {pending ? 'Guardando...' : 'Guardar Cupos'}
    </button>
  )
}

export function CompetitionCategoryForm({ eventoId, allCategories }: CompetitionCategoryFormProps) {
  const initialState = { ok: false, error: undefined, message: undefined }
  const [state, dispatch] = useActionState(upsertCompetitionCategoryAction, initialState as any)

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message)
    } else if (state.error) {
      toast.error(`Error: ${state.error}`)
    }
  }, [state.ok, state.message, state.error])

  return (
    <div className="rounded-lg border border-blue-700/30 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg p-4 shadow-lg">
      <h3 className="mb-4 text-lg font-semibold text-white">
        1. Cupos y Categorías Activas
      </h3>
      <p className="mb-4 text-sm text-blue-200">Define cuántos cupos clasifican por Wildcard en cada categoría.</p>
      
      <form action={dispatch} className="space-y-4">
        <input type="hidden" name="eventoId" value={eventoId} />

        <div className="grid grid-cols-2 gap-4">
          {/* Selector de Categoría */}
          <div>
            <label htmlFor="categoriaId" className="block text-sm font-medium text-blue-200">
              Categoría
            </label>
            <select
              id="categoriaId"
              name="categoriaId"
              required
              className="mt-1 block w-full rounded-md border border-blue-700/50 bg-blue-950/50 text-blue-100 shadow-sm"
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
            <label htmlFor="wildcardSlots" className="block text-sm font-medium text-blue-200">
              Cupos Clasificados
            </label>
            <input
              id="wildcardSlots"
              name="wildcardSlots"
              type="number"
              defaultValue={0}
              required
              className="mt-1 block w-full rounded-md border border-blue-700/50 bg-blue-950/50 text-blue-100 placeholder:text-blue-400/50 shadow-sm"
              placeholder="Ej: 8"
            />
          </div>
        </div>

        {/* Botón de Envío */}
        <div className="mt-4 flex items-center justify-end gap-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}