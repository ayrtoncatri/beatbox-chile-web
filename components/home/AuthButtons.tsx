"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
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
                   bg-[#0B132B] border border-[#00F0FF]/30 
                   shadow-lg"
      >
        {/* Avatar */}
        <Image
          src={
            user?.image
              ? user.image
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  (user?.nombres || "") +
                    (user?.apellidoPaterno ? " " + user.apellidoPaterno : "")
                )}&background=0B132B&color=fff&size=128`
          }
          alt="Foto de perfil"
          width={28}
          height={28}
          className="rounded-full border border-[#00F0FF] object-cover"
        />

        <span className="flex flex-col items-center md:items-start justify-center text-[#FFFFFF] font-medium text-xs whitespace-nowrap">
          <span className="text-[10px] uppercase tracking-wider text-[#FFFFFF]/50">Socio activo</span>
          <Link
            href="/perfil"
            className="font-bold text-[#FFFFFF] flex items-center gap-1 hover:text-[#00F0FF] transition-colors"
            onClick={() => setOpen?.(false)}
          >
            <UserCircleIcon className="w-3.5 h-3.5 hidden md:inline-block text-[#00F0FF]" />
            {user?.nombres} {user?.apellidoPaterno}
          </Link>
        </span>

        {user?.role === "admin" && (
          <Link
            href="/admin"
            className="flex items-center gap-1 bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 text-[#FFFFFF]
                       px-3 py-1.5 rounded-lg font-black italic uppercase tracking-wider text-[10px]
                       border border-[#FFFFFF]/20 transition-colors whitespace-nowrap ml-2"
            title="Ir al panel de administración"
            onClick={() => setOpen?.(false)}
          >
            <Cog6ToothIcon className="w-3.5 h-3.5 text-[#FF0055]" />
            Admin
          </Link>
        )}

        <button
          className="bg-[#FF0055]/10 hover:bg-[#FF0055] text-[#FF0055] hover:text-[#FFFFFF]
                     px-3 py-1.5 rounded-lg font-black italic uppercase tracking-wider
                     text-[10px] border border-[#FF0055]
                     focus:outline-none transition-colors whitespace-nowrap
                     inline-flex items-center gap-1 md:ml-1"
          onClick={() => {
            toast.success("Cerrando sesión...");
            signOut({ callbackUrl: "/" });
          }}
        >
          <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    );
  }

  // --- ESTADO NO AUTENTICADO (LOGIN/REGISTER) ---
  return (
    <div className="inline-flex items-center justify-center gap-3">
      {/* Botón 1: Entrar (Secundario) - Transparente con borde texturizado */}
      <button
        aria-label="Entrar"
        className="flex items-center justify-center gap-2
                   px-5 py-2 min-w-[100px]
                   bg-transparent text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#0B132B]
                   rounded-lg font-black italic uppercase tracking-widest
                   text-xs border border-[#FFFFFF]/70
                   transition-colors duration-300"
        onClick={() => {
          setOpen?.(false);
          router.push("/auth/login");
        }}
      >
        <ArrowRightOnRectangleIcon className="w-4 h-4" />
        <span>Entrar</span>
      </button>

      {/* Botón 2: Ser Socio (Llamado a la Acción Principal) - Rojo Eléctrico Sólido */}
      <button
        aria-label="Crear cuenta"
        className="flex items-center justify-center gap-2
                   px-5 py-2 min-w-[100px]
                   bg-[#FF0055] text-[#FFFFFF] hover:bg-[#D40047]
                   rounded-lg font-black italic uppercase tracking-widest
                   text-xs transition-colors duration-300 shadow-[0_4px_15px_rgba(255,0,85,0.4)]"
        onClick={() => {
          setOpen?.(false);
          router.push('/auth/register');
        }}
      >
        <UserPlusIcon className="w-4 h-4" />
        <span>Ser Socio</span>
      </button>
    </div>
  );
}