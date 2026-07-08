"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Cog6ToothIcon, UserCircleIcon, ArrowRightOnRectangleIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

type CustomUser = {
  nombres?: string | null;
  apellidoPaterno?: string | null;
  image?: string | null;
  role?: string | null;
};

export default function AuthButtons({ setOpen }: { setOpen?: (open: boolean) => void }) {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as CustomUser | undefined;

  if (session) {
    return (
      <div className="inline-flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-600 shadow-inner">
        <Image
          src={user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((user?.nombres || "") + (user?.apellidoPaterno ? " " + user.apellidoPaterno : ""))}&background=000&color=fff&size=128`}
          alt="Perfil"
          width={32}
          height={32}
          className="rounded-md border border-zinc-500 object-cover"
        />
        <span className="flex flex-col items-center md:items-start justify-center text-white font-medium text-xs whitespace-nowrap px-1">
          <span className="text-[9px] uppercase tracking-widest text-zinc-400">Socio activo</span>
          <Link href="/perfil" className="font-bold text-zinc-100 flex items-center gap-1 hover:text-[#00F0FF] transition-colors" onClick={() => setOpen?.(false)}>
            <UserCircleIcon className="w-3.5 h-3.5 hidden md:inline-block text-zinc-400" />
            {user?.nombres} {user?.apellidoPaterno}
          </Link>
        </span>
        {user?.role === "admin" && (
          <Link href="/admin" className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-md font-black italic uppercase tracking-widest text-[9px] border border-zinc-500 transition-colors ml-1 shadow-sm" onClick={() => setOpen?.(false)}>
            <Cog6ToothIcon className="w-3.5 h-3.5 text-[#FF0055]" />Admin
          </Link>
        )}
        <button className="bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-red-400 px-3 py-2 rounded-md font-black italic uppercase tracking-widest text-[9px] border border-transparent hover:border-zinc-600 transition-all ml-1 flex items-center gap-1" onClick={() => { toast.success("Cerrando sesión..."); signOut({ callbackUrl: "/" }); }}>
          <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center justify-center gap-3">
      {/* Botón ENTRAR: Hardware gris claro */}
      <button
        className="group flex items-center justify-center gap-2 px-5 py-2 min-w-[100px] bg-gradient-to-b from-zinc-800 to-zinc-950 text-zinc-200 hover:text-white rounded-lg font-black italic uppercase tracking-widest text-xs border border-zinc-500 hover:border-zinc-300 transition-all duration-300 shadow-[0_2px_5px_rgba(0,0,0,0.5)]"
        onClick={() => { setOpen?.(false); router.push("/auth/login"); }}
      >
        <ArrowRightOnRectangleIcon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
        <span>Entrar</span>
      </button>

      {/* Botón SER SOCIO: Botón físico rojo */}
      <button
        className="group relative flex items-center justify-center gap-2 px-5 py-2 min-w-[120px] bg-gradient-to-b from-[#FF0055] to-[#990033] text-white rounded-lg font-black italic uppercase tracking-widest text-xs transition-all duration-300 hover:-translate-y-0.5 border-t border-[#FF4D85] border-b-2 border-black shadow-[0_4px_10px_rgba(255,0,85,0.4)]"
        onClick={() => { setOpen?.(false); router.push('/auth/register'); }}
      >
        <UserPlusIcon className="w-4 h-4" />
        <span>Ser Socio</span>
      </button>
    </div>
  );
}