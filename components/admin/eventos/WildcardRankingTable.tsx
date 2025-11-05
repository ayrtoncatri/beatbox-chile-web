// components/admin/eventos/WildcardRankingTable.tsx
'use client'

import { useFormState } from 'react-dom'
import { RoundPhase } from '@prisma/client'
import {
    getWildcardRanking,
    classifyWildcardsAction,
    RankingResult,
} from '@/app/admin/eventos/actions'
import { useEffect, useState } from 'react'

interface WildcardRankingTableProps {
    eventoId: string
    // La lista de categorías activas para este evento (SOLO, LOOPSTATION, etc.)
    allCategories: { id: string; name: string }[]
}

// Componente para manejar el estado del botón de clasificación
function ClassifyButton() {
    const { pending } = useFormState(classifyWildcardsAction, { ok: true }) as any // Simplemente para obtener el estado
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
            {pending ? 'Clasificando...' : 'Marcar Seleccionados como Clasificados'}
        </button>
    )
}

/**
 * Componente que muestra el ranking en vivo y el formulario de clasificación.
 */
export function WildcardRankingTable({
    eventoId,
    allCategories,
}: WildcardRankingTableProps) {

    const [selectedCategory, setSelectedCategory] = useState(allCategories[0]?.name || '')
    const [ranking, setRanking] = useState<RankingResult[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Estado para el formulario de Server Action
    const initialState = { ok: false, error: undefined, message: undefined } // <-- CORREGIDO
    const [state, dispatch] = useFormState(classifyWildcardsAction, initialState as any)

    // 1. FETCH ASÍNCRONO del Ranking (Hook para el cliente)
    useEffect(() => {
        async function fetchRanking() {
            if (!selectedCategory) return
            setLoading(true)
            try {
                // Llamamos a la Server Function (no Action) para obtener los datos
                const result = await getWildcardRanking(
                    eventoId,
                    selectedCategory,
                    RoundPhase.WILDCARD // Solo mostramos wildcards por ahora
                )
                setRanking(result)
                // Reiniciamos las selecciones
                setSelectedIds([])
            } catch (e) {
                console.error('Error fetching ranking:', e)
            } finally {
                setLoading(false)
            }
        }
        fetchRanking()
    }, [eventoId, selectedCategory, state.ok]) // Dependencia en state.ok para refrescar después de clasificar

    // 2. Manejo de Checkboxes
    const handleCheckboxChange = (wildcardId: string, isChecked: boolean) => {
        setSelectedIds(prev =>
            isChecked
                ? [...prev, wildcardId]
                : prev.filter(id => id !== wildcardId)
        )
    }

    // 3. Manejo de la respuesta de la clasificación
    useEffect(() => {
        if (state.ok === true) {
            alert(state.message) // Mensaje de éxito
        }
        if (state.ok === false && state.error) {
            alert(`Error al clasificar: ${state.error}`)
        }
    }, [state])

    if (!allCategories.length) {
        return <p>Este evento no tiene categorías de competición definidas.</p>
    }

    return (
        <div className="space-y-6">
            {/* Selector de Categoría */}
            <div className="flex items-center space-x-4">
                <label htmlFor="category" className="font-medium">
                    Categoría:
                </label>
                <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded-md border-gray-300 py-2 pl-3 pr-10 shadow-sm"
                >
                    {allCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tabla de Ranking y Formulario de Clasificación */}
            <form action={dispatch}>
                <input type="hidden" name="eventoId" value={eventoId} />

                <div className="overflow-x-auto rounded-lg shadow-xl">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clasificar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beatboxer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nota Final</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jueces</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="py-4 text-center text-gray-500">Cargando ranking...</td>
                                </tr>
                            )}
                            {!loading && ranking.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-4 text-center text-gray-500">Aún no hay puntajes SUBMITTED para esta categoría.</td>
                                </tr>
                            )}
                            {ranking.map((r) => (
                                <tr key={r.wildcardId}>
                                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">{r.rank}</td>
                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                                        <input
                                            type="checkbox"
                                            name="wildcardIds"
                                            value={r.wildcardId}
                                            checked={r.isClassified || selectedIds.includes(r.wildcardId)}
                                            onChange={(e) => handleCheckboxChange(r.wildcardId, e.target.checked)}
                                            // Si ya está clasificado, no permitimos desmarcar (solo admin podría hacerlo con otra action)
                                            disabled={r.isClassified}
                                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        {r.nombreArtistico || r.participantId}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-600">
                                        {r.avgScore.toFixed(2)}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {r.totalJudges}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        {r.isClassified ? (
                                            <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                Clasificado
                                            </span>
                                        ) : (
                                            <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                                                Pendiente
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Botón de Clasificación */}
                <div className="mt-4 flex justify-end">
                    <ClassifyButton />
                </div>

            </form>
        </div>
    )
}