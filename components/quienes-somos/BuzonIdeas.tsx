"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
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
    <section className="relative z-10 max-w-3xl mx-auto py-16 px-4">
      
      {/* Decoración de fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-900/5 to-transparent blur-3xl -z-10" />

      {/* Cabecera */}
      <div className="flex flex-col items-center text-center mb-10 space-y-3">
        <div className="p-3 rounded-full bg-yellow-500/10 border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
           <LightBulbIcon className="text-yellow-400 w-8 h-8" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white">
          Buzón de <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Ideas</span>
        </h2>
        <p className="text-white/50 text-sm md:text-base max-w-lg">
          ¿Tienes una visión para mejorar la comunidad? Tu voz construye el futuro de Beatbox Chile.
        </p>
      </div>

      {/* Tarjeta del Formulario */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative group rounded-2xl bg-[#0c0c12]/90 backdrop-blur-xl border border-white/10 p-1 transition-all duration-300 hover:border-white/20"
      >
        {/* Borde brillante animado al hacer foco */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-blue-600 to-fuchsia-600 opacity-0 transition-opacity duration-500 -z-10 blur-sm ${isFocused ? 'opacity-40' : ''}`} />

        <div className="bg-[#050505]/80 rounded-xl p-6 md:p-8">
            <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            
            <div className="relative">
                <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Escribe tu propuesta aquí..."
                    className="w-full p-4 rounded-xl bg-white/5 text-white border border-white/10 placeholder:text-white/20 focus:outline-none focus:bg-white/10 transition-all resize-none text-lg min-h-[150px]"
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
                    className="relative overflow-hidden group/btn flex items-center gap-2 py-3 px-8 bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white font-black uppercase italic tracking-wider rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {sending ? (
                        <span className="flex items-center gap-2">
                            <SparklesIcon className="w-5 h-5 animate-spin" />
                            Enviando...
                        </span>
                    ) : (
                        <>
                            <span>Enviar Propuesta</span>
                            <PaperAirplaneIcon className="w-5 h-5 group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 transition-transform" />
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