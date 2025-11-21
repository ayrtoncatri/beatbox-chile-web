"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon, // 👈 nuevo icono
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

type CustomUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  nombres?: string | null;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  role?: string | null;
};

export default function AuthButtons({ setOpen }: { setOpen?: (open: boolean) => void }) {
  const { data: session } = useSession();
  const router = useRouter();

  const user = session?.user as CustomUser | undefined;

  // --- ESTADO AUTENTICADO (LOGGED IN) ---
  if (session) {
    return (
      <div
        className="inline-flex flex-col md:flex-row items-center justify-center
                   gap-2 md:gap-3 px-3 py-2 rounded-xl
                   bg-gradient-to-r from-[#0c0c12]/80 to-blue-900/60
                   shadow-lg border border-white/10 backdrop-blur-md"
      >
        {/* Avatar */}
        <Image
          src={
            user?.image
              ? user.image
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  (user?.nombres || "") +
                    (user?.apellidoPaterno ? " " + user.apellidoPaterno : "")
                )}&background=1e3a8a&color=fff&size=128`
          }
          alt="Foto de perfil"
          width={28}
          height={28}
          className="rounded-full border-2 border-cyan-400 shadow-lg shadow-cyan-900/50 object-cover"
        />

        <span className="flex flex-col items-center md:items-start justify-center text-white/90 font-medium text-xs md:text-sm whitespace-nowrap">
          Hola,{" "}
          <Link
            href="/perfil"
            className="font-black italic text-cyan-400 tracking-tight flex items-center gap-1 hover:text-cyan-300 transition"
            onClick={() => setOpen?.(false)}
          >
            <UserCircleIcon className="w-4 h-4 inline-block text-cyan-400" />
            {user?.nombres} {user?.apellidoPaterno}
          </Link>
        </span>

        {user?.role === "admin" && (
          <Link
            href="/admin"
            className="flex items-center gap-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white
                       px-3 py-1 rounded-lg font-black italic uppercase tracking-wider text-[11px]
                       shadow border border-fuchsia-400/40 transition whitespace-nowrap"
            title="Ir al panel de administración"
            onClick={() => setOpen?.(false)}
          >
            <Cog6ToothIcon className="w-4 h-4" />
            Dashboard
          </Link>
        )}

        <button
          className="bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600
                     text-white px-3 py-1 rounded-lg font-black italic uppercase tracking-wider
                     text-[11px] shadow-md border border-red-400/30
                     focus:outline-none focus:ring-2 focus:ring-red-400 whitespace-nowrap
                     inline-flex items-center gap-1"
          onClick={() => {
            toast.success("Cerrando sesión...");
            signOut({ callbackUrl: "/" });
          }}
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>
    );
  }

  // --- ESTADO NO AUTENTICADO (LOGIN/REGISTER) ---
  return (
    <div
      className="inline-flex items-center justify-center
                 gap-2 md:gap-3 px-2 sm:px-3 py-1.5 rounded-xl
                 bg-gradient-to-r from-blue-950/70 via-red-950/40 to-blue-950/70
                 shadow-xl border border-white/10 backdrop-blur-md"
    >
      {/* Botón 1: Entrar (Login) */}
      <button
        aria-label="Entrar"
        className="flex items-center justify-center gap-2
                  px-3 sm:px-4 py-1.5
                  min-w-[100px]
                  bg-gradient-to-r from-red-600 to-fuchsia-600
                  hover:from-red-700 hover:to-fuchsia-700
                  text-white rounded-lg
                  font-black italic uppercase tracking-wider
                  text-xs sm:text-sm
                  shadow-md shadow-red-900/50 border border-red-400/30
                  focus:outline-none focus:ring-2 focus:ring-red-400
                  transition-all hover:scale-[1.02]"
        onClick={() => {
          setOpen?.(false);
          router.push("/auth/login");
        }}
      >
        <ArrowRightOnRectangleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Entrar</span>
      </button>

      {/* Botón 2: Crear cuenta (Registro) */}
      <button
        aria-label="Crear cuenta"
        className="flex items-center justify-center gap-2
                  px-3 sm:px-4 py-1.5
                  min-w-[100px]
                  bg-white/10 text-blue-400 hover:bg-white/20
                  rounded-lg border border-blue-400/50
                  font-black italic uppercase tracking-wider
                  text-xs sm:text-sm
                  shadow-md transition
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  hover:scale-[1.02]"
        onClick={() => {
          setOpen?.(false);
          router.push('/auth/register');
        }}
      >
        <UserPlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Crear Cuenta</span>
      </button>
    </div>
  );
}
