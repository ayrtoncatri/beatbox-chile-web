'use client'

import { useFormStatus } from 'react-dom'
import { useEffect, useRef, useActionState } from 'react'
import { Categoria, User, Role, RoundPhase , UserRole } from '@prisma/client'
import { assignJudgeAction, type AssignJudgeState } from '@/app/admin/eventos/actions'
import toast from 'react-hot-toast'

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
            className="rounded-md bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
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
    const [state, dispatch] = useActionState(assignJudgeAction, initialState)

    // Ref para resetear el formulario después de un éxito
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state.ok === true) {
            // Limpiamos el formulario si la asignación fue exitosa
            formRef.current?.reset()
            toast.success(state.message || '¡Juez asignado correctamente!')
        }
        if (state.ok === false && state.error) {
            toast.error(`Error: ${state.error}`)
        }
    }, [state])

    // Obtenemos el array de valores del enum RoundPhase para el <select>
    const phases = Object.values(RoundPhase)

    return (
        <form
            ref={formRef}
            action={dispatch}
            className="rounded-lg border border-blue-700/30 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg p-4 shadow-lg"
        >
            <h3 className="mb-4 text-lg font-semibold text-white">
                Asignar Nuevo Juez
            </h3>

            {/* Input oculto para el ID del Evento */}
            <input type="hidden" name="eventoId" value={eventoId} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* --- Selector de Juez --- */}
                <div>
                    <label
                        htmlFor="judgeId"
                        className="block text-sm font-medium text-blue-200"
                    >
                        Juez
                    </label>
                    <select
                        id="judgeId"
                        name="judgeId"
                        required
                        className="mt-1 block w-full rounded-md border border-blue-700/50 bg-blue-950/50 text-blue-100 shadow-sm"
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
                        className="block text-sm font-medium text-blue-200"
                    >
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

                {/* --- Selector de Fase --- */}
                <div>
                    <label
                        htmlFor="phase"
                        className="block text-sm font-medium text-blue-200"
                    >
                        Fase
                    </label>
                    <select
                        id="phase"
                        name="phase"
                        required
                        className="mt-1 block w-full rounded-md border border-blue-700/50 bg-blue-950/50 text-blue-100 shadow-sm"
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
                    <p className="text-sm text-red-300">{state.error}</p>
                )}
                <SubmitButton />
            </div>
        </form>
    )
}