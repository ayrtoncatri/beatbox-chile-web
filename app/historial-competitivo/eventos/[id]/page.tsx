import { getEventDetails, getPublicWildcardsForEvent } from "@/app/actions/public-data";
import { notFound } from "next/navigation";
import Link from 'next/link';
// (Importamos los íconos que usaremos para las tarjetas de información)
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaGavel, 
  FaTrophy, 
  FaHandshake, 
  FaInfoCircle,
  FaVideo
} from 'react-icons/fa';

interface PageProps {
  params: { id: string };
}

// (Helper para formatear la fuente de inscripción)
function formatInscripcionSource(source: string) {
  switch (source) {
    case 'WILDCARD': return 'Clasificado por Wildcard';
    case 'LIGA_ADMIN': return 'Inscripción de Liga';
    case 'CN_HISTORICO_TOP3': return 'Clasificado: Top 3 CN Anterior';
    case 'LIGA_PRESENCIAL_TOP3': return 'Clasificado: Top 3 Liga Presencial';
    case 'LIGA_ONLINE_TOP3': return 'Clasificado: Top 3 Liga Online';
    default: return 'Inscrito';
  }
}

// Esta es una página de Servidor (Server Component)
export default async function EventoDetallePage({ params }: PageProps) {
  const [event, wildcards] = await Promise.all([
    getEventDetails(params.id),
    getPublicWildcardsForEvent(params.id) // <-- Tu nueva función
  ]);
  // highlight-end

  // (2) Si el evento no existe, mostramos un 404
  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 py-12 px-4 md:px-8 text-white">
      <div className="container mx-auto max-w-5xl">
        
        {/* --- (3) Encabezado Estilizado --- */}
        <div className="mb-10">
          <span className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
            {event.tipo?.name || 'Evento'}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-lg">
            {event.nombre}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-lg text-blue-200">
            <span className="flex items-center gap-2">
              <FaCalendarAlt /> {new Date(event.fecha).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="flex items-center gap-2">
              <FaMapMarkerAlt /> {event.local}
            </span>
          </div>
        </div>

        {/* --- (4) Grid de Contenido (Descripción, Jueces, Premios, etc.) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Columna Principal (Descripción y Participantes) --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Descripción */}
            {event.descripcion && (
              <InfoCard title="Descripción" icon={<FaInfoCircle />}>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {event.descripcion}
                </p>
              </InfoCard>
            )}

            {/* Lista de Participantes (Inscritos) */}
            <InfoCard title="Participantes" icon={<FaUsers />}>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {event.participantes.map(p => (
                  <li key={p.id}>
                    <Link 
                      href={`/historial-competitivo/competidores/${p.id}`} 
                      className="block p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/70 transition-colors"
                    >
                      <span className="font-semibold text-white">{p.nombre}</span>
                      <span className="block text-xs text-cyan-400 opacity-80">
                        {formatInscripcionSource(p.via)}
                      </span>
                    </Link>
                  </li>
                ))}
                {event.participantes.length === 0 && (
                  <p className="text-gray-400 col-span-2">Aún no hay participantes inscritos en este evento.</p>
                )}
              </ul>
            </InfoCard>
          </div>

          {/* --- Columna Lateral (Jueces, Premios, Sponsors) --- */}
          <div className="lg:col-span-1 space-y-8">
                
            {wildcards && wildcards.length > 0 && (
              <InfoCard title="Galería de Wildcards" icon={<FaVideo />}>
                <p className="text-gray-300 mb-4 text-sm">
                  Mira las postulaciones aprobadas para este evento.
                </p>
                <Link
                  // Esta es la ruta a la página que creamos en el paso anterior
                  href={`/eventos/${event.id}/wildcards`} 
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 
                            rounded-lg bg-blue-600 text-white font-semibold shadow-lg
                            hover:bg-blue-500 transition-colors"
                >
                  <FaVideo />
                  Ver {wildcards.length} {wildcards.length === 1 ? 'Video' : 'Videos'}
                </Link>
              </InfoCard>
            )}
            
            {/* Jueces */}
            <InfoCard title="Jueces" icon={<FaGavel />}>
              <ul className="space-y-2">
                {event.jueces.map(j => (
                  <li key={j.id} className="font-medium text-gray-200">{j.nombre}</li>
                ))}
                {event.jueces.length === 0 && (
                  <p className="text-gray-400">Jueces aún no anunciados.</p>
                )}
              </ul>
            </InfoCard>

            {/* Premios */}
            <InfoCard title="Premios" icon={<FaTrophy />}>
              <p className="text-gray-300 whitespace-pre-wrap">
                {event.premios || 'Información de premios no disponible.'}
              </p>
            </InfoCard>

            {/* Auspiciadores */}
            <InfoCard title="Auspiciadores" icon={<FaHandshake />}>
              <p className="text-gray-300 whitespace-pre-wrap">
                {event.auspiciadores || 'Información de auspiciadores no disponible.'}
              </p>
            </InfoCard>
          </div>
        </div>
      </div>
    </main>
  );
}

// --- (5) Componente Helper Estilizado para las Tarjetas de Información ---
function InfoCard({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="bg-gray-800/40 backdrop-blur-sm border border-blue-400/20 rounded-2xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-900/50 border-b border-blue-400/20">
        <h3 className="text-xl font-semibold text-cyan-300 flex items-center gap-3">
          {icon}
          <span>{title}</span>
        </h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}