'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

type Tipo = "Presencial" | "Online";

export default function NuevoEventoPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(""); // input datetime-local
  const [lugar, setLugar] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");
  const [tipo, setTipo] = useState<Tipo>("Presencial");
  const [reglas, setReglas] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isTicketed, setIsTicketed] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const fechaISO = fecha ? new Date(fecha).toISOString() : "";

      const res = await fetch("/api/admin/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          nombre,
          descripcion: descripcion || null,
          fecha: fechaISO || fecha,
          lugar: lugar || null,
          ciudad: ciudad || null,
          direccion: direccion || null,
          tipo, // "Presencial" | "Online"
          reglas,
          isPublished,
          // si es Online, no se venden entradas
          isTicketed: tipo === "Online" ? false : isTicketed,
        }),
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "No se pudo crear el evento");

      router.push("/admin/eventos");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Nuevo evento</h1>

      <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
        {error && <p className="text-red-600">{error}</p>}

        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input className="mt-1 w-full border rounded px-3 py-2 bg-white text-black"
                 value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={200}/>
        </div>

        <div>
          <label className="block text-sm font-medium">Fecha y hora</label>
          <input type="datetime-local" className="mt-1 w-full border rounded px-3 py-2 bg-white text-black"
                 value={fecha} onChange={(e) => setFecha(e.target.value)} required/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Lugar</label>
            <input className="mt-1 w-full border rounded px-3 py-2 bg-white text-black"
                   value={lugar} onChange={(e) => setLugar(e.target.value)} maxLength={200}/>
          </div>
          <div>
            <label className="block text-sm font-medium">Ciudad</label>
            <input className="mt-1 w-full border rounded px-3 py-2 bg-white text-black"
                   value={ciudad} onChange={(e) => setCiudad(e.target.value)} maxLength={200}/>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Dirección</label>
          <input className="mt-1 w-full border rounded px-3 py-2 bg-white text-black"
                 value={direccion} onChange={(e) => setDireccion(e.target.value)} maxLength={300}/>
        </div>

        <div>
          <label className="block text-sm font-medium">Tipo</label>
          <select
            className="mt-1 w-full border rounded px-3 py-2 bg-white text-black"
            value={tipo}
            onChange={(e) => {
              const next = e.target.value as Tipo;
              setTipo(next);
              if (next === "Online") setIsTicketed(false);
            }}
          >
            <option value="Presencial">Presencial</option>
            <option value="Online">Online</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Reglas</label>
          <textarea className="mt-1 w-full border rounded px-3 py-2 bg-white text-black"
                    value={reglas} onChange={(e) => setReglas(e.target.value)} required maxLength={10000} rows={4}/>
        </div>

        <div>
          <label className="block text-sm font-medium">Descripción</label>
          <textarea className="mt-1 w-full border rounded px-3 py-2 bg-white text-black"
                    value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={4000} rows={4}/>
        </div>

        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)}/>
            <span>Publicado</span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={tipo === "Online" ? false : isTicketed}
              disabled={tipo === "Online"}
              onChange={(e) => setIsTicketed(e.target.checked)}
            />
            <span>Presencial (con entradas)</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-500 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Crear evento"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/eventos")}
            className="px-4 py-2 rounded border"
          >
            Cancelar
          </button>
        </div>
      </form>
    </main>
  );
}