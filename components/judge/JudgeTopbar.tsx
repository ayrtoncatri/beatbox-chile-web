"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { FaHome, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { motion } from "framer-motion";

type Props = {
  user: { email?: string | null; name?: string | null; image?: string | null } | null;
};

export default function JudgeTopbar({ user }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const userName = (user?.name ?? user?.email ?? "Usuario") as string;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Layer 1: glow bar */}
      <div className="pointer-events-none absolute inset-x-0 -top-6 h-10 bg-gradient-to-b from-purple-500/20 via-fuchsia-500/10 to-transparent blur-2xl" />

      {/* Layer 2: topbar */}
      <div
        className="
          relative border-b border-white/10 bg-[#0b0b10]/90 backdrop-blur
          before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(85%_60%_at_10%_0%,rgba(124,58,237,0.15),transparent_60%),radial-gradient(80%_55%_at_90%_0%,rgba(56,189,248,0.12),transparent_55%)]
        "
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 md:px-4">
          {/* IZQUIERDA: logo + tag */}
          <div className="flex items-center gap-3">
            <Link href="/" className="group relative inline-flex items-center">
              <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-fuchsia-500/20 via-purple-500/20 to-sky-500/20 blur-md transition group-hover:blur-lg" />
              <Image
                src="https://res.cloudinary.com/dfd1byvwn/image/upload/v1763744966/ISOTIPO_aql89l.webp"
                alt="Beatbox Chile"
                width={30}
                height={30}
                className="relative rounded-full ring-2 ring-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.35)]"
                priority
              />
            </Link>

            {/* “tag” del panel */}
            <div className="relative hidden sm:block">
              <span className="absolute -inset-1 -skew-x-6 rounded bg-gradient-to-r from-purple-600/25 via-fuchsia-600/25 to-sky-500/25" />
              <span className="relative block -skew-x-6 px-3 py-1 text-xs font-black tracking-wide text-fuchsia-200 uppercase">
                Panel de Juez
              </span>
            </div>
          </div>

          {/* CENTRO: (opcional) slot para estado/ronda futura */}
          <div className="hidden md:flex items-center text-xs text-blue-100/70">
            {/* Ejemplo: <span>Evento: Nacional 2025 · Ronda: Octavos</span> */}
          </div>

          {/* DERECHA: botones + usuario */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-blue-50 hover:bg-white/10"
              title="Ir al inicio"
            >
              <FaHome className="h-3.5 w-3.5 text-sky-300 group-hover:drop-shadow-[0_0_6px_rgba(56,189,248,0.7)]" />
              <span className="hidden sm:inline">Inicio</span>
            </Link>

            {/* Menú de usuario */}
            <div className="relative" ref={ref}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="
                  inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900/70
                  px-2.5 py-1.5 text-xs text-blue-50 hover:bg-neutral-900
                "
              >
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt="Avatar"
                    width={22}
                    height={22}
                    className="rounded-full object-cover ring-1 ring-fuchsia-400/40"
                  />
                ) : (
                  <FaUserCircle className="h-4 w-4 text-fuchsia-200" />
                )}
                <span className="max-w-[9rem] truncate hidden sm:inline">{userName}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fuchsia-400 to-sky-400 shadow-[0_0_8px_2px_rgba(99,102,241,0.6)]" />
              </motion.button>

              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="
                    absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-white/10
                    bg-[#0c0c12]/95 shadow-[0_10px_30px_rgba(0,0,0,0.35)]
                  "
                >
                  <div className="bg-gradient-to-r from-fuchsia-600/10 via-purple-600/10 to-sky-500/10 p-2">
                    <Link
                      href="/perfil"
                      className="block rounded-md px-3 py-2 text-sm text-blue-100 hover:bg-white/5"
                      onClick={() => setOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-300 hover:bg-white/5"
                    >
                      <FaSignOutAlt className="h-3.5 w-3.5" />
                      Cerrar Sesión
                    </button>
                  </div>

                  {/* Línea glow inferior */}
                  <div className="h-0.5 w-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-sky-400" />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
