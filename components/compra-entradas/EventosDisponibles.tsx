'use client';

import { useEffect, useState } from "react";

export type EventoDTO = {
  id: string;
  nombre: string;
  fecha: string;
  lugar?: string | null;
  ciudad?: string | null;
  tipo?: string | null;
};

type Props = {
  onSelect: (evento: EventoDTO) => void;
  selectedId?: string | null;
};

export default function EventosDisponibles({ onSelect, selectedId }: Props) {
  const [eventos, setEventos] = useState<EventoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/eventos", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Error al cargar eventos");
        setEventos(json?.data ?? []);
      } catch (e: any) {
        setErr(e.message || "Error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <section className="mt-6 max-w-4xl mx-auto px-4">
        <p className="text-lime-200">Cargando eventos...</p>
      </section>
    );
  }

  if (err) {
    return (
      <section className="mt-6 max-w-4xl mx-auto px-4">
        <p className="text-red-300">Error: {err}</p>
      </section>
    );
  }

  if (!eventos.length) {
    return (
      <section className="mt-6 max-w-4xl mx-auto px-4">
        <p className="text-lime-200/80">No hay eventos disponibles por ahora.</p>
      </section>
    );
  }

  return (
    <section className="mt-8 max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-lime-300 drop-shadow mb-4 text-center">
        Selecciona un evento
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {eventos.map((ev) => {
          const active = selectedId === ev.id;
          return (
            <button
              key={ev.id}
              onClick={() => onSelect(ev)}
              className={`text-left bg-gradient-to-br from-gray-900/80 via-neutral-900/80 to-lime-400/10
                          backdrop-blur-lg border ${active ? "border-lime-400" : "border-lime-400/20"}
                          shadow-2xl p-6 rounded-2xl hover:scale-[1.01] transition`}
            >
              <p className="text-white font-semibold">{ev.nombre}</p>
              <p className="text-lime-300 mt-1">
                {new Date(ev.fecha).toLocaleString("es-CL", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p className="text-neutral-300 mt-1">
                {[ev.lugar, ev.ciudad].filter(Boolean).join(" — ")}
              </p>
              {active && <p className="text-lime-200/90 mt-2">Seleccionado ✓</p>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
