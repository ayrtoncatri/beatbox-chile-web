'use client';
import { useForm } from "react-hook-form";
import { useState } from "react";

export default function FormularioWildcard() {
  const { register, handleSubmit, reset } = useForm();
  const [mensaje, setMensaje] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    setMensaje("Formulario enviado (ejemplo, pendiente de backend)");
    reset();
  };

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold text-blue-100 mb-4">Formulario de Inscripción (YouTube Link)</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-neutral-900 p-6 rounded-xl shadow">
        <input
          {...register("nombre", { required: true })}
          type="text"
          placeholder="Nombre artístico"
          className="w-full p-2 border rounded"
          required
        />
        <input
          {...register("youtubeUrl", { required: true })}
          type="url"
          placeholder="Link del video de YouTube"
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">Enviar</button>
      </form>
      {mensaje && <p className="mt-4">{mensaje}</p>}
    </section>
  );
}
