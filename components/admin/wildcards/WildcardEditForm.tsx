"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PencilSquareIcon from "@heroicons/react/24/solid/esm/PencilSquareIcon";

type Wildcard = {
  id: string;
  nombreArtistico: string | null;
  notes: string | null;
  youtubeUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export default function WildcardEditForm({ item }: { item: Wildcard }) {
  const [nombreArtistico, setNombreArtistico] = useState(item.nombreArtistico ?? "");
  const [notes, setNotes] = useState(item.notes ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(item.youtubeUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOk(false);
    setError(null);
    try {
      const res = await fetch(`/api/admin/wildcards/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreArtistico: nombreArtistico || null,
          notes: notes || null,
          youtubeUrl: youtubeUrl || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Error al actualizar");
      }
      setOk(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al actualizar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Alias (nombre artístico)</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            value={nombreArtistico}
            onChange={(e) => setNombreArtistico(e.target.value)}
            placeholder="Ej: BeatMaster"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">YouTube URL</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1 font-medium">Notas internas</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm min-h-[100px] bg-gray-50"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas de revisión, observaciones, etc."
          />
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {ok && <div className="text-sm text-green-700">Guardado</div>}

      <button
        type="submit"
        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
        disabled={loading}
      >
        <PencilSquareIcon className="w-5 h-5" />
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}