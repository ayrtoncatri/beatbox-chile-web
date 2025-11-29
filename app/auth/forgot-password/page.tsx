"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Link from "next/link";

const schema = z.object({
  email: z.string().email("Ingresa un correo válido"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // NOTA: Asegúrate de que apunta a /api/password/forgot
      const res = await fetch("/api/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        toast.success("Si el correo está registrado, recibirás un enlace.");
        reset();
      } else {
        toast.error("Ocurrió un error inesperado.");
      }
    } catch (error) {
      toast.error("Error de conexión al servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-12">
       {/* Contenedor estilo "Card" de Beatbox Chile */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-[#121212] border border-red-900/30 shadow-[0_0_50px_-15px_rgba(220,38,38,0.2)]">
        
        <div className="text-center mb-8">
           {/* Título con gradiente */}
          <h2 className="text-2xl font-black tracking-wide italic uppercase bg-gradient-to-r from-white via-red-500 to-red-600 bg-clip-text text-transparent">
            RECUPERAR ACCESO
          </h2>
          <p className="mt-3 text-sm text-gray-400">
            Ingresa tu email y te enviaremos las instrucciones.
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              {...register("email")}
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Correo electrónico"
              className="block w-full rounded-xl border-none bg-[#1a1a1a] px-4 py-3.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-600 sm:text-sm"
            />
            {errors.email && (
              <p className="mt-2 text-xs text-red-500 ml-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Botón con gradiente */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-[#ff0000] to-[#b700ff] px-4 py-4 text-sm font-bold text-white hover:from-red-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
          >
            {isSubmitting ? "Enviando..." : "ENVIAR ENLACE"}
          </button>
        </form>

        <div className="text-center text-sm mt-6">
          <Link href="/auth/login" className="font-medium text-gray-400 hover:text-white transition-colors">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}