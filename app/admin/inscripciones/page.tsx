import { getRegistrationFormData } from "@/app/actions/admin/inscripciones";
// (Cambié el nombre del import para ser más claro)
import { InscripcionForm } from "@/components/admin/inscripciones/InscripcionForm"; 
import { Suspense } from "react";
// (Importar un ícono para el título)
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

export const metadata = {
  title: "Inscripción a Ligas | Admin",
};

export default async function InscripcionesPage() {
  const { ligas, users } = await getRegistrationFormData();

  return (
    // (Contenedor principal)
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* --- (1) Título Estilizado (Texto Oscuro) --- */}
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600">
          <ClipboardDocumentListIcon className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Inscripción Directa a Ligas
          </h1>
          <p className="mt-1 text-base text-gray-600">
            Inscribe participantes manualmente a Ligas (fuente: LIGA_ADMIN).
          </p>
        </div>
      </div>

      {/* --- (2) Contenedor del Formulario (Fondo Blanco) --- */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <Suspense fallback={<p className="text-gray-500">Cargando formulario...</p>}>
          <InscripcionForm ligas={ligas} users={users} />
        </Suspense>
      </div>
    </div>
  );
}