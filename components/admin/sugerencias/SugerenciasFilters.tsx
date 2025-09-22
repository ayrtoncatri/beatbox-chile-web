import { FunnelIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

type UserOpt = { id: string; nombres: string | null };

export default function SugerenciasFilters(props: {
  users: UserOpt[];
  defaults: { q?: string; estado?: string; userId?: string; from?: string; to?: string; pageSize: number };
  exportUrl: string;
}) {
  const { users, defaults, exportUrl } = props;

  return (
    <form className="flex flex-col md:flex-row md:items-end gap-4 bg-white p-6 rounded-2xl shadow border border-gray-200 mb-4" method="GET">
      <div className="flex-1">
        <label className="block text-xs font-semibold mb-1 text-gray-600">Búsqueda</label>
        <input name="q" defaultValue={defaults.q} className="input input-bordered w-full bg-gray-50 border-gray-200" placeholder="Contenido, usuario, email..." />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-600">Usuario</label>
        <select name="userId" defaultValue={defaults.userId || ""} className="select select-bordered w-full bg-gray-50 border-gray-200">
          <option value="">Todos</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.nombres ?? "(Sin nombre)"}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-600">Estado</label>
        <select name="estado" defaultValue={defaults.estado || ""} className="select select-bordered w-full bg-gray-50 border-gray-200">
          <option value="">Todos</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="REVISADA">Revisada</option>
          <option value="DESCARTADA">Descartada</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-600">Desde</label>
        <input type="datetime-local" name="from" defaultValue={defaults.from} className="input input-bordered w-full bg-gray-50 border-gray-200" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-600">Hasta</label>
        <input type="datetime-local" name="to" defaultValue={defaults.to} className="input input-bordered w-full bg-gray-50 border-gray-200" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-600">Por página</label>
        <select name="pageSize" defaultValue={String(defaults.pageSize)} className="select select-bordered w-full bg-gray-50 border-gray-200">
          {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="flex gap-2 mt-2 md:mt-0">
        <button
          type="submit"
          className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
        >
          <FunnelIcon className="w-5 h-5" /> Filtrar
        </button>
        <a
          className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
          href={exportUrl}
          target="_blank"
          rel="noreferrer"
        >
          <ArrowDownTrayIcon className="w-5 h-5" /> Exportar CSV
        </a>
      </div>
    </form>
  );
}