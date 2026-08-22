"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaTimes,
  FaUserCircle,
  FaCog,
  FaGavel,
  FaSignOutAlt,
} from "react-icons/fa";
import AuthButtons from "@/components/home/AuthButtons";
import { MobileMenuPortal } from "./MobileMenuPortal";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Historial competitivo", href: "/historial-competitivo" },
  { label: "Estadísticas", href: "/estadisticas" },
  { label: "Quiénes Somos", href: "/quienes-somos" },
  {
    label: "Ligas",
    category: true,
    subItems: [
      { label: "Liga competitiva", href: "/liga-competitiva" },
      { label: "Liga Terapéutica", href: "/liga-terapeutica" },
    ],
  },
  { label: "Eventos", href: "/eventos" },
];

interface MobileMenuProps {
  open: boolean;
  setOpen: (value: boolean) => void;

  isClient: boolean;
  status: "loading" | "authenticated" | "unauthenticated";
  user: any; // puedes tiparlo con Session["user"] si quieres
  isAdmin: boolean;
  isJudge: boolean;
  userName: string | null;
  handleLogout: () => void;
}

export function MobileMenu({
  open,
  setOpen,
  isClient,
  status,
  user,
  isAdmin,
  isJudge,
  userName,
  handleLogout,
}: MobileMenuProps) {
  // 🔹 Control interno para permitir animación de salida
  const [shouldRender, setShouldRender] = useState(open);

  // Cuando open pasa a true, montamos el menú
  useEffect(() => {
    if (open) setShouldRender(true);
  }, [open]);

  // Si no debería renderizarse (menú cerrado y animación ya terminó), no pintamos nada
  if (!shouldRender) return null;

  return (
    <MobileMenuPortal>
      <AnimatePresence
        // Cuando termina la animación de salida, desmontamos el contenido
        onExitComplete={() => {
          if (!open) setShouldRender(false);
        }}
      >
        {open && (
          <>
            {/* FONDO OSCURECIDO GLOBAL */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.95 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* PANEL LATERAL GLOBAL */}
            <motion.nav
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 right-0 z-[9999] flex h-full w-4/5 max-w-xs flex-col overflow-y-auto border-l border-cyan-300/25 bg-[#070915]/95 p-8 pb-10 shadow-[0_0_40px_rgba(34,211,238,0.12)] backdrop-blur-xl md:hidden"
            >
              <button
                className="mb-10 self-end text-white/90 transition hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
              >
                <FaTimes size={28} />
              </button>

              {/* Links principales */}
              <ul className="flex flex-col gap-8">
                {navItems
                  .filter((item) => !item.subItems)
                  .map((item, idx) => (
                    <motion.li
                      key={item.label}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ delay: 0.1 + idx * 0.06 }}
                    >
                      <Link
                        href={item.href!}
                        className="px-2 py-1 text-2xl font-black uppercase italic tracking-tighter text-white transition hover:text-cyan-300"
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}

                {navItems
                  .filter((item) => item.subItems)
                  .map((item) =>
                    item.subItems?.map((subItem, idx) => (
                      <motion.li
                        key={subItem.href}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ delay: 0.1 + idx * 0.06 }}
                      >
                        <Link
                          href={subItem.href}
                          className="px-2 py-1 text-2xl font-black uppercase italic tracking-tighter text-white/80 transition hover:text-fuchsia-300"
                          onClick={() => setOpen(false)}
                        >
                          {subItem.label}
                        </Link>
                      </motion.li>
                    ))
                  )}
              </ul>

              {/* Zona inferior: perfil / auth */}
              <div className="mt-10 border-t border-white/10 pt-6">
                {!isClient || status === "loading" ? (
                  <div className="animate-pulse rounded-full bg-white/10 px-4 py-2 text-lg text-cyan-100">
                    Cargando...
                  </div>
                ) : user ? (
                  <div className="flex flex-col items-start gap-6">
                    <Link
                      href="/perfil"
                      className="flex items-center gap-3 text-xl font-black text-white hover:text-cyan-300"
                      onClick={() => setOpen(false)}
                    >
                      <FaUserCircle size={26} className="text-cyan-300" />
                      <span>{userName}</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 text-xl font-black text-white hover:text-fuchsia-300"
                        onClick={() => setOpen(false)}
                      >
                        <FaCog size={26} className="text-fuchsia-300" />
                        <span>Panel Admin</span>
                      </Link>
                    )}

                    {isJudge && (
                      <Link
                        href="/judge/dashboard"
                        className="flex items-center gap-3 text-xl font-black text-white hover:text-fuchsia-300"
                        onClick={() => setOpen(false)}
                      >
                        <FaGavel size={26} className="text-fuchsia-300" />
                        <span>Panel Juez</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                      className="flex items-center gap-3 text-xl font-black text-fuchsia-300 hover:text-fuchsia-200"
                    >
                      <FaSignOutAlt size={26} />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                ) : (
                  <AuthButtons setOpen={setOpen} />
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </MobileMenuPortal>
  );
}
