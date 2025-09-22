'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDaysIcon, TrashIcon } from "@heroicons/react/24/outline";

const TIPO_OPCIONES = ["Presencial", "Online"] as const;

type EventoFormData = {
  id?: string;
  nombre: string;
  fecha: string;
  lugar?: string | null;
  ciudad?: string | null;
  direccion?: string | null;
  descripcion?: string | null;
  tipo: string;
  reglas: string;
  isPublished: boolean;
  isTicketed: boolean;
};

export default function EventForm({
  mode,
  initialData,
}: {
  mode: "create" | "edit";
  initialData?: Partial<EventoFormData>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState<EventoFormData>({
    id: initialData?.id,
    nombre: initialData?.nombre ?? "",
    fecha: initialData?.fecha ? toDatetimeLocalString(new Date(initialData.fecha)) : "",
    lugar: initialData?.lugar ?? "",
    ciudad: initialData?.ciudad ?? "",
    direccion: initialData?.direccion ?? "",
    descripcion: initialData?.descripcion ?? "",
    tipo: initialData?.tipo ?? "Presencial",
    reglas: initialData?.reglas ?? "",
    isPublished: initialData?.isPublished ?? false,
    isTicketed: initialData?.isTicketed ?? true,
  });

  function toDatetimeLocalString(d: Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        fecha: form.fecha,
        lugar: form.lugar || null,
        ciudad: form.ciudad || null,
        direccion: form.direccion || null,
        descripcion: form.descripcion || null,
        tipo: form.tipo.trim(),
        reglas: form.reglas.trim(),
        isPublished: !!form.isPublished,
        isTicketed: !!form.isTicketed,
      };

      const res = await fetch(
        mode === "create" ? "/api/admin/eventos" : `/api/admin/eventos/${form.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Error al guardar");
      }

      router.push("/admin/eventos");
      router.refresh();
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!form.id) return;
    if (!confirm("¿Eliminar este evento? Esta acción es irreversible.")) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/eventos/${form.id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "No se pudo eliminar");
      }
      router.push("/admin/eventos");
      router.refresh();
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 bg-white rounded-2xl shadow border border-gray-200 p-8 max-w-2xl">
      {err && <div className="text-red-600 text-sm">{err}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            className="w-full border rounded-lg px-3 py-2 bg-gray-50"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
            maxLength={200}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fecha y hora</label>
          <input
            type="datetime-local"
            className="w-full border rounded-lg px-3 py-2 bg-gray-50"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Lugar</label>
          <input
            className="w-full border rounded-lg px-3 py-2 bg-gray-50"
            value={form.lugar ?? ""}
            onChange={(e) => setForm({ ...form, lugar: e.target.value })}
            maxLength={200}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ciudad</label>
          <input
            className="w-full border rounded-lg px-3 py-2 bg-gray-50"
            value={form.ciudad ?? ""}
            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
            maxLength={200}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Dirección</label>
          <input
            className="w-full border rounded-lg px-3 py-2 bg-gray-50"
            value={form.direccion ?? ""}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            maxLength={300}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 bg-gray-50"
            rows={4}
            value={form.descripcion ?? ""}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            maxLength={4000}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select
            className="w-full border rounded-lg px-3 py-2 bg-gray-50"
            value={form.tipo ?? "Presencial"}
            onChange={(e) => {
              const nextTipo = e.target.value as (typeof TIPO_OPCIONES)[number];
              setForm((prev) => ({
                ...prev,
                tipo: nextTipo,
                isTicketed: nextTipo === "Online" ? false : prev.isTicketed,
              }));
            }}
          >
            {TIPO_OPCIONES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reglas</label>
          <input
            className="w-full border rounded-lg px-3 py-2 bg-gray-50"
            value={form.reglas}
            onChange={(e) => setForm({ ...form, reglas: e.target.value })}
            required
            maxLength={10000}
          />
        </div>
        <div className="flex items-center gap-4 md:col-span-2">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            />
            <span>Publicado</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.tipo === "Online" ? false : !!form.isTicketed}
              disabled={form.tipo === "Online"}
              onChange={(e) => setForm({ ...form, isTicketed: e.target.checked })}
            />
            <span>Presencial (con entradas)</span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-500 disabled:opacity-60"
        >
          <CalendarDaysIcon className="w-5 h-5" />
          {mode === "create" ? "Crear evento" : "Guardar cambios"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={onDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold shadow hover:bg-red-500 disabled:opacity-60"
          >
            <TrashIcon className="w-5 h-5" />
            Eliminar
          </button>
        )}
      </div>
    </form>
  );
}