import React from "react";
import Link from "next/link";
import { ensureAdminPage } from "@/lib/permissions";
import MobileSidebar from "@/components/admin/home/MobileSidebar"; // Importa directo, SIN dynamic

export const metadata = {
  title: "Admin | Beatbox Chile",
  description: "Panel de administración de Beatbox Chile",
};

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/wildcards", label: "Wildcards" },
  { href: "/admin/eventos", label: "Eventos" },
  { href: "/admin/compras", label: "Compras" },
  { href: "/admin/sugerencias", label: "Sugerencias" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await ensureAdminPage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-indigo-600 w-9 h-9 flex items-center justify-center text-white font-bold text-lg shadow">
            BB
          </div>
          <span className="text-base font-bold tracking-tight text-gray-800">Beatbox Admin</span>
        </div>
        {/* Mobile menu button */}
        <MobileSidebar />
      </div>
      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="w-64 hidden md:flex flex-col gap-2 border-r bg-white/90 backdrop-blur-lg p-6 sticky top-0 h-screen shadow-lg">
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
                prefetch={link.href === "/admin"}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto pt-8 text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Beatbox Chile
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1 p-4 md:p-10">{children}</main>
      </div>
    </div>
  );
}