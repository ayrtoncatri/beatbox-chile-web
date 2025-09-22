import React from "react";
import { UserIcon, TicketIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

const stats = [
  {
    label: "Usuarios",
    icon: <UserIcon className="w-7 h-7 text-indigo-500" />,
    value: "—",
    color: "from-indigo-100 to-indigo-50",
  },
  {
    label: "Wildcards",
    icon: <TicketIcon className="w-7 h-7 text-pink-500" />,
    value: "—",
    color: "from-pink-100 to-pink-50",
  },
  {
    label: "Eventos",
    icon: <CalendarDaysIcon className="w-7 h-7 text-emerald-500" />,
    value: "—",
    color: "from-emerald-100 to-emerald-50",
  },
];

export default async function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
        <p className="mt-2 text-base text-gray-600">
          Bienvenido al panel de administración. Usa la navegación para gestionar usuarios, wildcards, eventos, compras y sugerencias.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl bg-gradient-to-br ${stat.color} p-6 flex items-center gap-4 shadow hover:shadow-lg transition-shadow`}
          >
            <div className="flex-shrink-0 rounded-full bg-white shadow p-2">{stat.icon}</div>
            <div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</div>
              <div className="mt-1 text-3xl font-extrabold text-gray-900">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}