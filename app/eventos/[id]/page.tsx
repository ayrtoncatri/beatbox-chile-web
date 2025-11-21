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

// --- COMPONENTES UI REDISEÑADOS ---

function WildcardInscripcion({ evento }: { evento: any }) {
  const ahora = new Date();
  const deadline = evento.wildcardDeadline ? new Date(evento.wildcardDeadline) : null;
  let wildcardStatus: 'abierto' | 'cerrado' | 'no_disponible' = 'no_disponible';

  if (deadline) {
    wildcardStatus = deadline > ahora ? 'abierto' : 'cerrado';
  }

  const containerClass = "relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c12]/80 backdrop-blur-xl p-6 shadow-2xl transition-all hover:border-white/20 group";

  // 1. ABIERTO
  if (wildcardStatus === 'abierto' && deadline) {
    return (
      <div className={containerClass}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-600" />
        <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest mb-3 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Inscripciones Abiertas
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                Sube tu Wildcard
            </h3>
            <div className="mt-3 flex justify-center">
                <div className="flex items-center gap-2 text-gray-300 text-xs font-mono bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                    <ClockIcon className="w-3 h-3 text-red-400" />
                    <span>Cierra: {deadline.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} • {deadline.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        </div>
        <Suspense fallback={<p className="text-center text-gray-500 text-xs">Cargando...</p>}>
            <FormularioWildcard eventoId={evento.id} />
        </Suspense>
      </div>
    );
  }

  // 2. CERRADO
  if (wildcardStatus === 'cerrado') {
      return (
        <div className={`${containerClass} opacity-70 flex flex-col items-center text-center py-8`}>
             <ExclamationCircleIcon className="w-8 h-8 text-yellow-500 mb-3 opacity-80" />
             <h3 className="text-lg font-black text-yellow-500 uppercase tracking-tight">Inscripciones Cerradas</h3>
             <p className="text-xs text-gray-400 mt-1 max-w-[200px]">El plazo para enviar videos ha finalizado.</p>
        </div>
      )
  }

  // 3. NO DISPONIBLE
  return (
    <div className={`${containerClass} opacity-50 flex flex-col items-center text-center py-6`}>
         <h3 className="text-sm font-bold text-gray-500 uppercase tracking-tight">Wildcard No Disponible</h3>
         <p className="text-[10px] text-gray-600 mt-1">Clasificación online deshabilitada.</p>
    </div>
  );
}

function CompraEntradasSeccion({ evento }: { evento: any }) {
  const isTicketed = evento.isTicketed && evento.ticketTypes.length > 0;
  const esEventoPasado = new Date(evento.fecha) < new Date();

  const containerClass = "relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c12]/80 backdrop-blur-xl p-6 shadow-2xl transition-all hover:border-white/20";

  // CASO 1: FINALIZADO
  if (esEventoPasado) {
      return (
        <div className={`${containerClass} opacity-50 grayscale flex flex-col items-center text-center py-8`}>
             <h3 className="text-xl font-black text-gray-400 uppercase tracking-tight">Evento Finalizado</h3>
             <p className="text-xs text-gray-500 mt-1">Venta cerrada.</p>
        </div>
      )
  }

  // CASO 2: ACTIVO
  if (isTicketed) {
    return (
      <div className={containerClass}>
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600" />
         <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <TicketIcon className="w-6 h-6 text-green-400" />
            </div>
            <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">Entradas</h3>
                <p className="text-xs text-gray-400 mt-1">Asegura tu lugar</p>
            </div>
         </div>
         <CompraTicketsForm eventoId={evento.id} ticketTypes={evento.ticketTypes} />
      </div>
    );
  }

  // CASO 3: NO DISPONIBLE
  return (
    <div className={`${containerClass} flex flex-col items-center text-center py-8 opacity-70`}>
         <div className="p-3 bg-white/5 rounded-full mb-3">
             <TicketIcon className="w-6 h-6 text-gray-500" />
         </div>
         <h3 className="text-lg font-bold text-gray-400 uppercase tracking-tight">Venta No Disponible</h3>
         <p className="text-xs text-gray-600 mt-1 px-4">Próximamente más información sobre entradas.</p>
    </div>
  );
}

async function BracketLink({ eventoId }: { eventoId: string }) {
  const hasBattles = await checkEventHasBattles(eventoId);
  if (!hasBattles) return null;

  return (
    <Link href={`/eventos/${eventoId}/bracket`} className="group relative block w-full mt-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
        
        <div className="relative flex items-center justify-between bg-[#13131a] border border-white/10 p-5 rounded-2xl hover:border-blue-500/50 transition-all group-hover:translate-x-1">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <span className="text-xl">🏆</span>
                </div>
                <div>
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Ver Brackets</h3>
                    <p className="text-xs text-blue-200/60 font-medium mt-0.5">Seguimiento en vivo</p>
                </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                <span className="text-lg text-gray-400 group-hover:text-white">→</span>
            </div>
        </div>
    </Link>
  );
}

// --- PÁGINA PRINCIPAL ---

export default async function EventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evento = await getEvento(id);
  const fecha = new Date(evento.fecha);
  
  const dia = fecha.getDate();
  const mes = fecha.toLocaleDateString('es-CL', { month: 'short' }).toUpperCase();
  const hora = fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-[#050508] text-gray-200 pb-24 selection:bg-fuchsia-500/30 relative overflow-hidden">
      
      {/* --- 1. FONDO AMBIENTAL (EL TOQUE WOW) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Spotlight Púrpura (Arriba Izquierda) */}
          <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-fuchsia-900/20 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse-slow" />
          
          {/* Spotlight Azul (Abajo Derecha) */}
          <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-blue-900/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
          
          {/* Ruido sutil (opcional, da textura urbana) */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("/noise.png")' }}></div>
      </div>

      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-[80vh] min-h-[600px] z-10">
        <div className="absolute inset-0">
            <Image
                src={evento.image || 'https://res.cloudinary.com/dfd1byvwn/image/upload/v1763746159/beatbox-chile-campeonato_xr2nsd.webp'}
                alt={evento.nombre}
                fill
                className="object-cover"
                priority
            />
            {/* Degradado agresivo para fusionar con el fondo */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#050508]/60 to-[#050508]" />
        </div>

        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-20">
            
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <MicrophoneIcon className="w-3 h-3 text-fuchsia-500" />
                    {evento.tipo?.name || 'Evento'}
                </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-8 drop-shadow-2xl max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {evento.nombre}
            </h1>

            {/* Info Flotante */}
            <div className="flex flex-col md:flex-row gap-4 mt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                {/* Fecha */}
                <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 p-3 pr-6 rounded-2xl hover:bg-white/5 transition-colors w-fit shadow-lg">
                    <div className="flex flex-col items-center justify-center bg-white/5 w-14 h-14 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{mes}</span>
                        <span className="text-2xl font-black text-white leading-none">{dia}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-lg tracking-tight">{hora} hrs</span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Inicio</span>
                    </div>
                </div>

                {/* Ubicación */}
                {evento.venue && (
                    <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 p-3 pr-8 rounded-2xl hover:bg-white/5 transition-colors w-fit max-w-full shadow-lg">
                        <div className="flex items-center justify-center bg-blue-600/20 w-14 h-14 rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)] flex-shrink-0">
                            <MapPinIcon className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-white font-bold text-lg truncate">{evento.venue.name}</span>
                            <div className="text-xs text-gray-300 flex flex-col sm:flex-row sm:gap-1">
                                <span className="truncate opacity-80">
                                    {evento.venue.address?.street ? evento.venue.address.street : ''}
                                </span>
                                {evento.venue.address?.comuna?.name && (
                                    <span className="text-blue-400 font-semibold uppercase">{evento.venue.address.comuna.name}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* --- 2. CONTENIDO PRINCIPAL --- */}
      <div className="container mx-auto px-4 -mt-4 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* COLUMNA IZQUIERDA */}
            <div className="lg:col-span-8 space-y-16 pt-8">
                
                {/* Descripción */}
                {evento.descripcion && (
                    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <h2 className="text-3xl font-black text-white uppercase mb-6 flex items-center gap-3 tracking-tight">
                            <span className="w-1.5 h-8 bg-fuchsia-600 rounded-full shadow-[0_0_15px_#d946ef]" />
                            Información
                        </h2>
                        <div className="prose prose-invert prose-lg max-w-none text-gray-300/90 leading-relaxed font-light">
                            <p className="whitespace-pre-wrap">{evento.descripcion}</p>
                        </div>
                    </section>
                )}

                {/* Reglas (Card Especial) */}
                {evento.reglas && (
                    <section className="bg-gradient-to-br from-[#0f0f13] to-[#0a0a0c] border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
                         <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-colors duration-500" />
                         
                         <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-3 relative z-10">
                            <span className="w-1.5 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_#2563eb]" />
                            Reglas Oficiales
                        </h2>
                        <div className="prose prose-invert prose-sm text-gray-400 leading-relaxed relative z-10">
                            <p className="whitespace-pre-wrap">{evento.reglas}</p>
                        </div>
                    </section>
                )}

                <Suspense fallback={null}>
                    <BracketLink eventoId={evento.id} />
                </Suspense>

            </div>

            {/* COLUMNA DERECHA (Acciones) */}
            <div className="lg:col-span-4 relative">
                <div className="sticky top-24 space-y-6">
                    
                    <Suspense fallback={<div className="h-40 bg-white/5 rounded-3xl animate-pulse" />}>
                        <CompraEntradasSeccion evento={evento} />
                    </Suspense>

                    <WildcardInscripcion evento={evento} />

                </div>
            </div>

        </div>
      </div>

    </div>
  );
}