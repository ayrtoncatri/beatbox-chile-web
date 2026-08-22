"use client";

import { useState } from "react";

type PrivacyRequestRow = {
  id: string;
  email: string;
  name: string | null;
  type: string;
  status: string;
  detail: string;
  receivedAt: string;
  deadlineAt: string;
  extendedUntil: string | null;
  userId: string | null;
  resolution: string | null;
  rejectionReason: string | null;
};

export default function PrivacyRequestsAdmin({
  initialRequests,
}: {
  initialRequests: PrivacyRequestRow[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialRequests[0]?.id ?? null,
  );
  const [userId, setUserId] = useState("");
  const [resolution, setResolution] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [exportPreview, setExportPreview] = useState<string | null>(null);

  const selected = requests.find((r) => r.id === selectedId) ?? null;

  async function refresh() {
    const res = await fetch("/api/admin/privacy/requests?pageSize=100");
    const data = await res.json();
    if (res.ok) {
      // list endpoint is slim; merge detail from current selection when possible
      setRequests((prev) => {
        const byId = new Map(prev.map((r) => [r.id, r]));
        return (data.requests as Array<Partial<PrivacyRequestRow> & { id: string }>).map(
          (row) => ({
            ...(byId.get(row.id) ?? {
              detail: "",
              resolution: null,
              rejectionReason: null,
              userId: null,
              name: null,
              extendedUntil: null,
            }),
            ...row,
            email: row.email ?? byId.get(row.id)?.email ?? "",
            type: row.type ?? "",
            status: row.status ?? "",
            receivedAt: row.receivedAt ?? "",
            deadlineAt: row.deadlineAt ?? "",
          }),
        );
      });
    }
  }

  async function loadDetail(id: string) {
    setSelectedId(id);
    setMessage(null);
    setExportPreview(null);
    const res = await fetch(`/api/admin/privacy/requests/${id}`);
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "No se pudo cargar");
      return;
    }
    const req = data.request as PrivacyRequestRow;
    setRequests((prev) => {
      const others = prev.filter((r) => r.id !== id);
      return [req, ...others];
    });
  }

  async function patch(body: Record<string, unknown>) {
    if (!selectedId) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/privacy/requests/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Error al actualizar");
        return;
      }
      if (data.fulfill?.exportPayload) {
        setExportPreview(JSON.stringify(data.fulfill.exportPayload, null, 2));
      }
      setMessage(data.fulfill?.summary || "Actualizado");
      await loadDetail(selectedId);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="overflow-hidden rounded-xl border border-blue-800/60 bg-slate-950/60">
        <table className="min-w-full text-left text-sm text-blue-100">
          <thead className="bg-blue-950/80 text-xs uppercase tracking-wide text-blue-300">
            <tr>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Plazo</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((row) => (
              <tr
                key={row.id}
                className={`cursor-pointer border-t border-blue-900/50 hover:bg-blue-900/30 ${
                  selectedId === row.id ? "bg-blue-900/40" : ""
                }`}
                onClick={() => loadDetail(row.id)}
              >
                <td className="px-3 py-2 font-medium">{row.type}</td>
                <td className="px-3 py-2">{row.status}</td>
                <td className="px-3 py-2">{row.email}</td>
                <td className="px-3 py-2">
                  {new Date(row.deadlineAt).toLocaleDateString("es-CL")}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-blue-300">
                  No hay solicitudes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 rounded-xl border border-blue-800/60 bg-slate-950/60 p-4 text-blue-100">
        {!selected ? (
          <p className="text-sm text-blue-300">Selecciona una solicitud.</p>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-bold text-white">{selected.type}</h2>
              <p className="text-xs text-blue-300">Folio {selected.id}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{selected.detail}</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-blue-300">
                Vincular userId (verificar identidad)
              </label>
              <div className="flex gap-2">
                <input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={selected.userId ?? "cuid del usuario"}
                  className="flex-1 rounded border border-blue-800 bg-black/40 px-2 py-1.5 text-sm"
                />
                <button
                  type="button"
                  disabled={busy || !userId}
                  onClick={() => patch({ action: "VERIFY_IDENTITY", userId })}
                  className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
                >
                  Verificar
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => patch({ action: "MARK_IN_PROGRESS" })}
                className="rounded bg-slate-700 px-3 py-1.5 text-sm"
              >
                En progreso
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => patch({ action: "EXTEND" })}
                className="rounded bg-amber-700 px-3 py-1.5 text-sm"
              >
                Prorrogar 30d
              </button>
            </div>

            <div className="space-y-2">
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Resolucion (min 10 caracteres)"
                className="min-h-20 w-full rounded border border-blue-800 bg-black/40 px-2 py-1.5 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy || resolution.trim().length < 10}
                  onClick={() => patch({ action: "FULFILL", resolution })}
                  className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
                >
                  Ejecutar derecho y cerrar
                </button>
                <button
                  type="button"
                  disabled={busy || resolution.trim().length < 10}
                  onClick={() => patch({ action: "COMPLETE", resolution })}
                  className="rounded bg-cyan-700 px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Cerrar manual
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Motivo de rechazo fundado"
                className="min-h-16 w-full rounded border border-blue-800 bg-black/40 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                disabled={busy || rejectionReason.trim().length < 10}
                onClick={() => patch({ action: "REJECT", rejectionReason })}
                className="rounded bg-red-700 px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Rechazar
              </button>
            </div>

            {message && <p className="text-sm text-cyan-200">{message}</p>}
            {exportPreview && (
              <pre className="max-h-64 overflow-auto rounded bg-black/50 p-2 text-xs text-green-200">
                {exportPreview}
              </pre>
            )}
          </>
        )}
      </div>
    </div>
  );
}
