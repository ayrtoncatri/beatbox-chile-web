import { prisma } from "@/lib/prisma";
import { getPublicWildcardsForEvent } from "@/app/actions/public-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, VideoCameraIcon } from "@heroicons/react/24/solid";
import { WildcardVideoCard } from "@/components/public/WildcardVideoCard"; // Crearemos este componente

// Forzamos el re-cacheo para que la galería se actualice
export const dynamic = "force-dynamic";

type PublicWildcardsPageProps = {
  params: { id: string };
};

export default async function PublicWildcardsPage({ params }: PublicWildcardsPageProps) {
  const eventoId = params.id;

  // 1. Obtenemos los datos en paralelo
  const [evento, wildcards] = await Promise.all([
    prisma.evento.findUnique({
      where: { id: eventoId, isPublished: true }, // Solo eventos publicados
      select: { nombre: true }
    }),
    getPublicWildcardsForEvent(eventoId) // Tu nueva función de 'public-data.ts'
  ]);

  // Si el evento no existe o no está publicado, 404
  if (!evento) {
    notFound();
  }

  return (
    <main className="min-h-screen py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- Cabecera --- */}
        <div className="mb-10 text-center md:text-left">
          <Link 
            href={`/eventos/${eventoId}`} // Asumiendo que esta es la página principal del evento
            className="inline-flex items-center gap-2 text-blue-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Volver al evento
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white">
            Galería de Wildcards
          </h1>
          <p className="text-xl md:text-2xl text-blue-300/80 mt-2">
            {evento.nombre}
          </p>
        </div>

        {/* --- Galería de Videos --- */}
        {wildcards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {wildcards.map(wildcard => (
              <WildcardVideoCard key={wildcard.id} wildcard={wildcard} />
            ))}
          </div>
        ) : (
          // --- Estado Vacío ---
          <div className="text-center text-blue-300/70 p-12 border-2 border-dashed border-blue-700/30 rounded-2xl">
            <VideoCameraIcon className="w-16 h-16 mx-auto text-blue-600/50" />
            <h3 className="mt-4 text-xl font-semibold text-white">Aún no hay wildcards</h3>
            <p className="mt-2">
              Las postulaciones aprobadas por el administrador aparecerán aquí.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}