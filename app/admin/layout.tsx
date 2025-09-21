import React from "react";
import Link from "next/link";
import { ensureAdminPage } from "@/lib/permissions";

export const metadata = {
  title: "Admin | Beatbox Chile",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await ensureAdminPage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 hidden md:flex flex-col gap-1 border-r bg-white p-4 sticky top-0 h-screen">
          <div className="mb-4">
            <h1 className="text-lg font-semibold">Panel Admin</h1>
          </div>
          <nav className="flex flex-col gap-1 text-sm">
            <Link className="px-3 py-2 rounded hover:bg-gray-100" href="/admin">Dashboard</Link>
            <Link className="px-3 py-2 rounded hover:bg-gray-100" href="/admin/usuarios">Usuarios</Link>
            <Link className="px-3 py-2 rounded hover:bg-gray-100" href="/admin/wildcards">Wildcards</Link>
            <Link className="px-3 py-2 rounded hover:bg-gray-100" href="/admin/eventos">Eventos</Link>
            <Link className="px-3 py-2 rounded hover:bg-gray-100" href="/admin/compras">Compras</Link>
            <Link className="px-3 py-2 rounded hover:bg-gray-100" href="/admin/sugerencias">Sugerencias</Link>
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}