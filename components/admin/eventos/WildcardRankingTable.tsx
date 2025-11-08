'use client'

import {  useFormStatus } from 'react-dom'
import { RoundPhase } from '@prisma/client'
import {
    getWildcardRanking,
    classifyWildcardsAction,
    RankingResult,
} from '@/app/admin/eventos/actions'
import { useEffect, useState , useActionState } from 'react'
import toast from 'react-hot-toast'

interface WildcardRankingTableProps {
    eventoId: string
    // La lista de categorías activas para este evento (SOLO, LOOPSTATION, etc.)
    allCategories: { id: string; name: string }[]
}

// Componente para manejar el estado del botón de clasificación
function ClassifyButton() {
    const { pending } = useFormStatus() 
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-gradient-to-r from-green-600 to-green-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:from-green-700 hover:to-green-600 disabled:cursor-not-allowed disabled:bg-gray-400"
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
    const [state, dispatch] = useActionState(classifyWildcardsAction, initialState as any)

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
            toast.success(state.message || 'Wildcards clasificados correctamente')
        }
        if (state.ok === false && state.error) {
            toast.error(`Error al clasificar: ${state.error}`)
        }
    }, [state])

    if (!allCategories.length) {
        return <p className="text-blue-200">Este evento no tiene categorías de competición definidas.</p>
    }

    return (
        <div className="space-y-6">
            {/* Selector de Categoría */}
            <div className="flex items-center space-x-4 text-blue-200">
                <label htmlFor="category" className="font-medium">
                    Categoría:
                </label>
                <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded-md border border-blue-700/50 bg-blue-950/50 text-blue-100 py-2 pl-3 pr-10 shadow-sm"
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

                <div className="overflow-x-auto rounded-lg shadow-xl bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30">
                    <table className="min-w-full divide-y divide-blue-700/30">
                        <thead className="bg-blue-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-blue-200 uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-blue-200 uppercase">Clasificar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase">Beatboxer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase">Nota Final</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase">Jueces</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-700/30 bg-blue-900/30">
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="py-4 text-center text-blue-300/70">Cargando ranking...</td>
                                </tr>
                            )}
                            {!loading && ranking.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-4 text-center text-blue-300/70">Aún no hay puntajes SUBMITTED para esta categoría.</td>
                                </tr>
                            )}
                            {ranking.map((r) => (
                                <tr key={r.wildcardId} className="hover:bg-blue-800/30">
                                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-blue-100">{r.rank}</td>
                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-blue-200">
                                        <input
                                            type="checkbox"
                                            name="wildcardIds"
                                            value={r.wildcardId}
                                            checked={r.isClassified || selectedIds.includes(r.wildcardId)}
                                            onChange={(e) => handleCheckboxChange(r.wildcardId, e.target.checked)}
                                            // Si ya está clasificado, no permitimos desmarcar (solo admin podría hacerlo con otra action)
                                            disabled={r.isClassified}
                                            className="h-4 w-4 rounded border-blue-700/50 bg-blue-950/50 text-green-500 focus:ring-green-500"
                                        />
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-blue-100">
                                        {r.nombreArtistico || r.participantId}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-blue-300">
                                        {r.avgScore.toFixed(2)}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-blue-200">
                                        {r.totalJudges}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        {r.isClassified ? (
                                            <span className="inline-flex rounded-full bg-green-900/50 border border-green-700/30 px-2 text-xs font-semibold leading-5 text-green-300">
                                                Clasificado
                                            </span>
                                        ) : (
                                            <span className="inline-flex rounded-full bg-yellow-900/50 border border-yellow-700/30 px-2 text-xs font-semibold leading-5 text-yellow-300">
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