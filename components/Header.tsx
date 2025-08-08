"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Historial competitivo", href: "/historial-competitivo" },
  { label: "Estadísticas", href: "/estadisticas" },
  { label: "Wildcard", href: "/wildcard" },
  { label: "Quiénes Somos", href: "/quienes-somos" },
  { label: "Liga competitiva", href: "/liga-competitiva" },
  { label: "Liga Terapéutica", href: "/liga-terapeutica" }
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-neutral-950 bg-opacity-90 py-3 shadow-md sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-2">
        {/* Logo y nombre */}
        <div className="flex items-center gap-3">
          <Image
            src="/ISOTIPO-DEGRADADO.png"
            alt="Logo Beatbox Chile"
            width={50}
            height={50}
            className="rounded-full border-2 border-blue-700 shadow"
            priority
          />
          <span className="text-xl text-blue-100 font-extrabold tracking-tight">Beatbox Chile</span>
        </div>

        {/* Navegación desktop */}
        <ul className="hidden md:flex gap-6 justify-center items-center">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-blue-100 font-semibold hover:text-blue-400 transition"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

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
              className="fixed top-0 right-0 h-full w-4/5 max-w-xs bg-neutral-900 border-l border-blue-800 z-50 shadow-2xl flex flex-col p-8"
            >
              <button
                className="self-end mb-10 text-blue-100 hover:text-blue-400 focus:outline-none"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
              >
                <FaTimes size={28} />
              </button>
              <ul className="flex flex-col gap-8">
                {navItems.map((item, idx) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.06 }}
                  >
                    <Link
                      href={item.href}
                      className="text-2xl text-blue-100 font-semibold hover:text-blue-400 transition"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
