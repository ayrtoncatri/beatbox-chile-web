"use client";
import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import PencilSquareIcon from "@heroicons/react/24/solid/esm/PencilSquareIcon";
import { editWildcard } from "@/app/admin/wildcards/actions";
import toast from "react-hot-toast";

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
      className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-blue-600 transition"
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
      toast.success("Wildcard actualizado correctamente");
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state.ok, state.error, router]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={item.id} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-blue-200 mb-1 font-medium">Alias (nombre artístico)</label>
          <input
            className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-blue-100 placeholder:text-blue-400/50"
            name="nombreArtistico"
            value={nombreArtistico}
            onChange={(e) => setNombreArtistico(e.target.value)}
            placeholder="Ej: BeatMaster"
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-sm text-blue-200 mb-1 font-medium">YouTube URL</label>
          <input
            className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-blue-100 placeholder:text-blue-400/50"
            name="youtubeUrl"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-blue-200 mb-1 font-medium">Notas internas</label>
          <textarea
            className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm min-h-[100px] bg-blue-950/50 text-blue-100 placeholder:text-blue-400/50"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas de revisión, observaciones, etc."
            maxLength={500}
          />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}