"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaCog, FaGavel, FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import AuthButtons from "@/components/home/AuthButtons";
import { useSession, signOut } from "next-auth/react";
import toast from "react-hot-toast";

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

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { data: session, status } = useSession();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/judge")) {
    return null;
  }

  const user = session?.user;
  const userRoles = (user as any)?.roles || [];
  const isAdmin = userRoles.includes("admin");
  const isJudge = userRoles.includes("judge");
  const userName = (user as any)?.nombres ?? user?.email;

  const handleLogout = () => {
    setIsProfileOpen(false);
    toast.success("Cerrando sesión...");
    signOut();
  };

  return (
    <header className="w-full bg-neutral-950 bg-opacity-90 py-3 shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 flex items-center justify-around gap-2">
        {/* Logo y nombre */}
        <div className="flex items-center justify-center gap-2 md:gap-3">
          <Link href="/">
            <Image
              src="/logo-beatboxchile.webp"
              alt="Logo Beatbox Chile"
              width={60}
              height={60}
              className="md:w-[70px] md:h-[70px] rounded-full border-2 border-blue-700 shadow"
              priority
              style={{ cursor: "pointer" }}
            />
          </Link>
          {/* <Link href="/" className="text-lg md:text-xl text-blue-100 font-extrabold tracking-tight hover:text-blue-300 transition">
            Beatbox Chile
          </Link> */}
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

        {/* Mostrar opciones de perfil o iniciar sesión - SOLO EN DESKTOP */}
        <div className="hidden md:flex items-center gap-1 md:gap-2">
          {!isClient || status === "loading" ? (
            <div className="animate-pulse bg-blue-900/60 rounded-lg px-4 py-2">
              <div className="text-blue-100 text-sm">Cargando...</div>
            </div>
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              {/* 1. El Botón Principal que abre el Dropdown */}
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-expanded={isProfileOpen}
                className="group flex items-center gap-2 rounded-full border border-blue-400/30 bg-neutral-900/60 px-2.5 py-1.5 text-sm text-blue-50 shadow-sm hover:bg-neutral-900/80 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt="Avatar"
                    width={24}
                    height={24}
                    className="rounded-full object-cover ring-1 ring-blue-300/40"
                  />
                ) : (
                  <FaUserCircle size={20} className="text-blue-100" />
                )}

                {/* Nombre más discreto y truncado */}
                <span className="max-w-[10rem] truncate hidden lg:inline font-medium">{userName}</span>

                <FaChevronDown
                  size={12}
                  className={`transition-transform ${isProfileOpen ? "rotate-180" : ""} text-blue-200 group-hover:text-blue-100`}
                />
              </button>

              {/* 2. El Menú Desplegable (Animado) */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute top-full right-0 mt-2 w-56 max-h-[70vh] overflow-auto rounded-xl border border-white/10 bg-neutral-950/95 backdrop-blur-md shadow-xl"
                  >
                    {/* Cabecera */}
                    <div className="px-3.5 py-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-white truncate">{userName}</p>
                      <p className="text-xs text-blue-300/80 truncate">{user.email}</p>
                    </div>

                    {/* Grupo principal */}
                    <div className="p-2.5 space-y-1.5">
                      <Link
                        href="/perfil"
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-blue-100 hover:bg-blue-900/30"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FaUserCircle className="w-4 h-4 text-blue-300" />
                        <span>Mi Perfil</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-blue-100 hover:bg-blue-900/30"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FaCog className="w-4 h-4 text-blue-300" />
                          <span>Panel Admin</span>
                        </Link>
                      )}

                      {isJudge && (
                        <Link
                          href="/judge/dashboard"
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-blue-100 hover:bg-purple-900/30"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FaGavel className="w-4 h-4 text-purple-300" />
                          <span>Panel Juez</span>
                        </Link>
                      )}
                    </div>

                    {/* Logout separado visualmente */}
                    <div className="px-2.5 py-2 border-t border-white/10">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-red-400 hover:bg-red-900/30"
                      >
                        <FaSignOutAlt className="w-4 h-4 text-red-300" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
              <div className="mt-10 border-t border-blue-800/40 pt-6">
                {!isClient || status === "loading" ? (
                  <div className="animate-pulse bg-blue-900/60 rounded-lg px-4 py-2 text-blue-100 text-lg">
                    Cargando...
                  </div>
                ) : user ? (
                  <div className="flex flex-col items-start gap-6">
                    {/* Perfil */}
                    <Link
                      href="/perfil"
                      className="flex items-center gap-3 text-2xl text-blue-100 font-semibold hover:text-blue-400"
                      onClick={() => setOpen(false)}
                    >
                      <FaUserCircle size={26} />
                      <span>{(user as any).nombres ?? user.email}</span>
                    </Link>

                    {/* Admin (¡con la lógica corregida!) */}
                    {(user as any)?.roles?.includes("admin") && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 text-2xl text-blue-100 font-semibold hover:text-blue-400"
                        onClick={() => setOpen(false)}
                      >
                        <FaCog size={26} />
                        <span>Admin</span>
                      </Link>
                    )}

                    {isJudge && (
                      <Link
                        href="/judge/dashboard"
                        className="flex items-center gap-3 text-2xl text-blue-100 font-semibold hover:text-blue-400"
                        onClick={() => setOpen(false)}
                      >
                        <FaGavel size={26} />
                        <span>Panel Juez</span>
                      </Link>
                    )}

                    {/* Cerrar Sesión */}
                    <button
                      onClick={() => {
                        setOpen(false);
                        toast.success("Cerrando sesión...");
                        signOut();
                      }}
                      className="flex items-center gap-3 text-2xl text-blue-100 font-semibold hover:text-blue-400"
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
    </header>
  );
}