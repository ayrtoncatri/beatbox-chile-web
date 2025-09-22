"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/wildcards", label: "Wildcards" },
  { href: "/admin/eventos", label: "Eventos" },
  { href: "/admin/compras", label: "Compras" },
  { href: "/admin/sugerencias", label: "Sugerencias" },
];

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);

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
            <button
              className="absolute top-4 right-4 p-2 rounded hover:bg-indigo-50"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
            <div className="mb-8 flex items-center gap-2">
              <div className="rounded-full bg-indigo-600 w-10 h-10 flex items-center justify-center text-white font-bold text-xl shadow">
                BB
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-800">Beatbox Admin</span>
            </div>
            <nav className="flex flex-col gap-1 text-[15px] font-medium">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded transition-colors hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-100 focus:outline-none"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-8 text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Beatbox Chile
            </div>
          </aside>
        </div>
      )}
    </>
  );
}