'use client';
import { useForm } from "react-hook-form";
import { useState } from "react";
import { FaUserAlt, FaYoutube } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface FormularioWildcardProps {
  eventoId: string;
}

export default function FormularioWildcard({ eventoId }: FormularioWildcardProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: session } = useSession();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    // Validación SOLO al presionar Enviar
    if (!session) {
      toast.error("Debes registrarte o iniciar sesión antes de enviar tu wildcard.");
      setTimeout(() => router.push("/auth/register"), 1800);
      return;
    }

    if (!data.categoria) {
      toast.error("Debes seleccionar una categoría (Solo/Loopstation/Tagteam).");
      return;
    }

    const categoriaLimpia = data.categoria.toUpperCase();
    const loadingToast = toast.loading("Enviando wildcard...");

    try {
      const res = await fetch("/api/wildcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeUrl: data.youtubeUrl?.trim(),
          nombreArtistico: data.nombreArtistico?.trim(),
          categoria: categoriaLimpia,
          eventoId: eventoId,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success('Wildcard guardada con éxito.', { id: loadingToast });
        reset();
        return; // Salimos de la función
      }

      // 2. Si llegamos aquí, 'res.ok' es 'false' (fue un error 4xx o 5xx)

      // 3. Revisamos errores específicos
      let errorMsg = '';
      if (res.status === 409) {
        errorMsg = json?.error || 'Ya enviaste una wildcard para este evento.';
      } else if (res.status === 403) {
        errorMsg = json?.error || 'El plazo para enviar wildcards ha cerrado.';
      } else {
        errorMsg = json?.error || 'No se pudo guardar la wildcard.';
      }
      toast.error(errorMsg, { id: loadingToast });
    } catch (e) {
      console.error("Error en fetch:", e);
      toast.error('Error de red/servidor al guardar la wildcard.', { id: loadingToast });
    }
  };


  return (
    <section className="mt-12 relative z-10 max-w-2xl mx-auto px-4">
      <h2 className="text-3xl font-bold mb-8 text-lime-300 drop-shadow-lg text-center">
        Formulario de Inscripción Wildcard
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="max-w-xl mx-auto bg-gradient-to-br from-gray-900/80 via-neutral-900/80 to-lime-400/10
                   backdrop-blur-lg border border-lime-400/20 shadow-2xl
                   hover:shadow-lime-500/40 p-8 rounded-2xl flex flex-col gap-6
                   transition-all duration-400"
      >
        <div className="flex flex-col gap-2">
          <label className="text-lime-200 font-semibold">Nombre artístico *</label>
          <div className="flex items-center gap-2">
            <FaUserAlt className="text-lime-400 text-xl" />
            <input
              {...register("nombreArtistico", { required: true })}
              type="text"
              placeholder="Nombre artístico"
              className="w-full bg-neutral-900/80 border border-lime-400/40 focus:border-lime-300 text-white p-3 rounded-xl placeholder:text-lime-200/70 outline-none transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block mb-2 text-lime-200 font-semibold">Categoría *</label>
          <div className="flex gap-6 text-amber-50">
            <label>
              <input type="radio" value="SOLO" {...register("categoria", { required: true })} />
              <span className="ml-2">SOLO</span>
            </label>
            <label>
              <input type="radio" value="LOOPSTATION" {...register("categoria", { required: true })} />
              <span className="ml-2">LOOPSTATION</span>
            </label>
            <label>
              <input type="radio" value="TAG_TEAM" {...register("categoria", { required: true })} />
              <span className="ml-2">TAG TEAM</span>
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-lime-200 font-semibold">Link del video de YouTube *</label>
          <div className="flex items-center gap-2">
            <FaYoutube className="text-lime-400 text-xl" />
            <input
              {...register("youtubeUrl", { required: true })}
              type="text"
              placeholder="Link del video de YouTube"
              className="w-full bg-neutral-900/80 border border-lime-400/40 focus:border-lime-300 text-white p-3 rounded-xl placeholder:text-lime-200/70 outline-none transition-all"
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-lime-500 via-lime-400 to-green-400
                     text-gray-900 font-bold py-3 px-6 rounded-xl mt-4
                     hover:scale-105 hover:shadow-lg transition-all duration-300"
        >
          Enviar
        </button>
      </form>
    </section>
  );
}