import { prisma } from "@/lib/prisma";
import { ClassificationForm } from "@/components/admin/clasificacion/ClassificationForm";
import { Suspense } from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

export const metadata = {
  title: "Clasificación CN | Admin",
};

/**
 * Carga los eventos de tipo "Campeonato Nacional" para el dropdown
 */
async function loadCNEvents() {
  return prisma.evento.findMany({
    where: {
      tipo: {
        name: CN_EVENT_TYPE // (Deberíamos importar esto, pero lo hardcodeamos)
      }
    },
    select: {
      id: true,
      nombre: true,
      fecha: true,
    },
    orderBy: {
      fecha: 'desc'
    }
  });
}

const CN_EVENT_TYPE = "Campeonato Nacional"; // Temporal

export default async function ClasificacionPage() {
  
  const cnEventos = await loadCNEvents();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* --- Cabecera Estilizada --- */}
      <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 rounded-2xl shadow-lg">
        <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-red-600/30 text-red-300 border border-red-500/30">
          <ShieldCheckIcon className="h-9 w-9" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">
            Clasificación al Campeonato Nacional
          </h1>
          <p className="mt-1 text-base text-blue-100">
            Ejecuta el proceso para buscar a los 16 clasificados del ciclo y crear sus inscripciones para el CN.
          </p>
        </div>
      </div>

      {/* --- Contenedor del Formulario --- */}
      <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-8 rounded-2xl shadow-lg">
        <Suspense fallback={<p className="text-blue-300/70">Cargando formulario...</p>}>
          <ClassificationForm cnEventos={cnEventos} />
        </Suspense>
      </div>

    </div>
  );
}