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
      "font-black italic uppercase tracking-wider transition-colors duration-300 px-4 py-2 rounded-xl focus:outline-none relative text-sm";

    if (isActive) {
      return `${baseClass} text-[#00F0FF] bg-[#00F0FF]/10 border-l-4 border-[#FF0055]`;
    } else {
      return `${baseClass} text-[#FFFFFF] hover:text-[#00F0FF] hover:bg-[#FFFFFF]/5`;
    }
  };

  return (
    <>
      {/* TOP BAR INSTITUCIONAL - FONDO NEGRO SÓLIDO */}
      <div className="w-full bg-[#000000] py-2 border-b border-[#333333] z-[1301] relative flex justify-center items-center">
        <span className="text-[9px] md:text-[11px] font-black tracking-[0.4em] uppercase text-[#FFFFFF] text-center px-4">
          Asociación Nacional de Beatbox Profesional
        </span>
      </div>

      {/* HEADER PRINCIPAL - DEGRADADO LIMPIO (Azul Marino a Azul Eléctrico) */}
      <header className="w-full bg-gradient-to-r from-[#0B132B] to-[#152554] border-b border-[#00F0FF]/20 py-3 shadow-lg sticky top-0 z-[1300]">
        
        <nav className="max-w-[1400px] mx-auto px-4 flex items-center justify-between lg:justify-around gap-2 relative">
          {/* Logo */}
          <div className="flex items-center justify-center shrink-0">
            <Link href="/" className="relative group">
              <Image
                src="https://res.cloudinary.com/dfd1byvwn/image/upload/v1763744966/ISOTIPO_aql89l.webp"
                alt="Logo Asociación"
                width={55}
                height={55}
                className="relative w-[45px] h-[45px] md:w-[55px] md:h-[55px] rounded-full border-2 border-[#FFFFFF]/20 shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:border-[#00F0FF]"
                priority
              />
            </Link>
          </div>

          {/* Nav desktop */}
          <ul className="hidden lg:flex gap-1 xl:gap-3 justify-center items-center flex-1">
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
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-[#0B132B] border border-[#00F0FF]/30 shadow-2xl z-10 w-56 py-2 rounded-xl"
                  >
                    <ul className="flex flex-col">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.href}>
                          <Link
                            href={subItem.href}
                            className="text-[#FFFFFF] font-black italic uppercase tracking-tight hover:text-[#00F0FF] hover:bg-[#FFFFFF]/5 transition-colors px-4 py-2.5 block text-sm border-l-4 border-transparent hover:border-[#FF0055]"
                          >
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {item.subItems ? (
                  <span
                    className={
                      getLinkClasses(item.href) +
                      " cursor-pointer flex items-center gap-1.5 group"
                    }
                  >
                    {item.label}
                    <FaChevronDown size={10} className="text-[#FFFFFF]/50 group-hover:text-[#00F0FF] transition-colors" />
                  </span>
                ) : (
                  <Link href={item.href!} className={getLinkClasses(item.href)}>
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Perfil / auth desktop */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {!isClient || status === "loading" ? (
              <div className="animate-pulse bg-[#FFFFFF]/10 rounded-xl w-32 h-10"></div>
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-expanded={isProfileOpen}
                  className="group flex items-center gap-2.5 rounded-xl border border-[#FFFFFF]/20 bg-[#FFFFFF]/5 px-3 py-1.5 text-sm text-[#FFFFFF] hover:bg-[#FFFFFF]/10 hover:border-[#00F0FF] transition-colors focus:outline-none"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt="Avatar"
                      width={28}
                      height={28}
                      className="rounded-full object-cover ring-2 ring-[#00F0FF]/50"
                    />
                  ) : (
                    <FaUserCircle size={24} className="text-[#FFFFFF]/70 group-hover:text-[#00F0FF] transition-colors" />
                  )}

                  <span className="max-w-[8rem] truncate hidden xl:inline font-bold tracking-wide text-xs">
                    {userName}
                  </span>

                  <FaChevronDown
                    size={10}
                    className={`transition-transform duration-300 ${
                      isProfileOpen ? "rotate-180 text-[#00F0FF]" : "text-[#FFFFFF]/50"
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full right-0 mt-3 w-64 rounded-xl border border-[#00F0FF]/30 bg-[#0B132B] shadow-2xl z-50 overflow-hidden"
                    >
                      {/* Cabecera */}
                      <div className="px-4 py-3 bg-[#FFFFFF]/5 border-b border-[#FFFFFF]/10">
                        <p className="text-sm font-bold text-[#FFFFFF] truncate">{userName}</p>
                        <p className="text-xs text-[#FFFFFF]/50 truncate mt-0.5">{user.email}</p>
                      </div>

                      {/* Grupo principal */}
                      <div className="p-2 space-y-1">
                        <Link
                          href="/perfil"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#FFFFFF] hover:text-[#00F0FF] hover:bg-[#FFFFFF]/5 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FaUserCircle className="w-4 h-4 text-[#00F0FF]" />
                          <span className="font-medium">Mi Perfil</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#FFFFFF] hover:text-[#00F0FF] hover:bg-[#FFFFFF]/5 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <FaCog className="w-4 h-4 text-[#FF0055]" />
                            <span className="font-medium">Panel Admin</span>
                          </Link>
                        )}

                        {isJudge && (
                          <Link
                            href="/judge/dashboard"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#FFFFFF] hover:text-[#00F0FF] hover:bg-[#FFFFFF]/5 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <FaGavel className="w-4 h-4 text-[#FF0055]" />
                            <span className="font-medium">Panel Juez</span>
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="p-2 border-t border-[#FFFFFF]/10 bg-[#000000]/30">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#FF0055] hover:bg-[#FF0055]/10 transition-colors"
                        >
                          <FaSignOutAlt className="w-4 h-4" />
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
            className="lg:hidden p-2 text-[#FFFFFF] hover:text-[#00F0FF] focus:outline-none transition-colors"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            <FaBars size={26} />
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