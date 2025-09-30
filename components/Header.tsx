"use client";
import Link from "next/link";
import Image from "next/image";
import { useState,useEffect } from "react";
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import AuthButtons from "@/components/home/AuthButtons";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { label: "Historial competitivo", href: "/historial-competitivo" },
  { label: "Estadísticas", href: "/estadisticas" },
  { label: "Quiénes Somos", href: "/quienes-somos" },
  { label: "Ligas", category: true, subItems: [
      { label: "Liga competitiva", href: "/liga-competitiva" },
      { label: "Liga Terapéutica", href: "/liga-terapeutica" },
    ]
  },
  { label: "Eventos", category: true, subItems: [
      { label: "Entradas", href: "/compra-entradas" },
      { label: "Wildcard", href: "/wildcard" },
    ]
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="w-full bg-neutral-950 bg-opacity-90 py-3 shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-2">
        {/* Logo y nombre */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image
              src="/ISOTIPO-DEGRADADO.png"
              alt="Logo Beatbox Chile"
              width={50}
              height={50}
              className="rounded-full border-2 border-blue-700 shadow"
              priority
              style={{ cursor: "pointer" }}
            />
          </Link>
          <Link href="/" className="text-xl text-blue-100 font-extrabold tracking-tight hover:text-blue-300 transition">
            Beatbox Chile
          </Link>
        </div>

        {/* Navegación desktop */}
        <ul className="hidden md:flex gap-3 md:gap-4 lg:gap-6 justify-center items-center flex-wrap max-w-full">
          {navItems.map((item) => (
            <li
              key={item.label}
              className="relative"
              onMouseEnter={() => item.subItems && setHoveredCategory(item.label)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Subcategoría desplegable en hover */}
              {item.subItems && hoveredCategory === item.label && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 bg-neutral-900 border border-blue-800 shadow-lg z-10 w-40 py-2"
                >
                  <ul className="text-center">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.href} className="text-center">
                        <Link
                          href={subItem.href}
                          className="text-blue-100 font-semibold hover:text-blue-400 transition px-2 py-1 rounded-lg hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-600 block text-center"
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Item con subItems */}
              {item.subItems && (
                <span className="text-blue-100 font-semibold hover:text-blue-400 transition px-2 py-1 rounded-lg hover:bg-blue-900/30 cursor-pointer">
                  {item.label}
                </span>
              )}

              {/* Item normal */}
              {!item.subItems && (
                <Link
                  href={item.href}
                  className="text-blue-100 font-semibold hover:text-blue-400 transition px-2 py-1 rounded-lg hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Mostrar opciones de perfil o iniciar sesión */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-3">
              <Link href="/perfil">
                <div className="flex items-center gap-2 text-blue-100 hover:text-blue-300 transition">
                  <FaUserCircle size={32} />
                  <span>{session.user.name}</span>
                </div>
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-blue-100 hover:text-red-400 transition p-2 rounded-lg hover:bg-red-900/30"
                title="Cerrar sesión"
              >
                <FaSignOutAlt size={20} />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <AuthButtons />
          )}
        </div>

        {/* Hamburguesa mobile */}
        <button
          className="md:hidden p-2 text-blue-100 hover:text-blue-400 focus:outline-none"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <FaTimes size={28} /> : <FaBars size={28} />}
        </button>
      </nav>

      {/* Mobile menu - animado */}
      <AnimatePresence>
        {open && (
          <>
            {/* Fondo oscurecido con fade */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black z-40"
              onClick={() => setOpen(false)}
            />

            {/* Panel lateral animado */}
            <motion.nav
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-xs bg-neutral-900 border-l border-blue-800 z-50 shadow-2xl flex flex-col p-8 overflow-y-auto pb-10"
            >
              <button
                className="self-end mb-10 text-blue-100 hover:text-blue-400 focus:outline-none"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
              >
                <FaTimes size={28} />
              </button>
              <ul className="flex flex-col gap-8">
                {/* Items normales */}
                {navItems.filter(item => !item.subItems).map((item, idx) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.06 }}
                  >
                    <Link
                      href={item.href!}
                      className="text-2xl text-blue-100 font-semibold hover:text-blue-400 transition px-2 py-1 rounded-lg hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
                
                {/* Sub-items de items con categorías */}
                {navItems.filter(item => item.subItems).map((item) => 
                  item.subItems?.map((subItem, idx) => (
                    <motion.li
                      key={subItem.href}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.06 }}
                    >
                      <Link
                        href={subItem.href}
                        className="text-2xl text-blue-100 font-semibold hover:text-blue-400 transition px-2 py-1 rounded-lg hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        onClick={() => setOpen(false)}
                      >
                        {subItem.label}
                      </Link>
                    </motion.li>
                  ))
                )}
              </ul>
              {/* AuthButtons SOLO en mobile menu */}
              <div className="mt-10">
                <AuthButtons setOpen={setOpen} />
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}