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
  const [scrolled, setScrolled] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setOpen(false);
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
    const baseClass = "font-black italic uppercase tracking-widest transition-all duration-300 px-4 py-2 rounded-md focus:outline-none relative text-[13px] z-10 overflow-hidden group border border-transparent";

    if (isActive) {
      return `${baseClass} text-[#00F0FF] bg-zinc-900/50 border-zinc-600/50 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]`;
    } else {
      return `${baseClass} text-zinc-300 hover:text-white hover:border-zinc-500/30 hover:bg-zinc-800/40`;
    }
  };

  return (
    <header className="w-full sticky top-0 z-[1300] flex flex-col relative">
      
      {/* EFECTO DE FONDO DEL HEADER (Hardware Texturizado) */}
      <div className="absolute inset-0 bg-[#0a0a0c] pointer-events-none z-0"></div>
      <div className={`absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none z-0 transition-opacity duration-500 ${scrolled ? 'opacity-[0.05] bg-[#050505]' : ''}`}></div>

      {/* TOP BAR - Separador Metálico */}
      <div className="w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 py-1.5 border-b-2 border-zinc-400/20 relative flex justify-between items-center px-4 z-10 shadow-sm">
        {/* Simulación de ecualizador decorativo izquierdo */}
        <div className="hidden md:flex items-end gap-0.5 h-3 opacity-30">
          <div className="w-1 h-2 bg-white rounded-t-sm"></div>
          <div className="w-1 h-3 bg-white rounded-t-sm"></div>
          <div className="w-1 h-1 bg-white rounded-t-sm"></div>
          <div className="w-1 h-2 bg-white rounded-t-sm"></div>
        </div>
        
        <span className="text-[9px] md:text-[10px] font-black tracking-[0.4em] uppercase text-zinc-300 text-center flex-1 drop-shadow-md">
          Asociación Nacional de Beatbox Profesional
        </span>

        {/* Simulación de ecualizador decorativo derecho */}
        <div className="hidden md:flex items-end gap-0.5 h-3 opacity-30">
          <div className="w-1 h-2 bg-white rounded-t-sm"></div>
          <div className="w-1 h-1 bg-white rounded-t-sm"></div>
          <div className="w-1 h-3 bg-white rounded-t-sm"></div>
          <div className="w-1 h-2 bg-white rounded-t-sm"></div>
        </div>
      </div>

      {/* HEADER PRINCIPAL - Borde Gris Claro e Identidad */}
      <div className={`w-full transition-all duration-500 relative z-10 border-b border-zinc-500/40 ${
        scrolled ? "backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] py-2" : "py-4"
      }`}>
        
        <nav className="max-w-[1400px] mx-auto px-4 flex items-center justify-between lg:justify-around gap-2 relative">
          
          {/* Logo Estructurado */}
          <div className="flex items-center justify-center shrink-0">
            <Link href="/" className="relative group">
              {/* Aro exterior metálico */}
              <div className="absolute -inset-1 bg-gradient-to-br from-zinc-400/30 to-zinc-800/30 rounded-full blur-sm group-hover:from-[#00F0FF]/40 group-hover:to-[#FF0055]/40 transition-all duration-500"></div>
              <Image
                src="https://res.cloudinary.com/dfd1byvwn/image/upload/v1763744966/ISOTIPO_aql89l.webp"
                alt="Logo Asociación"
                width={60}
                height={60}
                className="relative w-[50px] h-[50px] md:w-[60px] md:h-[60px] rounded-full border-2 border-zinc-300/50 shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105"
                priority
              />
            </Link>
          </div>

          {/* Nav desktop - Paneles modulares */}
          <ul className="hidden lg:flex gap-2 xl:gap-3 justify-center items-center flex-1 bg-black/20 p-1.5 rounded-lg border border-zinc-700/50 shadow-inner">
            {navItems.map((item) => (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={() => item.subItems && setHoveredCategory(item.label)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {item.subItems && hoveredCategory === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-zinc-900 border-2 border-zinc-600 shadow-[0_20px_40px_rgba(0,0,0,0.9)] z-20 w-56 py-2 rounded-xl"
                  >
                    <ul className="flex flex-col">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.href}>
                          <Link
                            href={subItem.href}
                            className="text-zinc-300 font-black italic uppercase tracking-widest hover:text-[#00F0FF] transition-all px-5 py-3 block text-[12px] border-l-4 border-transparent hover:border-[#00F0FF] hover:bg-zinc-800"
                          >
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {item.subItems ? (
                  <span className={getLinkClasses(item.href) + " cursor-pointer flex items-center gap-2"}>
                    <span className="relative z-10">{item.label}</span>
                    <FaChevronDown size={10} className="text-zinc-400 group-hover:text-[#00F0FF] transition-colors relative z-10" />
                  </span>
                ) : (
                  <Link href={item.href!} className={getLinkClasses(item.href)}>
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Perfil / Auth Desktop */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {!isClient || status === "loading" ? (
              <div className="animate-pulse bg-zinc-800 rounded-lg w-32 h-10 border border-zinc-600"></div>
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-expanded={isProfileOpen}
                  className="group flex items-center gap-3 rounded-lg border border-zinc-500/50 bg-gradient-to-b from-zinc-800 to-zinc-950 px-3 py-1.5 text-sm text-zinc-200 hover:text-white hover:border-zinc-400 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt="Avatar"
                      width={28}
                      height={28}
                      className="rounded-md object-cover border border-zinc-500"
                    />
                  ) : (
                    <FaUserCircle size={26} className="text-zinc-400 group-hover:text-[#00F0FF] transition-colors" />
                  )}

                  <span className="max-w-[8rem] truncate hidden xl:inline font-bold tracking-wide text-[13px]">
                    {userName}
                  </span>

                  <FaChevronDown
                    size={10}
                    className={`transition-transform duration-300 ${isProfileOpen ? "rotate-180 text-[#00F0FF]" : "text-zinc-500"}`}
                  />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-3 w-64 rounded-xl border-2 border-zinc-600 bg-zinc-950 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 overflow-hidden"
                    >
                      <div className="px-5 py-4 bg-zinc-900 border-b border-zinc-700">
                        <p className="text-sm font-bold text-white truncate">{userName}</p>
                        <p className="text-xs text-zinc-400 truncate mt-1">{user.email}</p>
                      </div>

                      <div className="p-2 space-y-1">
                        <Link href="/perfil" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors group" onClick={() => setIsProfileOpen(false)}>
                          <FaUserCircle className="w-4 h-4 text-zinc-500 group-hover:text-[#00F0FF]" />
                          <span className="font-medium tracking-wide">Mi Perfil</span>
                        </Link>
                        {isAdmin && (
                          <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors group" onClick={() => setIsProfileOpen(false)}>
                            <FaCog className="w-4 h-4 text-zinc-500 group-hover:text-[#FF0055]" />
                            <span className="font-medium tracking-wide">Panel Admin</span>
                          </Link>
                        )}
                        {isJudge && (
                          <Link href="/judge/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors group" onClick={() => setIsProfileOpen(false)}>
                            <FaGavel className="w-4 h-4 text-zinc-500 group-hover:text-[#FF0055]" />
                            <span className="font-medium tracking-wide">Panel Juez</span>
                          </Link>
                        )}
                      </div>

                      <div className="p-2 border-t border-zinc-800 bg-black">
                        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#FF0055] hover:bg-[#FF0055]/10 transition-colors">
                          <FaSignOutAlt className="w-4 h-4" />
                          <span className="tracking-wide">Cerrar Sesión</span>
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

          {/* BOTÓN HAMBURGUESA MOBILE - Enmarcado en gris claro */}
          <button
            className="lg:hidden p-2 text-zinc-300 hover:text-white border border-zinc-500/50 rounded-lg bg-zinc-900 focus:outline-none transition-colors shadow-sm"
            onClick={() => setOpen(!open)}
          >
            <FaBars size={22} />
          </button>
        </nav>
      </div>

      <MobileMenu open={open} setOpen={setOpen} isClient={isClient} status={status} user={user} isAdmin={isAdmin} isJudge={isJudge} userName={userName} handleLogout={handleLogout} />
    </header>
  );
}