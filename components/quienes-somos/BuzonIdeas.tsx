'use client';
import { useState } from "react";
import { FaLightbulb } from "react-icons/fa";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function BuzonIdeas() {
  const { data: session } = useSession();
  const [idea, setIdea] = useState("");
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!idea.trim()) {
      toast.error("Por favor, escribe tu idea.");
      return;
    }

    const userId = (session?.user as { id?: string })?.id;
    const loadingToast = toast.loading("Enviando idea...");

    try {
      setSending(true);
      const res = await fetch("api/Sugerencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: idea.trim(), userId }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = json?.error || "No se pudo enviar tu idea.";
        toast.error(errorMsg, { id: loadingToast });
        return;
      }

      toast.success("¡Gracias! Tu idea fue enviada.", { id: loadingToast });
      setIdea("");
    } catch {
      toast.error("Error de red/servidor. Intenta nuevamente.", { id: loadingToast });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mt-12 max-w-2xl mx-auto relative z-10">
      <h2 className="text-3xl font-bold mb-8 text-amber-300 drop-shadow-lg">
        Buzón de Ideas
      </h2>
      <div className="
        bg-gradient-to-br from-amber-200/20 via-orange-100/10 to-white/5
        backdrop-blur-lg border border-amber-300/30 shadow-xl
        hover:shadow-amber-300/30 p-8 rounded-2xl flex flex-col gap-3
        transition-all duration-300
      ">
        <div className="flex items-center gap-3 mb-2">
          <FaLightbulb className="text-amber-300 text-2xl animate-pulse" />
          <span className="text-xl font-semibold text-white drop-shadow">
            ¿Tienes una idea para la comunidad?
          </span>
        </div>
        <p className="text-gray-100">
          ¡Queremos escucharte! Tu opinión, propuesta o sugerencia puede impulsar nuevos proyectos y actividades.
        </p>

        <form className="flex flex-col gap-4 mt-3" onSubmit={onSubmit}>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Comparte tu idea aquí..."
            className="w-full p-3 rounded-xl bg-white/10 text-white border border-amber-300/30 placeholder:text-amber-100/70 focus:border-orange-300 transition-all outline-none"
            rows={3}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={sending || idea.trim().length < 5}
            className="bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-300
                       text-gray-900 font-bold py-2 px-6 rounded-xl
                       hover:scale-105 hover:shadow-lg transition-all duration-300
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? "Enviando..." : "Enviar idea"}
          </button>
        </form>
      </div>
    </section>
  );
}
