"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Cog6ToothIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
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
      <div className="inline-flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/15 bg-black/40 px-2 py-1.5 md:flex-row md:gap-3 md:rounded-full">
        <Image
          src={user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((user?.nombres || "") + (user?.apellidoPaterno ? " " + user.apellidoPaterno : ""))}&background=000&color=fff&size=128`}
          alt="Perfil"
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
        <span className="flex flex-col items-center justify-center whitespace-nowrap px-1 text-xs font-medium text-white md:items-start">
          <span className="text-[9px] uppercase tracking-widest text-white/45">Socio activo</span>
          <Link href="/perfil" className="flex items-center gap-1 font-bold text-white transition-colors hover:text-cyan-300" onClick={() => setOpen?.(false)}>
            <UserCircleIcon className="hidden h-3.5 w-3.5 text-cyan-300 md:inline-block" />
            {user?.nombres} {user?.apellidoPaterno}
          </Link>
        </span>
        {user?.role === "admin" && (
          <Link href="/admin" className="ml-1 flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-2 text-[9px] font-black uppercase italic tracking-widest text-white transition-colors hover:border-fuchsia-300 hover:text-fuchsia-200" onClick={() => setOpen?.(false)}>
            <Cog6ToothIcon className="h-3.5 w-3.5 text-fuchsia-300" />Admin
          </Link>
        )}
        <button className="ml-1 flex items-center gap-1 rounded-full px-3 py-2 text-[9px] font-black uppercase italic tracking-widest text-white/70 transition-all hover:bg-white/5 hover:text-fuchsia-300" onClick={() => { toast.success("Cerrando sesión..."); signOut({ callbackUrl: "/" }); }}>
          <ArrowRightOnRectangleIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center justify-center gap-2">
      <button
        className="inline-flex min-h-11 min-w-[92px] items-center justify-center rounded-full border border-white/70 px-5 py-2 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:border-cyan-300 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
        onClick={() => { setOpen?.(false); router.push("/auth/login"); }}
      >
        Entrar
      </button>

      <button
        className="inline-flex min-h-11 min-w-[108px] items-center justify-center rounded-full bg-cyan-300 px-5 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#061018] shadow-[0_0_18px_rgba(34,211,238,0.45)] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
        onClick={() => { setOpen?.(false); router.push('/auth/register'); }}
      >
        Ser Socio
      </button>
    </div>
  );
}
