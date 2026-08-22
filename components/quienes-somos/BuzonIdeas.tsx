"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { LightBulbIcon, PaperAirplaneIcon, SparklesIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

export default function BuzonIdeas() {
  const { data: session } = useSession();
  const [idea, setIdea] = useState("");
  const [sending, setSending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!idea.trim()) {
      toast.error("El micrófono está apagado... ¡Escribe algo!");
      return;
    }

    if (!session?.user) {
      toast.error("Identifícate primero para soltar tu idea.");
      return;
    }

    const userId = (session?.user as { id?: string })?.id;
    
    // Toast personalizado estilo dark
    const loadingToast = toast.loading("Subiendo tu idea al sistema...", {
        style: { background: '#0c0c12', color: '#fff', border: '1px solid #333' }
    });

    try {
      setSending(true);
      const res = await fetch("api/Sugerencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: idea.trim(), userId }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = json?.error || "Hubo un fallo en la matriz.";
        toast.error(errorMsg, { id: loadingToast });
        return;
      }

      toast.success("¡Boom! Idea registrada.", { 
        id: loadingToast,
        icon: '🔥',
        style: { background: '#0c0c12', color: '#fff', border: '1px solid #22c55e' }
      });
      setIdea("");
    } catch {
      toast.error("Error de conexión.", { id: loadingToast });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="relative z-10 mx-auto max-w-4xl px-4 pb-28 pt-16 sm:px-6">
      
      {/* Decoración de fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-900/5 to-transparent blur-3xl -z-10" />

      {/* Cabecera */}
      <header className="mb-10 flex flex-col items-center space-y-3 text-center">
        <div className="border border-amber-300/30 bg-amber-300/10 p-3 shadow-[0_0_16px_rgba(251,191,36,0.16)]">
          <LightBulbIcon className="h-7 w-7 text-amber-300" aria-hidden="true" />
        </div>
        <h2 className="font-[family-name:var(--font-display)] text-5xl font-bold uppercase italic leading-none text-white sm:text-6xl">
          Buzón de ideas
        </h2>
        <p className="max-w-lg text-sm leading-relaxed text-white/55 sm:text-base">
          ¿Tienes una visión para mejorar la comunidad? Tu voz construye el futuro de Beatbox Chile.
        </p>
      </header>

      {/* Tarjeta del Formulario */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group relative border border-white/15 bg-[#090b12]/95 p-1 transition-all duration-300 hover:border-cyan-300/35 [clip-path:polygon(0_14px,14px_0,100%_0,100%_calc(100%_-_14px),calc(100%_-_14px)_100%,0_100%)]"
      >
        {/* Borde brillante animado al hacer foco */}
        <div className={`absolute inset-0 -z-10 bg-linear-to-r from-fuchsia-500 via-cyan-400 to-fuchsia-500 opacity-0 blur-sm transition-opacity duration-300 ${isFocused ? 'opacity-35' : ''}`} />

        <div className="bg-[#05070b]/90 p-6 md:p-8">
            <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            
            <div className="relative">
                <label htmlFor="idea-comunidad" className="sr-only">Escribe tu propuesta para Beatbox Chile</label>
                <textarea
                    id="idea-comunidad"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Escribe tu propuesta aquí..."
                    className="min-h-[150px] w-full resize-none border border-white/15 bg-white/5 p-4 text-base text-white placeholder:text-white/30 transition focus:border-cyan-300/55 focus:bg-white/8 focus:outline-none sm:text-lg"
                    maxLength={1000}
                />
                {/* Contador de caracteres sutil */}
                <div className="absolute bottom-3 right-3 text-xs text-white/20 font-mono pointer-events-none">
                    {idea.length}/1000
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={sending || idea.trim().length < 5}
                    className="group/btn relative flex min-h-12 items-center gap-2 overflow-hidden border border-fuchsia-300/50 bg-linear-to-r from-fuchsia-600 to-cyan-600 px-7 py-3 text-xs font-black uppercase italic tracking-[0.14em] text-white transition hover:shadow-[0_0_22px_rgba(34,211,238,0.25)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                    {sending ? (
                        <span className="flex items-center gap-2">
                            <SparklesIcon className="h-5 w-5 animate-spin" aria-hidden="true" />
                            Enviando...
                        </span>
                    ) : (
                        <>
                            <span>Enviar Propuesta</span>
                            <PaperAirplaneIcon className="h-5 w-5 transition-transform group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1" aria-hidden="true" />
                        </>
                    )}
                </button>
            </div>
            </form>
        </div>
      </motion.div>
    </section>
  );
}