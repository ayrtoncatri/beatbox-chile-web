import { getRegistrationFormData } from "@/app/actions/admin/inscripciones";
import { RegistrationForm } from "@/components/admin/inscripciones/RegistrationForm";
import { Suspense } from "react";

// (Asumimos que tienes un layout de admin en app/admin/layout.tsx
// que protege esta ruta y aplica el estilo de administrador)

export const metadata = {
  title: "Inscribir Participante | Admin",
};

// Esta es una página de servidor (Server Component)
export default async function InscripcionesPage() {
  
  // 1. Llamamos a la Server Action para obtener los datos en el servidor.
  // Esto sucede *antes* de que la página se envíe al cliente.
  const { ligas, users } = await getRegistrationFormData();

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-6">
        Inscripción Directa a Ligas
      </h1>
      <p className="text-gray-300 mb-8 max-w-2xl">
        Este módulo inscribe a un participante directamente en una Liga Presencial u Online.
        Se creará un registro de <strong>Inscripción</strong> con la fuente "LIGA_ADMIN", 
        permitiendo que el Módulo de Jurado genere planillas para el showcase (PRELIMINAR).
      </p>

      {/* Usamos un contenedor con el estilo del admin */}
      <div className="max-w-xl bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <Suspense fallback={<LoadingState />}>
          {/* 2. Pasamos los datos (ligas, users) como props al 
               componente cliente (RegistrationForm).
               Crearemos este componente en el próximo paso (Fase 2.3).
          */}
          <RegistrationForm ligas={ligas} users={users} />
        </Suspense>
      </div>
    </div>
  );
}

// Un componente simple de carga para el Suspense
function LoadingState() {
  return (
    <div className="text-center text-gray-400">
      <p>Cargando datos del formulario...</p>
    </div>
  );
}