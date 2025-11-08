"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Cog6ToothIcon, UserCircleIcon } from "@heroicons/react/24/outline";
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

  if (session) {
    return (
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-900/60 to-blue-700/40 shadow-lg border border-blue-800/40 backdrop-blur-md">
        <Image
          src={
            user?.image
              ? user.image
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  (user?.nombres || "") +
                    (user?.apellidoPaterno ? " " + user.apellidoPaterno : "")
                )}&background=3b82f6&color=fff&size=128`
          }
          alt="Foto de perfil"
          width={40}
          height={40}
          className="rounded-full border-2 border-blue-500 shadow-md object-cover"
        />
        <span className="flex flex-col items-center justify-center text-blue-100 font-medium text-base md:text-lg whitespace-nowrap">
          Hola,{" "}
          <Link
            href="/perfil"
            className="font-bold flex items-center gap-1 hover:underline"
            onClick={() => setOpen?.(false)}
          >
            <UserCircleIcon className="w-5 h-5 inline-block" />
            {user?.nombres} {user?.apellidoPaterno} {user?.apellidoMaterno}
          </Link>
        </span>
        {/* Acceso rápido al dashboard solo si es admin */}
        {user?.role === "admin" && (
          <Link
            href="/admin"
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
            title="Ir al panel de administración"
            onClick={() => setOpen?.(false)}
          >
            <Cog6ToothIcon className="w-5 h-5" />
            Dashboard
          </Link>
        )}
        <button
          className="bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 transition-all text-white px-5 py-2 rounded-lg font-semibold shadow-md border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => {
            toast.success("Cerrando sesión...");
            signOut({ callbackUrl: "/" });
          }}
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center justify-center gap-1 sm:gap-2 md:gap-3 px-2 sm:px-2 py-1 sm:py-2 rounded-md sm:rounded-lg bg-gradient-to-r from-blue-900/60 to-blue-700/40 shadow-lg border border-blue-800/40 backdrop-blur-md">
      <button
        className="bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 transition-all text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-semibold shadow-md border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400 whitespace-nowrap"
        onClick={() => {
          setOpen?.(false);
          router.push("/auth/login");
        }}
      >
        Iniciar Sesión
      </button>
      <button
        className="bg-white/90 text-blue-900 font-semibold px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded text-xs sm:text-sm shadow-md border border-blue-900/20 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 whitespace-nowrap"
        onClick={() => {
          setOpen?.(false);
          router.push("/auth/register");
        }}
      >
        Registrarse
      </button>
    </div>
  );
}