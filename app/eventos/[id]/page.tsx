import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FormularioWildcard from '@/components/wildcards/FormularioWildcard'; 
import CompraTicketsForm from '@/components/compra-entradas/CompraTicketsForm';
import { checkEventHasBattles } from '@/app/actions/public-data';
import { 
    MapPinIcon, 
    CalendarDaysIcon, 
    TicketIcon, 
    MicrophoneIcon,
    ClockIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/solid';

async function getEvento(id: string) {
  const evento = await prisma.evento.findUnique({
    where: { id },
    include: {
      tipo: true,
      venue: {
        include: {
          address: {
            include: {
              comuna: true,
            },
          },
        },
      },
      ticketTypes: {
        where: { isActive: true },
        orderBy: { price: 'asc' },
      },
    },
  });

  if (!evento) notFound();
  return evento;
}

// --- Componentes Auxiliares Rediseñados (CON TODOS LOS ESTADOS) ---

function WildcardInscripcion({ evento }: { evento: any }) {
  const ahora = new Date();
  const deadline = evento.wildcardDeadline ? new Date(evento.wildcardDeadline) : null;
  let wildcardStatus: 'abierto' | 'cerrado' | 'no_disponible' = 'no_disponible';

  if (deadline) {
    wildcardStatus = deadline > ahora ? 'abierto' : 'cerrado';
  }

  // Estilo base para todas las cajas de esta sección
  const boxClass = "relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c12]/80 backdrop-blur-xl p-8 shadow-2xl transition-all hover:border-white/20";

  // CASO 1: ABIERTO (Formulario)
  if (wildcardStatus === 'abierto' && deadline) {
    return (
      <div className={boxClass}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
        <div className="text-center mb-8">
            <span className="inline-block px-4 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest border border-red-500/20 mb-4 animate-pulse">
                Tiempo Limitado
            </span>
            <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
                Inscripción Wildcard
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 mt-2 text-gray-400">
                <span>Cierre de inscripciones:</span>
                <div className="flex items-center gap-1 text-white font-mono bg-white/5 px-3 py-1 rounded-lg">
                    <ClockIcon className="w-4 h-4 text-red-400" />
                    {deadline.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} • {deadline.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
        <Suspense fallback={<p className="text-center text-gray-500">Cargando formulario...</p>}>
            <FormularioWildcard eventoId={evento.id} />
        </Suspense>
      </div>
    );
  }

  // CASO 2: CERRADO
  if (wildcardStatus === 'cerrado') {
      return (
        <div className={`${boxClass} flex flex-col items-center text-center opacity-80`}>
             <div className="p-4 bg-yellow-500/10 rounded-full mb-4">
                 <ExclamationCircleIcon className="w-8 h-8 text-yellow-500" />
             </div>
             <h3 className="text-2xl font-black text-yellow-500 uppercase tracking-tight">Inscripciones Cerradas</h3>
             <p className="text-gray-400 mt-2">El plazo para enviar wildcards ha finalizado.</p>
        </div>
      )
  }

  // CASO 3: NO DISPONIBLE
  return (
    <div className={`${boxClass} flex flex-col items-center text-center opacity-60`}>
         <h3 className="text-xl font-bold text-gray-500 uppercase tracking-tight">Wildcard No Disponible</h3>
         <p className="text-gray-500 text-sm mt-1">Este evento no tiene clasificación online habilitada.</p>
    </div>
  );
}

function CompraEntradasSeccion({ evento }: { evento: any }) {
  const isTicketed = evento.isTicketed && evento.ticketTypes.length > 0;
  const esEventoPasado = new Date(evento.fecha) < new Date();

  const boxClass = "relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c12]/80 backdrop-blur-xl p-8 shadow-2xl transition-all hover:border-white/20";

  // CASO 1: EVENTO FINALIZADO
  if (esEventoPasado) {
      return (
        <div className={`${boxClass} opacity-70 grayscale`}>
             <div className="text-center">
                <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tight mb-2">Evento Finalizado</h3>
                <p className="text-gray-500">La venta de entradas ha concluido.</p>
             </div>
        </div>
      )
  }

  // CASO 2: VENTA ACTIVA (Formulario)
  if (isTicketed) {
    return (
      <div className={boxClass}>
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-400 to-emerald-500" />
         <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-lime-400/10 rounded-xl">
                <TicketIcon className="w-8 h-8 text-lime-400" />
            </div>
            <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Entradas</h3>
                <p className="text-sm text-gray-400">Asegura tu lugar en el evento</p>
            </div>
         </div>
         <CompraTicketsForm eventoId={evento.id} ticketTypes={evento.ticketTypes} />
      </div>
    );
  }

  // CASO 3: VENTA NO DISPONIBLE / PRÓXIMAMENTE
  return (
    <div className={`${boxClass} flex flex-col items-center text-center`}>
         <div className="p-4 bg-white/5 rounded-full mb-4">
             <TicketIcon className="w-8 h-8 text-gray-500" />
         </div>
         <h3 className="text-xl font-bold text-gray-300 uppercase tracking-tight">Venta No Disponible</h3>
         <p className="text-gray-500 text-sm mt-2">Las entradas aún no están a la venta online.</p>
    </div>
  );
}

async function BracketLink({ eventoId }: { eventoId: string }) {
  const hasBattles = await checkEventHasBattles(eventoId);
  if (!hasBattles) return null;

  return (
    <Link href={`/eventos/${eventoId}/bracket`} className="group relative block w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
        <div className="relative flex items-center justify-between bg-[#1a1a20] border border-white/10 p-6 rounded-2xl hover:border-white/30 transition-all">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                    <span className="text-2xl">👑</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Ver Brackets del Torneo</h3>
                    <p className="text-sm text-blue-200/60">Revisa los cruces y resultados en vivo</p>
                </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-all">
                <span className="text-xl">→</span>
            </div>
        </div>
    </Link>
  );
}

// --- PÁGINA PRINCIPAL ---

export default async function EventoPage({ params: { id } }: { params: { id: string } }) {
  const evento = await getEvento(id);
  const fecha = new Date(evento.fecha);
  
  // Formateo de fecha elegante
  const dia = fecha.getDate();
  const mes = fecha.toLocaleDateString('es-CL', { month: 'short' }).toUpperCase();
  const hora = fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 pb-24">
      
      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-[85vh] min-h-[600px]">
        {/* Imagen de Fondo con Overlay */}
        <div className="absolute inset-0">
            <Image
                src={evento.image || '/beatbox-chile-campeonato.webp'}
                alt={evento.nombre}
                fill
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-[#050505]" />
            <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Contenido Hero */}
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-24 md:pb-32">
            
            {/* Badge de Tipo */}
            <div className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest">
                    <MicrophoneIcon className="w-3 h-3 text-fuchsia-400" />
                    {evento.tipo?.name || 'Evento'}
                </span>
            </div>

            {/* Título Gigante */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6 drop-shadow-2xl max-w-4xl">
                {evento.nombre}
            </h1>

            {/* Info Cards Flotantes (Fecha y Lugar) */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-4">
                
                {/* Card Fecha */}
                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-4 pr-8 rounded-2xl hover:bg-white/10 transition-colors">
                    <div className="flex flex-col items-center justify-center bg-white/10 w-14 h-14 rounded-xl border border-white/5">
                        <span className="text-xs font-bold text-white/60 uppercase">{mes}</span>
                        <span className="text-2xl font-black text-white leading-none">{dia}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-lg">{hora} hrs</span>
                        <span className="text-sm text-gray-400">Fecha y Hora</span>
                    </div>
                </div>

                {/* Card Ubicación (Con Dirección) */}
                {evento.venue && (
                    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-4 pr-8 rounded-2xl hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-center bg-blue-500/20 w-14 h-14 rounded-xl border border-blue-500/30">
                            <MapPinIcon className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-lg">{evento.venue.name}</span>
                            <span className="text-sm text-gray-400">
                                {evento.venue.address?.street 
                                    ? `${evento.venue.address.street}, ${evento.venue.address.comuna?.name}`
                                    : evento.venue.address?.comuna?.name}
                            </span>
                            {evento.venue.address?.reference && (
                                <span className="text-xs text-gray-500 mt-0.5 italic">
                                    Ref: {evento.venue.address.reference}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL (GRID) --- */}
      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Columna Izquierda (Info Principal) */}
            <div className="lg:col-span-8 space-y-12">
                
                {/* Descripción */}
                {evento.descripcion && (
                    <section>
                        <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-2">
                            <span className="w-1 h-8 bg-fuchsia-500 rounded-full" />
                            Sobre el evento
                        </h2>
                        <div className="prose prose-invert prose-lg text-gray-300/90 leading-relaxed">
                            <p className="whitespace-pre-wrap">{evento.descripcion}</p>
                        </div>
                    </section>
                )}

                {/* Reglas */}
                {evento.reglas && (
                    <section className="bg-[#0c0c12] border border-white/5 p-8 rounded-3xl">
                         <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-2">
                            <span className="w-1 h-8 bg-blue-500 rounded-full" />
                            Reglas Oficiales
                        </h2>
                        <div className="prose prose-invert text-gray-400 text-sm leading-relaxed">
                            <p className="whitespace-pre-wrap">{evento.reglas}</p>
                        </div>
                    </section>
                )}

                {/* Link a Brackets */}
                <Suspense fallback={null}>
                    <BracketLink eventoId={evento.id} />
                </Suspense>

            </div>

            {/* Columna Derecha (Acciones: Tickets & Wildcards) */}
            <div className="lg:col-span-4 space-y-6">
                <div className="sticky top-24 space-y-6">
                    
                    {/* Tickets */}
                    <Suspense fallback={<div className="h-40 bg-white/5 rounded-3xl animate-pulse" />}>
                        <CompraEntradasSeccion evento={evento} />
                    </Suspense>

                    {/* Wildcards */}
                    <WildcardInscripcion evento={evento} />

                </div>
            </div>

        </div>
      </div>

    </div>
  );
}