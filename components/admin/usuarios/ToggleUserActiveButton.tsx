"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PowerIcon } from "@heroicons/react/24/outline";

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
    <button
      type="button"
      onClick={onClick}
      disabled={pending || !!disabledReason}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold shadow-sm transition-all
        ${isActive
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-green-100 text-green-700 hover:bg-green-200"}
        ${disabledReason ? "opacity-50 cursor-not-allowed" : ""}`}
      title={disabledReason}
    >
      <PowerIcon className="w-4 h-4" />
      {pending ? "Guardando..." : label}
    </button>
  );
}