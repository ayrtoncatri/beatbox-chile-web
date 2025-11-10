import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FormularioWildcard from '@/components/wildcards/FormularioWildcard'; 
import CompraTicketsForm from '@/components/compra-entradas/CompraTicketsForm';
import { checkEventHasBattles } from '@/app/actions/public-data';
import { SwatchIcon } from '@heroicons/react/24/outline';

// (Función getEvento - Sin cambios)
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

  if (!evento) {
    notFound();
  }
  return evento;
}

// --- Componente "WildcardInscripcion" (Textos Rediseñados) ---
function WildcardInscripcion({ evento }: { evento: any }) {
  const ahora = new Date();
  const deadline = evento.wildcardDeadline
    ? new Date(evento.wildcardDeadline)
    : null;

  let wildcardStatus: 'abierto' | 'cerrado' | 'no_disponible' =
    'no_disponible';

  if (deadline) {
    wildcardStatus = deadline > ahora ? 'abierto' : 'cerrado';
  }

  const boxStyle =
    'max-w-3xl mx-auto bg-gray-900/70 backdrop-blur-md p-6 lg:p-8 rounded-2xl border border-lime-400/20';

  if (wildcardStatus === 'abierto') {
    if (!deadline) {
      return (
        <p className="text-center text-red-400">Error al cargar la fecha.</p>
      );
    }

    return (
      <Suspense fallback={<p>Cargando formulario...</p>}>
        <div className="mb-6 text-center max-w-2xl mx-auto">
          {/* Acento CHILENO (ROJO) con Glow */}
          <p className="text-4xl text-red-400 text-shadow-red"> {/* <-- (MODIFICADO) Más grande y con glow */ }
            ¡Inscripciones abiertas!
          </p>
          <p className="text-gray-300 text-lg mt-2">Tienes hasta el:</p> {/* <-- (MODIFICADO) Más grande */ }
          <p className="font-heading text-3xl text-white tracking-wide"> {/* <-- (MODIFICADO) Fuente Teko, más grande */ }
            {deadline.toLocaleDateString('es-CL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            hrs.
          </p>
        </div>
        <FormularioWildcard eventoId={evento.id} />
      </Suspense>
    );
  }

  if (wildcardStatus === 'cerrado') {
    return (
      <div className={boxStyle}>
        <h3 className="text-4xl text-yellow-300 text-center"> {/* <-- (MODIFICADO) Más grande */ }
          Inscripciones Cerradas
        </h3>
        <p className="text-yellow-200 mt-2 text-center text-lg"> {/* <-- (MODIFICADO) Más grande */ }
          El plazo para enviar wildcards para este evento ha finalizado.
        </p>
      </div>
    );
  }

  return (
    <div className={boxStyle}>
      <h3 className="text-4xl text-gray-300 text-center"> {/* <-- (MODIFICADO) Más grande */ }
        Inscripción Wildcard
      </h3>
      <p className="text-gray-400 mt-2 text-center text-lg"> {/* <-- (MODIFICADO) Más grande */ }
        Este evento no tiene un proceso de clasificación por wildcard.
      </p>
    </div>
  );
}

// --- Componente "CompraEntradasSeccion" (Textos Rediseñados) ---
function CompraEntradasSeccion({ evento }: { evento: any }) {
  const isTicketed = evento.isTicketed && evento.ticketTypes.length > 0;
  const esEventoPasado = new Date(evento.fecha) < new Date();

  const boxStyle =
    'max-w-3xl mx-auto bg-gray-900/70 backdrop-blur-md p-6 lg:p-8 rounded-2xl border border-lime-400/20';

  if (esEventoPasado) {
    return (
      <div className={boxStyle}>
        <h3 className="text-4xl text-gray-300 text-center"> {/* <-- (MODIFICADO) Más grande */ }
          Venta de Entradas
        </h3>
        <p className="text-gray-400 mt-2 text-center text-lg"> {/* <-- (MODIFICADO) Más grande */ }
          Este evento ya ha finalizado.
        </p>
      </div>
    );
  }

  if (isTicketed) {
    return (
      <CompraTicketsForm
        eventoId={evento.id}
        ticketTypes={evento.ticketTypes}
      />
    );
  }

  return (
    <div className={boxStyle}>
      <h3 className="text-4xl text-gray-300 text-center"> {/* <-- (MODIFICADO) Más grande */ }
        Venta de Entradas
      </h3>
      <p className="text-gray-400 mt-2 text-center text-lg"> {/* <-- (MODIFICADO) Más grande */ }
        Las entradas para este evento no están disponibles para la venta online
        o aún no han sido publicadas.
      </p>
    </div>
  );
}

async function BracketLink({ eventoId }: { eventoId: string }) {
  
  // 1. Llamamos al verificador que creamos
  const hasBattles = await checkEventHasBattles(eventoId);

  // 2. Si no hay batallas, no renderizamos NADA
  if (!hasBattles) {
    return null; 
  }

  // 3. Si HAY batallas, renderizamos el enlace
  return (
    <div className="text-center"> {/* Contenedor para centrar el botón */}
      <Link
        href={`/eventos/${eventoId}/bracket`}
        className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 
                   text-sm font-semibold text-white shadow-sm transition-all 
                   hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 
                   focus-visible:outline-offset-2 focus-visible:outline-purple-600"
      >
        <SwatchIcon className="h-5 w-5" />
        Ver Llaves (Bracket)
      </Link>
    </div>
  );
}

// --- Página de detalle del evento principal (Textos Rediseñados) ---
export default async function EventoPage({
 params: { id },
}: {
  params: { id: string };
}) {
  const evento = await getEvento(id);

  const boxStyle =
    'max-w-3xl mx-auto bg-gray-900/70 backdrop-blur-md p-6 lg:p-8 rounded-2xl border border-lime-400/20';

  return (
    <>
      {/* ======================= */}
      {/* Sección 1: HERO BANNER (Textos Rediseñados) */}
      {/* ======================= */}
      <div className="relative h-[60vh] min-h-[400px] w-full">
        <Image
          src={evento.image || '/beatbox-chile-campeonato.png'}
          alt={evento.nombre}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent" />

        <div className="container mx-auto px-4 h-full">
          <div className="absolute bottom-12 flex flex-col items-start text-left">
            {/* (Tag de Tipo - sin cambios) */}
            <span
              className="px-3 py-1 text-sm font-semibold rounded-full
                         bg-lime-400/20 text-lime-300 border border-lime-400/30"
            >
              {evento.tipo?.name || 'Evento'}
            </span>
            
            {/* Título (Neón) (Más grande y con Glow) */}
            <h1 className="
              text-6xl md:text-8xl text-white mt-3 
              text-shadow-lime /* <-- (NUEVO) Glow Neón */
            ">
              {evento.nombre}
            </h1>
            
            {/* Fecha (Con fuente Teko) */}
            <p className="font-heading text-3xl text-white mt-2 tracking-wide"> {/* <-- (MODIFICADO) Fuente Teko */ }
              {new Date(evento.fecha).toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            
            {/* Ubicación (Acento CHILENO - AZUL) */}
            {evento.venue && (
              <p className="flex items-center gap-2 text-2xl text-blue-300 mt-2"> {/* <-- (MODIFICADO) Más grande y azul */ }
                <svg
                  className="w-5 h-5 text-blue-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                {evento.venue.name} - {evento.venue.address?.comuna?.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ================================ */}
      {/* Sección 2: Contenido (Textos Rediseñados) */}
      {/* ================================ */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        
        {/* Sección Reglas */}
        <div className={`${boxStyle} mb-12`}>
          <h2 className="text-5xl text-lime-300 mb-4 text-shadow-lime"> {/* <-- (MODIFICADO) Más grande y con glow */ }
            Reglas del Evento
          </h2>
          <div className="prose prose-invert text-gray-200 max-w-none">
            {/* (Párrafos usan 'Manrope' por defecto) */}
            <p className="whitespace-pre-wrap text-lg leading-relaxed"> {/* <-- (MODIFICADO) Texto de párrafo más grande */ }
              {evento.reglas}
            </p>
          </div>
        </div>

        <Suspense fallback={
          <div className="text-center">
            <p className="text-purple-400">Cargando llaves...</p>
          </div>
        }>
          <BracketLink eventoId={evento.id} />
        </Suspense>
        
        <hr className="max-w-3xl mx-auto border-t-2 border-lime-400/20 my-12 md:my-16" />

        {/* Sección Wildcard */}
        <WildcardInscripcion evento={evento} />
        
        <hr className="max-w-3xl mx-auto border-t-2 border-lime-400/20 my-12 md:my-16" />

        {/* Sección Compras */}
        <Suspense fallback={<p>Cargando sección de entradas...</p>}>
          <CompraEntradasSeccion evento={evento} />
        </Suspense>
      </div>
    </>
  );
}