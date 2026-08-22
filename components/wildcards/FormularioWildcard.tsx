'use client';
import { useForm } from "react-hook-form";
import { FaUserAlt, FaYoutube } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface FormularioWildcardProps {
  eventoId: string;
}

type WildcardFormValues = {
  nombreArtistico: string;
  categoria: string;
  youtubeUrl: string;
};

export default function FormularioWildcard({ eventoId }: FormularioWildcardProps) {
  const { register, handleSubmit, reset } = useForm<WildcardFormValues>();

  const { data: session } = useSession();
  const router = useRouter();

  const onSubmit = async (data: WildcardFormValues) => {
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex w-full flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white/85">Nombre artístico *</label>
        <div className="flex items-center gap-2">
          <FaUserAlt className="text-xl text-cyan-300" aria-hidden="true" />
          <input
            {...register("nombreArtistico", { required: true })}
            type="text"
            placeholder="Nombre artístico"
            className="h-11 w-full border border-cyan-300/40 bg-black/70 px-3 text-white outline-none placeholder:text-white/40 focus-visible:border-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          />
        </div>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-white/85">Categoría *</legend>
        <div className="flex flex-wrap gap-4 text-sm text-white">
          <label className="inline-flex min-h-11 items-center">
            <input type="radio" value="SOLO" {...register("categoria", { required: true })} />
            <span className="ml-2">SOLO</span>
          </label>
          <label className="inline-flex min-h-11 items-center">
            <input type="radio" value="LOOPSTATION" {...register("categoria", { required: true })} />
            <span className="ml-2">LOOPSTATION</span>
          </label>
          <label className="inline-flex min-h-11 items-center">
            <input type="radio" value="TAG_TEAM" {...register("categoria", { required: true })} />
            <span className="ml-2">TAG TEAM</span>
          </label>
        </div>
      </fieldset>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white/85">Link del video de YouTube *</label>
        <div className="flex items-center gap-2">
          <FaYoutube className="text-xl text-rose-400" aria-hidden="true" />
          <input
            {...register("youtubeUrl", { required: true })}
            type="url"
            placeholder="https://www.youtube.com/watch?v="
            className="h-11 w-full border border-cyan-300/40 bg-black/70 px-3 text-white outline-none placeholder:text-white/40 focus-visible:border-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          />
        </div>
      </div>
      <button type="submit" className="evento-cta mt-1 w-full">
        Enviar
      </button>
    </form>
  );
}