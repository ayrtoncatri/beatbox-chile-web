"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ToggleUserActiveButton({
  id,
  isActive,
  disabledReason,
}: {
  id: string;
  isActive: boolean;
  disabledReason?: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const label = isActive ? "Desactivar" : "Activar";

  function onClick() {
    setError(null);
    start(async () => {
      try {
        const res = await fetch(`/api/admin/usuarios/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !isActive }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || "Error al actualizar");
        }
        router.refresh();
      } catch (e: any) {
        setError(e.message || "Error al actualizar");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending || !!disabledReason}
        className={`px-3 py-1.5 border rounded text-sm ${
          isActive ? "bg-white hover:bg-gray-50" : "bg-yellow-50 hover:bg-yellow-100"
        } ${disabledReason ? "opacity-50 cursor-not-allowed" : ""}`}
        title={disabledReason}
      >
        {pending ? "Guardando..." : label}
      </button>
      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  );
}