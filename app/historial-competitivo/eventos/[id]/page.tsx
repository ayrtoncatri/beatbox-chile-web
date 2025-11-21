import { getEventDetails, getPublicWildcardsForEvent } from "@/app/actions/public-data";
import { notFound } from "next/navigation";
import Link from 'next/link';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  HandThumbUpIcon, 
  TrophyIcon, 
  HeartIcon, // Usamos HeartIcon como FaHandshake
  InformationCircleIcon,
  VideoCameraIcon, // Usamos VideoCameraIcon como FaVideo
  ArrowTopRightOnSquareIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/solid';

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
    getPublicWildcardsForEvent(params.id)
  ]);

  if (!event) {
    notFound();
  }

  // --- (1) Componente Helper Estilizado (Rediseñado) ---
  function InfoCard({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
      <div className="bg-[#0b1121]/60 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:border-red-500/50">
        <div className="px-6 py-4 bg-black/50 border-b border-red-500/20">
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
            <span className="text-red-500">{icon}</span>
            <span>{title}</span>
          </h3>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    );
  }

  return (
    // CAMBIO DE FONDO: Más brillo y color rojo/fuchsia
    <main className="min-h-screen bg-gradient-to-b from-black via-red-950/20 to-fuchsia-950/20 relative overflow-hidden selection:bg-red-500/30 selection:text-white">
      
      {/* FONDO BRILLANTE (Dominante Rojo y Fuchsia) - AHORA COMO GRADIENTE BASE Y BLURS COMPLEMENTARIOS */}
      {/* Foco Principal Rojo (Opacidad ajustada para combinar con el gradiente) */}
      <div className="fixed top-[-10%] left-0 w-[800px] h-[800px] bg-red-900/50 rounded-full blur-[150px] pointer-events-none -z-10" />
      
      {/* Foco Secundario Fuchsia (Opacidad ajustada para combinar con el gradiente) */}
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-fuchsia-900/40 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      {/* Texture/Overlay - Se mantiene sutil */}
      <div className="fixed inset-0 bg-black/20 pointer-events-none z-10 opacity-30 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />


      <div className="container mx-auto max-w-6xl py-20 px-4 md:px-8 relative z-20">
        
        {/* --- Encabezado Estilizado (Aggressive) --- */}
        <div className="mb-12 border-l-4 border-red-500 pl-4">
          <span className="text-sm font-black italic text-fuchsia-400 uppercase tracking-widest">
            {event.tipo?.name || 'Evento Oficial'}
          </span>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-3 drop-shadow-xl leading-none">
            {event.nombre}
          </h1>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-lg text-white/70 font-medium pt-2">
            
            {/* Fecha */}
            <span className="flex items-center gap-2 text-sm font-mono tracking-wider">
              <CalendarIcon className="w-4 h-4 text-red-500" />
              {new Date(event.fecha).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            
            {/* Lugar */}
            <span className="flex items-center gap-2 text-sm font-mono tracking-wider">
              <MapPinIcon className="w-4 h-4 text-blue-500" />
              {event.local}
            </span>
          </div>
        </div>

        {/* --- Grid de Contenido (Expediente Digital) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Columna Principal (Descripción y Participantes) --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Descripción */}
            {event.descripcion && (
              <InfoCard title="Descripción del Evento" icon={<InformationCircleIcon className="w-6 h-6" />}>
                <p className="text-white/70 whitespace-pre-wrap leading-relaxed text-sm">
                  {event.descripcion}
                </p>
              </InfoCard>
            )}

            {/* Lista de Participantes (Inscritos) */}
            <InfoCard title={`Participantes Inscritos (${event.participantes.length})`} icon={<UsersIcon className="w-6 h-6" />}>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {event.participantes.map(p => (
                  <li key={p.id}>
                    <Link 
                      href={`/historial-competitivo/competidores/${p.id}`} 
                      className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-red-500/20 transition-colors"
                    >
                      <span className="font-bold text-white uppercase tracking-tight">{p.nombre}</span>
                      <span className="block text-[10px] text-red-400 font-mono uppercase tracking-widest mt-0.5">
                        {formatInscripcionSource(p.via)}
                      </span>
                    </Link>
                  </li>
                ))}
                {event.participantes.length === 0 && (
                  <p className="text-white/40 col-span-2 text-sm">Aún no hay participantes inscritos en este evento.</p>
                )}
              </ul>
            </InfoCard>
          </div>

          {/* --- Columna Lateral (Metadata - Jueces, Premios, Sponsors) --- */}
          <div className="lg:col-span-1 space-y-8">
              
            {wildcards && wildcards.length > 0 && (
              <InfoCard title="Galería de Wildcards" icon={<VideoCameraIcon className="w-6 h-6" />}>
                <p className="text-white/70 mb-4 text-sm">
                  Mira las postulaciones de video que definieron la lista de clasificados.
                </p>
                <Link
                  href={`/eventos/${event.id}/wildcards`} 
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 
                            rounded-lg bg-red-600 text-white font-black italic uppercase tracking-wider shadow-lg shadow-red-900/50
                            hover:bg-red-500 transition-colors"
                >
                  <VideoCameraIcon className="w-5 h-5" />
                  Ver {wildcards.length} {wildcards.length === 1 ? 'Video' : 'Videos'}
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </Link>
              </InfoCard>
            )}
            
            {/* Jueces */}
            <InfoCard title="Panel de Jueces" icon={<ShieldCheckIcon className="w-6 h-6" />}>
              <ul className="space-y-3">
                {event.jueces.map(j => (
                  <li key={j.id} className="font-bold text-white text-sm uppercase tracking-wider border-b border-white/5 pb-1">
                    {j.nombre}
                  </li>
                ))}
                {event.jueces.length === 0 && (
                  <p className="text-white/40 text-sm">Jueces aún no anunciados.</p>
                )}
              </ul>
            </InfoCard>

            {/* Premios */}
            <InfoCard title="Recompensas (Prizes)" icon={<TrophyIcon className="w-6 h-6" />}>
              <p className="text-white/70 whitespace-pre-wrap text-sm leading-relaxed">
                {event.premios || 'Información de premios no disponible.'}
              </p>
            </InfoCard>

            {/* Auspiciadores */}
            <InfoCard title="Partners Oficiales" icon={<HeartIcon className="w-6 h-6" />}>
              <p className="text-white/70 whitespace-pre-wrap text-sm leading-relaxed">
                {event.auspiciadores || 'Información de auspiciadores no disponible.'}
              </p>
            </InfoCard>
          </div>
        </div>
      </div>
    </main>
  );
}