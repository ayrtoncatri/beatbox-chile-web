import React from "react";
import { ensureAdminPage } from "@/lib/permissions";
import MobileSidebar from "@/components/admin/home/MobileSidebar"; // Importa directo, SIN dynamic
import SidebarNav from "@/components/admin/home/SidebarNav"; // Importa directo, SIN dynamic

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin | Beatbox Chile",
  description: "Panel de administración de Beatbox Chile",
};

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
          <SidebarNav />
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