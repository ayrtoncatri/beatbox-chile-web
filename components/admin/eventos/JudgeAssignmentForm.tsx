// components/admin/eventos/JudgeAssignmentForm.tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect, useRef } from 'react'
import { Categoria, User, Role, RoundPhase , UserRole } from '@prisma/client'
import { assignJudgeAction, type AssignJudgeState } from '@/app/admin/eventos/actions'

type UserRoleWithRole = UserRole & { role: Role };
type JudgeUser = User & { roles: UserRoleWithRole[] };

interface JudgeAssignmentFormProps {
    eventoId: string
    // Pasamos los jueces y categorías desde la página (Server Component)
    allJudges: JudgeUser[] 
    allCategories: Categoria[]
}

// Componente para el botón de Submit (muestra "Guardando...")
function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
            {pending ? 'Asignando...' : 'Asignar Juez'}
        </button>
    )
}

export function JudgeAssignmentForm({
    eventoId,
    allJudges,
    allCategories,
}: JudgeAssignmentFormProps) {

    // Usamos useFormState para manejar la respuesta de la Server Action
    const initialState: AssignJudgeState = {
        ok: false,
        error: undefined,
        message: undefined
    }
    const [state, dispatch] = useFormState(assignJudgeAction, initialState)

    // Ref para resetear el formulario después de un éxito
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state.ok === true) {
            // Limpiamos el formulario si la asignación fue exitosa
            formRef.current?.reset()
            // (Aquí podríamos mostrar un toast de éxito)
            alert(state.message || '¡Juez asignado!')
        }
        if (state.ok === false && state.error) {
            // (Aquí podríamos mostrar un toast de error)
            alert(`Error: ${state.error}`)
        }
    }, [state])

    // Obtenemos el array de valores del enum RoundPhase para el <select>
    const phases = Object.values(RoundPhase)

    return (
        <form
            ref={formRef}
            action={dispatch}
            className="rounded-lg border bg-white p-4 shadow"
        >
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Asignar Nuevo Juez
            </h3>

            {/* Input oculto para el ID del Evento */}
            <input type="hidden" name="eventoId" value={eventoId} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* --- Selector de Juez --- */}
                <div>
                    <label
                        htmlFor="judgeId"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Juez
                    </label>
                    <select
                        id="judgeId"
                        name="judgeId"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    >
                        <option value="">Seleccionar juez...</option>
                        {allJudges.map((judge) => (
                            <option key={judge.id} value={judge.id}>
                                {judge.email} {/* O judge.profile.nombres si lo tienes */}
                            </option>
                        ))}
                    </select>
                </div>

                {/* --- Selector de Categoría --- */}
                <div>
                    <label
                        htmlFor="categoriaId"
                        className="block text-sm font-medium text-gray-700"
                    >
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

                {/* --- Selector de Fase --- */}
                <div>
                    <label
                        htmlFor="phase"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Fase
                    </label>
                    <select
                        id="phase"
                        name="phase"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    >
                        <option value="">Seleccionar fase...</option>
                        {phases.map((phase) => (
                            <option key={phase} value={phase}>
                                {phase} {/* WILDCARD, CUARTOS, etc. */}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- Botón de Envío y Mensajes --- */}
            <div className="mt-4 flex items-center justify-end gap-4">
                {state.ok === false && state.error && (
                    <p className="text-sm text-red-600">{state.error}</p>
                )}
                <SubmitButton />
            </div>
        </form>
    )
}