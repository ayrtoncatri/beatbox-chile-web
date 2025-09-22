"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

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
      <div className="flex flex-wrap gap-2 w-full mt-2">
        <button
          type="button"
          disabled={pending || status === "APPROVED"}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-semibold transition
            ${status === "APPROVED" ? "bg-green-600 text-white" : "bg-green-100 text-green-700 hover:bg-green-200"}
            `}
          onClick={() => updateStatus("APPROVED")}
          style={{ minWidth: 0 }}
        >
          <CheckCircleIcon className="w-4 h-4" /> Aprobar
        </button>
        <button
          type="button"
          disabled={pending || status === "REJECTED"}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-semibold transition
            ${status === "REJECTED" ? "bg-red-600 text-white" : "bg-red-100 text-red-700 hover:bg-red-200"}
            `}
          onClick={() => updateStatus("REJECTED")}
          style={{ minWidth: 0 }}
        >
          <XCircleIcon className="w-4 h-4" /> Rechazar
        </button>
        <button
          type="button"
          disabled={pending || status === "PENDING"}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-semibold transition
            ${status === "PENDING" ? "bg-yellow-500 text-white" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"}
            `}
          onClick={() => updateStatus("PENDING")}
          style={{ minWidth: 0 }}
        >
          <ClockIcon className="w-4 h-4" /> Pendiente
        </button>
      </div>
      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  );
}