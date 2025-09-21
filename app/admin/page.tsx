import React from "react";

export default async function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <p className="text-sm text-gray-600">
        Bienvenido al panel de administración. Usa la navegación para gestionar usuarios, wildcards, eventos, compras y sugerencias.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-gray-500">Usuarios</div>
          <div className="mt-2 text-2xl font-bold">—</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-gray-500">Wildcards</div>
          <div className="mt-2 text-2xl font-bold">—</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-gray-500">Eventos</div>
          <div className="mt-2 text-2xl font-bold">—</div>
        </div>
      </div>
    </div>
  );
}