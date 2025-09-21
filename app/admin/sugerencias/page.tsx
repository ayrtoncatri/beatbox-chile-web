import { prisma } from "@/lib/prisma";
import SugerenciasFilters from "@/components/admin/sugerencias/SugerenciasFilters";
import SugerenciasTable from "@/components/admin/sugerencias/SugerenciasTable";
import SugerenciaDetailDrawer from "@/components/admin/sugerencias/SugerenciaDetailDrawer";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function parseNumber(v: string | undefined, def: number) {
  const n = Number(v);
  return isNaN(n) ? def : n;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const q = (sp.q as string) || undefined;
  const estado = (sp.estado as string) || undefined;
  const userId = (sp.userId as string) || undefined;
  const from = sp.from ? new Date(sp.from as string) : undefined;
  const to = sp.to ? new Date(sp.to as string) : undefined;
  const page = Math.max(1, parseNumber(sp.page as string, 1));
  const pageSize = Math.min(100, Math.max(1, parseNumber(sp.pageSize as string, 20)));

  const where: any = {
    AND: [
      q
        ? {
            OR: [
              { mensaje: { contains: q, mode: "insensitive" } },
              { user: { nombres: { contains: q, mode: "insensitive" } } },
              { user: { email: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {},
      estado ? { estado } : {},
      userId ? { userId } : {},
      from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {},
    ],
  };

  const [users, total, rows, agg] = await Promise.all([
    prisma.user.findMany({ select: { id: true, nombres: true }, orderBy: { nombres: "asc" } }),
    prisma.sugerencia.count({ where }),
    prisma.sugerencia.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        mensaje: true,
        estado: true,
        createdAt: true,
        user: { select: { id: true, nombres: true, email: true } },
      },
    }),
    prisma.sugerencia.groupBy({
      by: ["estado"],
      _count: { _all: true },
      where,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const resumenPorEstado = agg.reduce((acc, curr) => {
    acc[curr.estado] = curr._count._all;
    return acc;
  }, {} as Record<string, number>);

  const exportUrl = `/api/admin/sugerencias/export?${new URLSearchParams(
    Object.fromEntries(
      Object.entries({
        q,
        estado,
        userId,
        from: from?.toISOString(),
        to: to?.toISOString(),
      }).filter(([, v]) => v)
    ) as any
  ).toString()}`;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Sugerencias</h1>

      <SugerenciasFilters
        users={users}
        defaults={{ q, estado, userId, from: (sp.from as string) || "", to: (sp.to as string) || "", pageSize }}
        exportUrl={exportUrl}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded border bg-white">
          <div className="text-sm text-gray-500">Total sugerencias</div>
          <div className="text-xl font-bold">{total}</div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="text-sm text-gray-500">Por estado</div>
          <div className="text-sm">
            {Object.entries(resumenPorEstado).map(([estado, cant]) => (
              <div key={estado}>{estado}: {cant}</div>
            ))}
          </div>
        </div>
      </div>

      <SugerenciasTable
        rows={rows}
        pagination={{ page, pageSize, total, totalPages }}
      />

      <div className="flex items-center justify-between pt-4">
        <a
          className={`btn btn-secondary ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
          href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, String(v)])), page: String(page - 1) })}`}
        >
          Anterior
        </a>
        <div>Página {page} de {totalPages}</div>
        <a
          className={`btn btn-secondary ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
          href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, String(v)])), page: String(page + 1) })}`}
        >
          Siguiente
        </a>
      </div>

      <SugerenciaDetailDrawer />
    </div>
  );
}