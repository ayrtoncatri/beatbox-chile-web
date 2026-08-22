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

  const isItemActive = (href?: string, subItems?: { href: string }[]) => {
    if (subItems?.some((sub) => pathname?.startsWith(sub.href))) return true;
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return Boolean(pathname?.startsWith(href));
  };

  const getLinkClasses = (href?: string, subItems?: { href: string }[]) => {
    const isActive = isItemActive(href, subItems);
    const baseClass =
      "relative z-10 inline-flex items-center gap-1.5 px-2.5 py-2 text-[12px] font-black uppercase tracking-[0.14em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200 xl:px-3 xl:text-[13px]";

    if (isActive) {
      return `${baseClass} text-cyan-300`;
    }
    return `${baseClass} text-white hover:text-cyan-200`;
  };

  return (
    <header className="sticky top-0 z-[1300] w-full bg-transparent">
      <div className="px-3 pt-3 sm:px-5 sm:pt-4">
        <nav
          className={`mx-auto flex max-w-[1400px] items-center justify-between gap-3 rounded-full border px-3 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition-all duration-300 sm:px-5 ${
            scrolled
              ? "border-white/20 bg-black/70 backdrop-blur-2xl"
              : "border-white/15 bg-black/45 backdrop-blur-xl"
          }`}
        >
          <Link href="/" className="group flex min-w-0 items-center gap-2.5 shrink-0">
            <Image
              src="https://res.cloudinary.com/dfd1byvwn/image/upload/v1763744966/ISOTIPO_aql89l.webp"
              alt="Logo Asociación"
              width={44}
              height={44}
              className="h-10 w-10 rounded-full object-cover ring-1 ring-cyan-300/40 transition duration-300 group-hover:ring-fuchsia-300/60 sm:h-11 sm:w-11"
              priority
            />
            <span className="hidden leading-[0.85] sm:flex sm:flex-col">
              <span className="font-[family-name:var(--font-display)] text-[15px] font-bold uppercase italic tracking-[0.08em] text-white xl:text-base">
                Beatbox
              </span>
              <span className="font-[family-name:var(--font-display)] text-[15px] font-bold uppercase italic tracking-[0.08em] text-white xl:text-base">
                Chile
              </span>
            </span>
          </Link>

          <ul className="hidden lg:flex flex-1 items-center justify-center gap-0.5 xl:gap-1">
            {navItems.map((item) => {
              const active = isItemActive(item.href, item.subItems);
              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.subItems && setHoveredCategory(item.label)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {item.subItems && hoveredCategory === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-1/2 z-20 mt-4 w-56 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/15 bg-black/90 py-2 shadow-[0_20px_40px_rgba(0,0,0,0.9)] backdrop-blur-xl"
                    >
                      <ul className="flex flex-col">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className="block px-5 py-3 text-[12px] font-black uppercase tracking-widest text-white/80 transition-all hover:bg-white/5 hover:text-cyan-300"
                            >
                              {subItem.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {item.subItems ? (
                    <span className={getLinkClasses(item.href, item.subItems) + " cursor-pointer"}>
                      {item.label}
                      <FaChevronDown size={9} className={active ? "text-cyan-300" : "text-white/50"} />
                      {active && (
                        <span className="absolute bottom-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
                      )}
                    </span>
                  ) : (
                    <Link href={item.href!} className={getLinkClasses(item.href)}>
                      {item.label}
                      {active && (
                        <span className="absolute bottom-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            {!isClient || status === "loading" ? (
              <div className="h-10 w-32 animate-pulse rounded-full border border-white/15 bg-white/10"></div>
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-expanded={isProfileOpen}
                  className="group flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white transition hover:border-cyan-300/50 hover:text-cyan-100"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt="Avatar"
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle size={22} className="text-cyan-300" />
                  )}

                  <span className="max-w-[8rem] truncate hidden xl:inline text-[12px] font-bold uppercase tracking-wide">
                    {userName}
                  </span>

                  <FaChevronDown
                    size={10}
                    className={`transition-transform duration-300 ${isProfileOpen ? "rotate-180 text-cyan-300" : "text-white/50"}`}
                  />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-white/15 bg-black/95 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl"
                    >
                      <div className="border-b border-white/10 px-5 py-4">
                        <p className="truncate text-sm font-bold text-white">{userName}</p>
                        <p className="mt-1 truncate text-xs text-white/50">{user.email}</p>
                      </div>

                      <div className="space-y-1 p-2">
                        <Link href="/perfil" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-cyan-200" onClick={() => setIsProfileOpen(false)}>
                          <FaUserCircle className="h-4 w-4 text-cyan-300" />
                          <span className="font-medium tracking-wide">Mi Perfil</span>
                        </Link>
                        {isAdmin && (
                          <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-fuchsia-200" onClick={() => setIsProfileOpen(false)}>
                            <FaCog className="h-4 w-4 text-fuchsia-300" />
                            <span className="font-medium tracking-wide">Panel Admin</span>
                          </Link>
                        )}
                        {isJudge && (
                          <Link href="/judge/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-fuchsia-200" onClick={() => setIsProfileOpen(false)}>
                            <FaGavel className="h-4 w-4 text-fuchsia-300" />
                            <span className="font-medium tracking-wide">Panel Juez</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-white/10 p-2">
                        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-fuchsia-300 hover:bg-fuchsia-500/10">
                          <FaSignOutAlt className="h-4 w-4" />
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

          <button
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:border-cyan-300 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Abrir menú"
            aria-expanded={open}
          >
            <FaBars size={18} />
          </button>
        </nav>
      </div>

      <MobileMenu open={open} setOpen={setOpen} isClient={isClient} status={status} user={user} isAdmin={isAdmin} isJudge={isJudge} userName={userName} handleLogout={handleLogout} />
    </header>
  );
}
