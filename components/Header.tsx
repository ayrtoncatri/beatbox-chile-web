"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  FaBars,
  FaUserCircle,
  FaChevronDown,
  FaCog,
  FaGavel,
  FaSignOutAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import AuthButtons from "@/components/home/AuthButtons";
import { useSession, signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { MobileMenu } from "@/components/layout/MobileMenu";

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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Ocultar header en admin / judge
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/judge")) {
    return null;
  }

  const user = session?.user as any;
  const userRoles = user?.roles || [];
  const isAdmin = userRoles.includes("admin");
  const isJudge = userRoles.includes("judge");
  const userName = user?.nombres ?? user?.email ?? null;

  const handleLogout = () => {
    setIsProfileOpen(false);
    toast.success("Cerrando sesión...");
    signOut();
  };

  const getLinkClasses = (href?: string) => {
    const isActive = href && pathname?.startsWith(href);

    const baseClass =
      "font-black italic uppercase tracking-wider transition px-3 py-2 rounded-lg focus:outline-none relative";

    if (isActive) {
      return `${baseClass} bg-red-600/40 text-white shadow-inner shadow-red-500/20 border border-red-500/50`;
    } else {
      return `${baseClass} text-white/90 hover:text-blue-400 hover:bg-blue-900/30`;
    }
  };

  return (
    <>
      <header className="w-full bg-gradient-to-r from-blue-950/70 via-red-950/70 to-blue-950/70 backdrop-blur-lg border-b border-blue-700/20 py-4 shadow-xl shadow-black/50 sticky top-0 z-[1300]">
        <nav className="max-w-7xl mx-auto px-4 flex items-center justify-around gap-2">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 md:gap-3">
            <Link href="/">
              <Image
                src="/logo-beatboxchile.webp"
                alt="Logo Beatbox Chile"
                width={60}
                height={60}
                className="md:w-[60px] md:h-[60px] rounded-full border-2 border-cyan-400 shadow-xl shadow-cyan-900/40 transition-all duration-300 hover:shadow-red-400/40"
                priority
                style={{ cursor: "pointer" }}
              />
            </Link>
          </div>

          {/* Nav desktop */}
          <ul className="hidden md:flex gap-3 md:gap-4 lg:gap-6 justify-center items-center flex-wrap max-w-full">
            {navItems.map((item) => (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={() =>
                  item.subItems && setHoveredCategory(item.label)
                }
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {item.subItems && hoveredCategory === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 bg-[#0c0c12]/95 border border-white/10 shadow-lg shadow-blue-900/40 z-10 w-48 py-2 rounded-lg backdrop-blur-lg"
                  >
                    <ul className="text-center">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.href} className="text-center">
                          <Link
                            href={subItem.href}
                            className="text-white font-black italic uppercase tracking-tight hover:text-blue-400 transition px-4 py-2 block text-center"
                          >
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {item.subItems && (
                  <span
                    className={
                      getLinkClasses(item.href) +
                      " cursor-pointer flex items-center gap-1"
                    }
                  >
                    {item.label}
                    <FaChevronDown size={10} className="text-white/50" />
                  </span>
                )}

                {!item.subItems && (
                  <Link href={item.href!} className={getLinkClasses(item.href)}>
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Perfil / auth desktop */}
          <div className="hidden md:flex items-center gap-1 md:gap-2">
            {!isClient || status === "loading" ? (
              <div className="animate-pulse bg-blue-900/60 rounded-full w-24 h-8"></div>
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-expanded={isProfileOpen}
                  className="group flex items-center gap-2 rounded-full border border-blue-400/50 bg-[#0c0c12]/80 px-3 py-1.5 text-sm text-white/90 hover:bg-blue-900/30 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt="Avatar"
                      width={24}
                      height={24}
                      className="rounded-full object-cover ring-1 ring-white/40"
                    />
                  ) : (
                    <FaUserCircle size={20} className="text-blue-400" />
                  )}

                  <span className="max-w-[8rem] truncate hidden lg:inline font-black italic tracking-tight">
                    {userName}
                  </span>

                  <FaChevronDown
                    size={12}
                    className={`transition-transform ${
                      isProfileOpen ? "rotate-180" : ""
                    } text-white/70 group-hover:text-white`}
                  />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute top-full right-0 mt-3 w-64 max-h-[70vh] overflow-auto rounded-xl border border-white/10 bg-[#0c0c12]/95 backdrop-blur-xl shadow-2xl shadow-blue-900/40"
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

          {/* BOTÓN HAMBURGUESA MOBILE */}
          <button
            className="md:hidden p-2 text-white/90 hover:text-red-400 focus:outline-none"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            <FaBars size={28} />
          </button>
        </nav>
      </header>

      {/* Menú móvil global por portal */}
      <MobileMenu
        open={open}
        setOpen={setOpen}
        isClient={isClient}
        status={status}
        user={user}
        isAdmin={isAdmin}
        isJudge={isJudge}
        userName={userName}
        handleLogout={handleLogout}
      />
    </>
  );
}
