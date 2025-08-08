'use client';
import { useForm } from "react-hook-form";
import { useState } from "react";
import { FaUserAlt, FaYoutube } from "react-icons/fa";

export default function FormularioWildcard() {
  const { register, handleSubmit, reset } = useForm();
  const [mensaje, setMensaje] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    setMensaje("✅ Formulario enviado (demo, pendiente backend)");
    reset();
  };

  return (
    <section className="mt-12 relative z-10">
      <h2 className="text-3xl font-bold mb-8 text-lime-300 drop-shadow-lg">
        Formulario de Inscripción Wildcard
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-xl mx-auto bg-gradient-to-br from-gray-900/80 via-neutral-900/80 to-lime-400/10
                   backdrop-blur-lg border border-lime-400/20 shadow-2xl
                   hover:shadow-lime-500/40 p-8 rounded-2xl flex flex-col gap-6
                   transition-all duration-400"
      >
        <div className="flex items-center gap-2">
          <FaUserAlt className="text-lime-400 text-xl" />
          <input
            {...register("nombre", { required: true })}
            type="text"
            placeholder="Nombre artístico"
            className="w-full bg-neutral-900/80 border border-lime-400/40 focus:border-lime-300 text-white p-3 rounded-xl placeholder:text-lime-200/70 outline-none transition-all"
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <FaYoutube className="text-lime-400 text-xl" />
          <input
            {...register("youtubeUrl", { required: true })}
            type="url"
            placeholder="Link del video de YouTube"
            className="w-full bg-neutral-900/80 border border-lime-400/40 focus:border-lime-300 text-white p-3 rounded-xl placeholder:text-lime-200/70 outline-none transition-all"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-lime-500 via-lime-400 to-green-400
                     text-gray-900 font-bold py-3 px-6 rounded-xl mt-4
                     hover:scale-105 hover:shadow-lg transition-all duration-300"
        >
          Enviar
        </button>
        {mensaje && <p className="mt-4 text-lime-300 font-bold drop-shadow">{mensaje}</p>}
      </form>
    </section>
  );
}
