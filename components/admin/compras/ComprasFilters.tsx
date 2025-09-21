type EventOpt = { id: string; nombre: string };

export default function ComprasFilters(props: {
  events: EventOpt[];
  defaults: { q?: string; eventId?: string; tipo?: string; from?: string; to?: string; pageSize: number };
  exportUrl: string;
  sort: "fecha_desc" | "fecha_asc" | "total_desc" | "total_asc";
}) {
  const { events, defaults, exportUrl, sort } = props;

  return (
    <form className="flex flex-col md:flex-row md:items-end gap-4 bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex-1">
        <label className="block text-xs font-semibold mb-1 text-gray-600">Búsqueda</label>
        <input name="q" defaultValue={defaults.q} className="input input-bordered w-full" placeholder="Nombre, email, evento..." />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-600">Evento</label>
        <select name="eventId" defaultValue={defaults.eventId || ""} className="select select-bordered w-full">
          <option value="">Todos</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-600">Tipo</label>
        <select name="tipo" defaultValue={defaults.tipo || ""} className="select select-bordered w-full">
          <option value="">Todos</option>
          <option value="General">General</option>
          <option value="VIP">VIP</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-600">Desde</label>
        <input type="datetime-local" name="from" defaultValue={defaults.from} className="input input-bordered w-full" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-600">Hasta</label>
        <input type="datetime-local" name="to" defaultValue={defaults.to} className="input input-bordered w-full" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-600">Orden</label>
        <select name="sort" defaultValue={sort} className="select select-bordered w-full">
          <option value="fecha_desc">Fecha desc</option>
          <option value="fecha_asc">Fecha asc</option>
          <option value="total_desc">Total desc</option>
          <option value="total_asc">Total asc</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-600">Por página</label>
        <select name="pageSize" defaultValue={String(defaults.pageSize)} className="select select-bordered w-full">
          {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="flex gap-2 mt-2 md:mt-0">
        <button type="submit" className="btn btn-primary">Filtrar</button>
        <a className="btn btn-outline" href={exportUrl} target="_blank" rel="noreferrer">Exportar CSV</a>
      </div>
    </form>
  );
}