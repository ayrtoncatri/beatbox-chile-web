'use client';

import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { EventoDTO } from "@/components/compra-entradas/EventosDisponibles";

type FormData = {
  tipoEntrada: "General" | "VIP";
  cantidad: number;
};

const PRECIOS: Record<FormData["tipoEntrada"], number> = {
  General: 8000,
  VIP: 15000,
};

type Props = {
  eventoSeleccionado: EventoDTO | null;
};

export default function FormularioCompraEntradas({ eventoSeleccionado }: Props) {
  const { register, handleSubmit, watch, reset } = useForm<FormData>({
    defaultValues: { tipoEntrada: "General", cantidad: 1 },
  });

  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  const tipo = watch("tipoEntrada");
  const cantidad = Number(watch("cantidad") || 1);
  const total = useMemo(
    () => Math.max(1, cantidad) * (PRECIOS[tipo] ?? 0),
    [tipo, cantidad]
  );

  const onSubmit = async (data: FormData) => {
    setMensaje(null);
    setError(null);

    if (!session) {
      setError("⚠️ Debes iniciar sesión para comprar.");
      setTimeout(() => router.push("/auth/register"), 1600);
      return;
    }
    const userId = (session.user as { id?: string })?.id;
    if (!userId) {
      setError("No se pudo obtener tu sesión.");
      return;
    }
    if (!eventoSeleccionado) {
      setError("Debes seleccionar un evento primero.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/compra-entradas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          eventoId: eventoSeleccionado.id,
          tipoEntrada: data.tipoEntrada,
          cantidad: Number(data.cantidad),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || "No se pudo completar la compra.");
        return;
      }
      setMensaje("✅ Compra realizada con éxito.");
      reset({ tipoEntrada: "General", cantidad: 1 });
    } catch {
      setError("Error de red/servidor al procesar la compra.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12 relative z-10">
      <h2 className="text-3xl font-bold mb-8 text-lime-300 drop-shadow-lg text-center">
        Formulario de Compra
      </h2>

      <div className="text-center text-lime-200 mb-4">
        {eventoSeleccionado ? (
          <p>
            Estás haciendo una compra para el evento{" "}
            <span className="text-lime-300 font-semibold">
              “{eventoSeleccionado.nombre}”
            </span>
          </p>
        ) : (
          <p>Primero selecciona un evento para continuar.</p>
        )}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-xl mx-auto bg-gradient-to-br from-gray-900/80 via-neutral-900/80 to-lime-400/10
                   backdrop-blur-lg border border-lime-400/20 shadow-2xl
                   hover:shadow-lime-500/40 p-8 rounded-2xl flex flex-col gap-5
                   transition-all duration-400"
      >
        <select
          {...register("tipoEntrada", { required: true })}
          className="bg-neutral-900/80 border border-lime-400/40 focus:border-lime-300 text-white p-3 rounded-xl outline-none transition-all"
        >
          <option value="General">General</option>
          <option value="VIP">VIP</option>
        </select>

        <input
          {...register("cantidad", { required: true, valueAsNumber: true, min: 1 })}
          type="number"
          min={1}
          placeholder="Cantidad"
          className="bg-neutral-900/80 border border-lime-400/40 focus:border-lime-300 text-white p-3 rounded-xl outline-none transition-all"
          required
        />

        <div className="flex items-center justify-between text-lime-200/90">
          <span>Total estimado</span>
          <span className="text-lime-300 font-bold text-xl">
            ${total.toLocaleString("es-CL")}
          </span>
        </div>

        <button
          type="submit"
          disabled={!eventoSeleccionado || submitting}
          className="bg-gradient-to-r from-lime-500 via-lime-400 to-green-400
                     text-gray-900 font-bold py-3 px-6 rounded-xl mt-2
                     hover:scale-105 hover:shadow-lg transition-all duration-300
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Procesando..." : "Comprar"}
        </button>

        {mensaje && <p className="mt-2 text-lime-300 font-bold">{mensaje}</p>}
        {error && <p className="mt-2 text-red-400 font-semibold">{error}</p>}
      </form>
    </section>
  );
}
