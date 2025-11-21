"use client";

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
  user: any;          // puedes tiparlo con Session["user"] si quieres
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
  // Si está cerrado, no pintamos nada
  if (!open) return null;

  return (
    <MobileMenuPortal>
      <AnimatePresence>
        {open && (
          <>
            {/* FONDO OSCURECIDO GLOBAL */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.95 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-[9998] md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* PANEL LATERAL GLOBAL */}
            <motion.nav
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-xs bg-[#0c0c12]/95 border-l border-red-800/40 z-[9999] shadow-2xl shadow-red-900/40 flex flex-col p-8 overflow-y-auto pb-10 backdrop-blur-sm md:hidden"
            >
              <button
                className="self-end mb-10 text-white/90 hover:text-red-400 focus:outline-none"
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
                      transition={{ delay: 0.1 + idx * 0.06 }}
                    >
                      <Link
                        href={item.href!}
                        className="text-2xl text-white font-black italic uppercase tracking-tighter hover:text-red-400 transition px-2 py-1"
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
                        transition={{ delay: 0.1 + idx * 0.06 }}
                      >
                        <Link
                          href={subItem.href}
                          className="text-2xl text-white/80 font-black italic uppercase tracking-tighter hover:text-blue-400 transition px-2 py-1"
                          onClick={() => setOpen(false)}
                        >
                          {subItem.label}
                        </Link>
                      </motion.li>
                    ))
                  )}
              </ul>

              {/* Zona inferior: perfil / auth */}
              <div className="mt-10 border-t border-red-800/40 pt-6">
                {!isClient || status === "loading" ? (
                  <div className="animate-pulse bg-blue-900/60 rounded-lg px-4 py-2 text-blue-100 text-lg">
                    Cargando...
                  </div>
                ) : user ? (
                  <div className="flex flex-col items-start gap-6">
                    <Link
                      href="/perfil"
                      className="flex items-center gap-3 text-xl text-white font-black hover:text-blue-400"
                      onClick={() => setOpen(false)}
                    >
                      <FaUserCircle size={26} className="text-blue-400" />
                      <span>{userName}</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 text-xl text-white font-black hover:text-red-400"
                        onClick={() => setOpen(false)}
                      >
                        <FaCog size={26} className="text-red-400" />
                        <span>Panel Admin</span>
                      </Link>
                    )}

                    {isJudge && (
                      <Link
                        href="/judge/dashboard"
                        className="flex items-center gap-3 text-xl text-white font-black hover:text-red-400"
                        onClick={() => setOpen(false)}
                      >
                        <FaGavel size={26} className="text-red-400" />
                        <span>Panel Juez</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 text-xl text-red-400 font-black hover:text-red-300"
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
