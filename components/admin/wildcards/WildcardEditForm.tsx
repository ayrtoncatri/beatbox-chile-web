"use client";
import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import PencilSquareIcon from "@heroicons/react/24/solid/esm/PencilSquareIcon";
import { editWildcard } from "@/app/admin/wildcards/actions";

type Wildcard = {
  id: string;
  nombreArtistico: string | null;
  notes: string | null;
  youtubeUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
      disabled={pending}
    >
      <PencilSquareIcon className="w-5 h-5" />
      {pending ? "Guardando..." : "Guardar cambios"}
    </button>
  );
}

export default function WildcardEditForm({ item }: { item: Wildcard }) {
  const [nombreArtistico, setNombreArtistico] = useState(item.nombreArtistico ?? "");
  const [notes, setNotes] = useState(item.notes ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(item.youtubeUrl ?? "");
  const router = useRouter();

  const initialState = { ok: false, error: undefined };
  const [state, formAction] = useActionState(editWildcard, initialState);
  
  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={item.id} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Alias (nombre artístico)</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            name="nombreArtistico"
            value={nombreArtistico}
            onChange={(e) => setNombreArtistico(e.target.value)}
            placeholder="Ej: BeatMaster"
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">YouTube URL</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            name="youtubeUrl"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1 font-medium">Notas internas</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm min-h-[100px] bg-gray-50"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas de revisión, observaciones, etc."
            maxLength={500}
          />
        </div>
      </div>

      {state.error && <div className="text-sm text-red-600">{state.error}</div>}
      {state.ok && <div className="text-sm text-green-700">Guardado</div>}

      <SubmitButton />
    </form>
  );
}