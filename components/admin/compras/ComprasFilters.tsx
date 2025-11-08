"use client";

import { useState } from "react";
import { FunnelIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { exportComprasToCSV } from "@/app/admin/compras/actions";

type EventOpt = { id: string; nombre: string };

export default function ComprasFilters(props: {
  events: EventOpt[];
  defaults: { q?: string; eventId?: string; tipo?: string; from?: string; to?: string; pageSize: number };
  exportUrl?: string;
  sort: "fecha_desc" | "fecha_asc" | "total_desc" | "total_asc";
}) {
  const { events, defaults, sort } = props;
  const [isExporting, setIsExporting] = useState(false);

  // Exportación sigue igual
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const formElement = document.querySelector('form') as HTMLFormElement;
      const formData = new FormData(formElement);

      const filters = {
        search: formData.get('q') as string || undefined,
        eventId: formData.get('eventId') as string || undefined,
        tipo: formData.get('tipo') as string || undefined,
        from: formData.get('from') as string || undefined,
        to: formData.get('to') as string || undefined,
      };

      const csvContent = await exportComprasToCSV(filters);

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `compras-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar compras:', error);
      alert('Error al exportar las compras. Por favor, inténtalo de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <form
      className="flex flex-col md:flex-row md:items-end gap-4 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-6 rounded-2xl shadow-lg mb-4"
      method="GET"
    >
      <div className="flex-1">
        <label className="block text-xs font-semibold mb-1 text-blue-300">Búsqueda</label>
        <input name="q" defaultValue={defaults.q} className="input input-bordered w-full bg-blue-950/50 border-blue-700/50 text-white placeholder:text-blue-300/70" placeholder="Nombre, email, evento..." />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-blue-300">Evento</label>
        <select name="eventId" defaultValue={defaults.eventId || ""} className="select select-bordered w-full bg-blue-950/50 border-blue-700/50 text-white">
          <option value="">Todos</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-blue-300">Tipo</label>
        <select name="tipo" defaultValue={defaults.tipo || ""} className="select select-bordered w-full bg-blue-950/50 border-blue-700/50 text-white">
          <option value="">Todos</option>
          <option value="General">General</option>
          <option value="VIP">VIP</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-blue-300">Desde</label>
        <input type="datetime-local" name="from" defaultValue={defaults.from} className="input input-bordered w-full bg-blue-950/50 border-blue-700/50 text-white" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-blue-300">Hasta</label>
        <input type="datetime-local" name="to" defaultValue={defaults.to} className="input input-bordered w-full bg-blue-950/50 border-blue-700/50 text-white" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-blue-300">Orden</label>
        <select name="sort" defaultValue={sort} className="select select-bordered w-full bg-blue-950/50 border-blue-700/50 text-white">
          <option value="fecha_desc">Fecha desc</option>
          <option value="fecha_asc">Fecha asc</option>
          <option value="total_desc">Total desc</option>
          <option value="total_asc">Total asc</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-blue-300">Por página</label>
        <select name="pageSize" defaultValue={String(defaults.pageSize)} className="select select-bordered w-full bg-blue-950/50 border-blue-700/50 text-white">
          {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="flex gap-2 mt-2 md:mt-0">
        <button
          type="submit"
          className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-blue-600 transition"
        >
          <FunnelIcon className="w-5 h-5" /> Filtrar
        </button>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold shadow-lg hover:from-green-700 hover:to-green-600 transition disabled:opacity-70"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          {isExporting ? 'Exportando...' : 'Exportar CSV'}
        </button>
      </div>
    </form>
  );
}