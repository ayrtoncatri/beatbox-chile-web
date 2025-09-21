"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";

type Status = "PENDING" | "APPROVED" | "REJECTED";

export default function ReviewButtons({ id, status }: { id: string; status: Status }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function updateStatus(next: Status) {
    setError(null);
    start(async () => {
      try {
        const res = await fetch(`/api/admin/wildcards/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
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
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending || status === "APPROVED"}
          className="px-3 py-1.5 border rounded text-sm bg-green-50 hover:bg-green-100 disabled:opacity-50"
          onClick={() => updateStatus("APPROVED")}
        >
          Aprobar
        </button>
        <button
          type="button"
          disabled={pending || status === "REJECTED"}
          className="px-3 py-1.5 border rounded text-sm bg-red-50 hover:bg-red-100 disabled:opacity-50"
          onClick={() => updateStatus("REJECTED")}
        >
          Rechazar
        </button>
        <button
          type="button"
          disabled={pending || status === "PENDING"}
          className="px-3 py-1.5 border rounded text-sm bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
          onClick={() => updateStatus("PENDING")}
        >
          Pendiente
        </button>
      </div>
      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  );
}