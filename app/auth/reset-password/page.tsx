"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

// --- 1. Esquema de Validación OWASP (Ajustado a 8 caracteres) ---
// Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial.
const passwordComplexityRegex = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-.,;])[A-Za-z\d@$!%*?&_\-.,;]{8,}$/
);

const schema = z.object({
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(passwordComplexityRegex, {
      message: "Debe contener mayúscula, minúscula, número y símbolo (@$!%*?&_-)",
    }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

// --- 2. Componente del Formulario ---
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error("Token no válido o faltante.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token, 
          password: data.password 
        }),
      });

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        toast.error("Error inesperado del servidor.");
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        toast.error(json.error || "Error al restablecer contraseña.");
        return;
      }

      toast.success("¡Contraseña actualizada! Redirigiendo...");
      
      setTimeout(() => {
        router.push("/auth/login"); 
      }, 2000);

    } catch (error) {
      toast.error("Error de conexión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
       <div className="w-full max-w-md p-8 rounded-3xl bg-[#121212] border border-red-900/50 shadow-[0_0_40px_-10px_rgba(220,38,38,0.3)] text-center">
        <h3 className="text-xl font-bold text-red-500">Enlace inválido</h3>
        <p className="text-sm mt-4 text-gray-400">No se encontró el token de seguridad. Solicita un nuevo correo.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-[#121212] border border-red-900/30 shadow-[0_0_50px_-15px_rgba(220,38,38,0.2)]">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black tracking-wide italic uppercase bg-gradient-to-r from-white via-red-500 to-red-600 bg-clip-text text-transparent">
          NUEVA CONTRASEÑA
        </h2>
        <p className="mt-3 text-sm text-gray-400">
          Crea una contraseña segura para tu cuenta.
        </p>
      </div>
      
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        
        {/* Campo Contraseña Nueva */}
        <div className="space-y-1">
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              className="block w-full rounded-xl border-none bg-[#1a1a1a] px-4 py-3.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-600 sm:text-sm"
              placeholder="Nueva contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white focus:outline-none"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <EyeIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && (
             <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>
          )}
           <p className="text-xs text-gray-500 ml-1">Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.</p>
        </div>

        {/* Campo Confirmación */}
        <div className="space-y-1">
          <div className="relative">
            <input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              className="block w-full rounded-xl border-none bg-[#1a1a1a] px-4 py-3.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-600 sm:text-sm"
              placeholder="Confirmar contraseña"
            />
             <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <EyeIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 ml-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-[#ff0000] to-[#b700ff] px-4 py-4 text-sm font-bold text-white hover:from-red-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
        >
          {isSubmitting ? "Actualizando..." : "CAMBIAR CONTRASEÑA"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-12">
      <Suspense fallback={<div className="text-white animate-pulse">Cargando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}