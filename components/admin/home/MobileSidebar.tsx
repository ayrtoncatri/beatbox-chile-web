"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HomeIcon,
  UserIcon,
  TicketIcon,
  CalendarDaysIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
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
  
  { href: "/admin/eventos", label: "Eventos", icon: <CalendarDaysIcon className="w-5 h-5" /> },
  { href: "/admin/compras", label: "Compras", icon: <ShoppingCartIcon className="w-5 h-5" /> },
  { href: "/admin/sugerencias", label: "Sugerencias", icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
];

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        className="md:hidden p-2 rounded hover:bg-indigo-50"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
      >
        <Bars3Icon className="w-7 h-7 text-indigo-600" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-white h-full shadow-lg flex flex-col p-6 z-50">
            {/* ...logo y botón cerrar... */}
            <nav className="flex flex-col gap-1 text-[15px] font-medium">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded transition-colors
                    ${
                      pathname === link.href
                        ? "bg-indigo-100 text-indigo-700 shadow"
                        : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                    }
                  `}
                  onClick={() => setOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>
            {/* ...footer... */}
          </aside>
        </div>
      )}
    </>
  );
}