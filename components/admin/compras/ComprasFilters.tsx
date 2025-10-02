"use client";

import { useState } from "react";
import { FunnelIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { exportComprasToCSV } from "@/app/admin/compras/actions";

type EventOpt = { id: string; nombre: string };

export default function ComprasFilters(props: {
  events: EventOpt[];
  defaults: { q?: string; eventId?: string; tipo?: string; from?: string; to?: string; pageSize: number };
  exportUrl?: string; // Mantenemos esta prop por compatibilidad, pero no la usaremos
  sort: "fecha_desc" | "fecha_asc" | "total_desc" | "total_asc";
}) {
  const { events, defaults, sort } = props;
  const [isExporting, setIsExporting] = useState(false);

  // Función para manejar la exportación con Server Actions
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Obtener los valores actuales del formulario
      const formElement = document.querySelector('form') as HTMLFormElement;
      const formData = new FormData(formElement);
      
      // Crear objeto de filtros para pasar a la Server Action
      const filters = {
        search: formData.get('q') as string || undefined,
        eventId: formData.get('eventId') as string || undefined,
        tipo: formData.get('tipo') as string || undefined,
        from: formData.get('from') as string || undefined,
        to: formData.get('to') as string || undefined,
      };
      
      // Llamar a la Server Action para generar el CSV
      const csvContent = await exportComprasToCSV(filters);
      
      // Crear un Blob con el contenido CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Crear un enlace para la descarga
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `compras-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // Simular clic para descargar
      link.click();
      
      // Limpieza
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
    <form className="flex flex-col md:flex-row md:items-end gap-4 bg-white p-6 rounded-2xl shadow border border-gray-200 mb-4">
      <div className="flex-1">
        <label className="block text-xs font-semibold mb-1 text-gray-600">Búsqueda</label>
        <input name="q" defaultValue={defaults.q} className="input input-bordered w-full bg-gray-50 border-gray-200" placeholder="Nombre, email, evento..." />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-600">Evento</label>
        <select name="eventId" defaultValue={defaults.eventId || ""} className="select select-bordered w-full bg-gray-50 border-gray-200">
          <option value="">Todos</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-600">Tipo</label>
        <select name="tipo" defaultValue={defaults.tipo || ""} className="select select-bordered w-full bg-gray-50 border-gray-200">
          <option value="">Todos</option>
          <option value="General">General</option>
          <option value="VIP">VIP</option>
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
        <label className="block text-xs font-semibold mb-1 text-gray-600">Orden</label>
        <select name="sort" defaultValue={sort} className="select select-bordered w-full bg-gray-50 border-gray-200">
          <option value="fecha_desc">Fecha desc</option>
          <option value="fecha_asc">Fecha asc</option>
          <option value="total_desc">Total desc</option>
          <option value="total_asc">Total asc</option>
        </select>
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
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition disabled:opacity-70"
        >
          <ArrowDownTrayIcon className="w-5 h-5" /> 
          {isExporting ? 'Exportando...' : 'Exportar CSV'}
        </button>
      </div>
    </form>
  );
}