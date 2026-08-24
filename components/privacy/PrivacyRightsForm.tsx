"use client";

import { useMemo, useState } from "react";

const RIGHTS = [
  { value: "ACCESO", label: "Acceso" },
  { value: "RECTIFICACION", label: "Rectificacion" },
  { value: "SUPRESION", label: "Supresion" },
  { value: "OPOSICION", label: "Oposicion" },
  { value: "PORTABILIDAD", label: "Portabilidad" },
  { value: "BLOQUEO", label: "Bloqueo" },
  { value: "REVOCACION", label: "Revocacion de consentimiento" },
] as const;

type Props = {
  isAuthenticated: boolean;
  defaultEmail?: string | null;
  defaultName?: string | null;
};

export default function PrivacyRightsForm({
  isAuthenticated,
  defaultEmail,
  defaultName,
}: Props) {
  const [right, setRight] = useState<(typeof RIGHTS)[number]["value"]>("ACCESO");
  const [oppositionScope, setOppositionScope] = useState<"MARKETING" | "COOKIES" | "NON_ESSENTIAL">("MARKETING");
  const [detail, setDetail] = useState("");
  const [name, setName] = useState(defaultName ?? "");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const needsIdentity = useMemo(() => !isAuthenticated, [isAuthenticated]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const composedDetail =
        right === "OPOSICION" || right === "REVOCACION"
          ? `${JSON.stringify({ scope: oppositionScope })}\n${detail}`
          : detail;
      const res = await fetch("/api/privacy/rights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          right,
          detail: composedDetail,
          ...(needsIdentity ? { name, email } : { name: name || undefined }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo enviar la solicitud");
        return;
      }
      setMessage(
        `Solicitud creada (folio ${data.ticket.id}). Plazo: ${data.legalDeadline}.`,
      );
      setDetail("");
    } catch {
      setError("Error de red al enviar la solicitud");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-xl flex-col gap-4 text-left">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-white/90">Derecho</span>
        <select
          value={right}
          onChange={(e) => setRight(e.target.value as typeof right)}
          className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white"
          required
        >
          {RIGHTS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      {(right === "OPOSICION" || right === "REVOCACION") && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase tracking-wider text-white/60">Alcance</span>
          <select
            value={oppositionScope}
            onChange={(e) => setOppositionScope(e.target.value as typeof oppositionScope)}
            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-white"
          >
            <option value="MARKETING">Comunicaciones comerciales</option>
            <option value="COOKIES">Cookies y YouTube</option>
            <option value="NON_ESSENTIAL">Tratamientos no esenciales (marketing + cookies)</option>
          </select>
        </label>
      )}

      {needsIdentity && (
        <>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-white/90">Nombre</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white"
              required
              maxLength={120}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-white/90">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white"
              required
            />
          </label>
        </>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-white/90">Detalle</span>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          className="min-h-32 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white"
          required
          minLength={10}
          maxLength={4000}
          placeholder={
            right === "RECTIFICACION"
              ? 'Para rectificacion usa JSON, ej: {"nombres":"Ana","apellidoPaterno":"Perez"}'
              : "Describe tu solicitud con el mayor detalle posible"
          }
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-cyan-500 px-4 py-3 font-bold uppercase tracking-wide text-black transition hover:bg-cyan-400 disabled:opacity-60"
      >
        {loading ? "Enviando..." : "Enviar solicitud"}
      </button>

      {message && <p className="text-sm text-cyan-200">{message}</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}
    </form>
  );
}
