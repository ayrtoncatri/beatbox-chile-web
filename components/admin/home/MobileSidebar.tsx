"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
  HomeIcon,
  UserIcon,
  TicketIcon,
  CalendarDaysIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: <HomeIcon className="w-5 h-5" /> },
  { href: "/admin/usuarios", label: "Usuarios", icon: <UserIcon className="w-5 h-5" /> },
  { href: "/admin/wildcards", label: "Wildcards", icon: <TicketIcon className="w-5 h-5" /> },
  
  { 
    href: "/admin/inscripciones", 
    label: "Inscripciones", 
    icon: <ClipboardDocumentListIcon className="w-5 h-5" /> 
  },

  { 
    href: "/admin/clasificacion", 
    label: "Clasificación CN", 
    icon: <TrophyIcon className="w-5 h-5" /> 
  },
  
  { href: "/admin/eventos", label: "Eventos", icon: <CalendarDaysIcon className="w-5 h-5" /> },
  { href: "/admin/compras", label: "Compras", icon: <ShoppingCartIcon className="w-5 h-5" /> },
  { href: "/admin/sugerencias", label: "Sugerencias", icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
];

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevenir scroll del body cuando el sidebar está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const sidebarContent = open && mounted ? (
    <>
      {/* Overlay - completamente opaco */}
      <div 
        className="fixed inset-0 bg-black z-[9998] md:hidden" 
        onClick={() => setOpen(false)}
      />
      {/* Sidebar - fondo completamente sólido sin transparencias */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-900 via-blue-950 to-black shadow-[0_0_50px_rgba(0,0,0,1)] flex flex-col p-6 z-[9999] border-r-4 border-blue-600 md:hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 w-10 h-10 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  BB
                </div>
                <span className="text-lg font-bold tracking-tight text-blue-100">Beatbox Admin</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-blue-800/50 text-blue-200 transition-colors"
                aria-label="Cerrar menú"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 text-[15px] font-medium">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                    ${
                      pathname === link.href
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50"
                        : "text-blue-200 hover:bg-blue-800/50 hover:text-blue-100"
                    }
                  `}
                  onClick={() => setOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-8 text-xs text-blue-400/70">
              &copy; {new Date().getFullYear()} Beatbox Chile
            </div>
          </aside>
    </>
  ) : null;

  return (
    <>
      <button
        className="md:hidden p-2 rounded-lg hover:bg-blue-800/50 transition-colors relative z-10"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
      >
        <Bars3Icon className="w-7 h-7 text-blue-200" />
      </button>
      {mounted && sidebarContent && createPortal(sidebarContent, document.body)}
    </>
  );
}