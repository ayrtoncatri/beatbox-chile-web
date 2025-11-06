import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { UserIcon, 
  TicketIcon, 
  CalendarDaysIcon, 
  ShoppingCartIcon, 
  ChatBubbleLeftRightIcon, 
  ClipboardDocumentListIcon,
  TrophyIcon,
}
from "@heroicons/react/24/outline";
import {
  UsuariosPorEstadoChart,
  WildcardsPorEstadoChart,
  ComprasPorMesChart,
} from "@/components/admin/dashboard/DashboardCharts";

export default async function AdminDashboardPage() {
  // Estadísticas principales
  const [
    usuarios,
    usuariosActivos,
    usuariosInactivos,
    wildcards,
    wildcardsAprobados,
    wildcardsRechazados,
    wildcardsPendientes,
    eventos,
    comprasAgg,
    sugerencias,
    inscripciones,
    comprasPorMes,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.wildcard.count(),
    prisma.wildcard.count({ where: { status: "APPROVED" } }),
    prisma.wildcard.count({ where: { status: "REJECTED" } }),
    prisma.wildcard.count({ where: { status: "PENDING" } }),
    prisma.evento.count(), // Si Prisma genera Evento con mayúscula, usa prisma.Evento.count()
    prisma.compra.aggregate({ _sum: { total: true }, _count: { _all: true } }),
    prisma.sugerencia.count(),
    prisma.inscripcion.count(),
    // Compras por mes (últimos 6 meses)
    prisma.$queryRawUnsafe<{ mes: string; total: number }[]>(`
      SELECT TO_CHAR("createdAt", 'YYYY-MM') as mes, SUM(total)::int as total
      FROM "Compra"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY mes
      ORDER BY mes ASC
    `),
  ]);

  // Tarjetas resumen
  const stats = [
    {
      label: "Usuarios",
      icon: <UserIcon className="w-7 h-7 text-indigo-500" />,
      color: "from-indigo-100 to-indigo-50",
      href: "/admin/usuarios",
      value: usuarios,
      bgIcon: "bg-indigo-50",
      text: "text-indigo-700",
    },
    {
      label: "Inscripciones",
      icon: <ClipboardDocumentListIcon className="w-7 h-7 text-blue-500" />,
      color: "from-blue-100 to-blue-50",
      href: "/admin/inscripciones",
      value: inscripciones,
      bgIcon: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      label: "Clasificación CN",
      icon: <TrophyIcon className="w-7 h-7 text-red-500" />,
      color: "from-red-100 to-red-50",
      href: "/admin/clasificacion",
      value: "►", // Un ícono de "Play" o "Ejecutar"
      bgIcon: "bg-red-50",
      text: "text-red-700",
    },
    {
      label: "Wildcards",
      icon: <TicketIcon className="w-7 h-7 text-pink-500" />,
      color: "from-pink-100 to-pink-50",
      href: "/admin/wildcards",
      value: wildcards,
      bgIcon: "bg-pink-50",
      text: "text-pink-700",
    },
    {
      label: "Eventos",
      icon: <CalendarDaysIcon className="w-7 h-7 text-emerald-500" />,
      color: "from-emerald-100 to-emerald-50",
      href: "/admin/eventos",
      value: eventos,
      bgIcon: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      label: "Compras",
      icon: <ShoppingCartIcon className="w-7 h-7 text-orange-500" />,
      color: "from-orange-100 to-orange-50",
      href: "/admin/compras",
      value: comprasAgg._count._all,
      extra: comprasAgg._sum.total ? `$${comprasAgg._sum.total.toLocaleString("es-CL")}` : "$0",
      bgIcon: "bg-orange-50",
      text: "text-orange-700",
    },
    {
      label: "Sugerencias",
      icon: <ChatBubbleLeftRightIcon className="w-7 h-7 text-cyan-500" />,
      color: "from-cyan-100 to-cyan-50",
      href: "/admin/sugerencias",
      value: sugerencias,
      bgIcon: "bg-cyan-50",
      text: "text-cyan-700",
    },
  ];

  // Datos para los gráficos
  const usuariosEstadoData = { activos: usuariosActivos, inactivos: usuariosInactivos };
  const wildcardsEstadoData = {
    aprobados: wildcardsAprobados,
    rechazados: wildcardsRechazados,
    pendientes: wildcardsPendientes,
  };
  const comprasMesData = {
    labels: comprasPorMes.map((r) => r.mes),
    values: comprasPorMes.map((r) => r.total),
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
        <p className="mt-2 text-base text-gray-600">
          Bienvenido al panel de administración. Usa la navegación para gestionar usuarios, wildcards, eventos, compras y sugerencias.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`rounded-xl bg-gradient-to-br ${stat.color} p-6 flex flex-col gap-3 items-start shadow hover:shadow-lg transition-shadow group`}
          >
            <div className={`flex-shrink-0 rounded-full ${stat.bgIcon} shadow p-2`}>
              {stat.icon}
            </div>
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wide ${stat.text}`}>{stat.label}</div>
              <div className={`mt-1 font-extrabold text-gray-900 ${
                typeof stat.value === 'number' ? 'text-3xl' : 'text-2xl' // Letras más pequeñas si es texto
              }`}>
                {stat.value}
              </div>
              {stat.label === "Compras" && (
                <div className="text-xs text-gray-500 mt-1">Ingresos: <span className="font-bold">{stat.extra}</span></div>
              )}
            </div>
            <span className="mt-auto text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition">Ver detalles →</span>
          </Link>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4 text-indigo-700">Usuarios por estado</h3>
          <UsuariosPorEstadoChart data={usuariosEstadoData} />
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4 text-pink-700">Wildcards por estado</h3>
          <WildcardsPorEstadoChart data={wildcardsEstadoData} />
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4 text-orange-700">Ingresos por mes</h3>
          <ComprasPorMesChart data={comprasMesData} />
        </div>
      </div>
    </div>
  );
}