import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Suspense } from 'react';
import Image from 'next/image';

export const revalidate = 60;

// Esta función se ejecuta en el servidor para obtener todos los eventos
async function getEventosPublicados() {
  const eventos = await prisma.evento.findMany({
    where: {
      isPublished: true, // Solo mostramos eventos publicados
    },
    include: {
      tipo: true, // Para mostrar "Batalla", "Online", etc.
      venue: {
        // Para mostrar el lugar
        include: {
          address: {
            include: {
              comuna: true, // Para mostrar la comuna
            },
          },
        },
      },
    },
    orderBy: {
      fecha: 'desc', // Los eventos más nuevos primero
    },
  });
  return eventos;
}

// Componente "Tarjeta de Evento" para mantener el código limpio
function EventoCard({ evento }: { evento: any }) {
  const fechaEvento = new Date(evento.fecha);
  const esEventoPasado = fechaEvento < new Date();

  return (
    <Link
      href={`/eventos/${evento.id}`}
      className={`
        block rounded-2xl bg-gray-900 border border-gray-800
        shadow-lg overflow-hidden relative group
        transition-all duration-300
        hover:scale-[1.03] hover:border-lime-500/50
        hover:shadow-2xl hover:shadow-lime-500/20
        ${esEventoPasado ? 'opacity-70 grayscale-[50%]' : ''}
      `}
    >
      {/* 1. SECCIÓN DE IMAGEN */}
      <div className="relative h-48 w-full">
        {/* Imagen del Evento */}
        <Image
          src={evento.image || 'https://res.cloudinary.com/dfd1byvwn/image/upload/v1763747284/liga-nacional_zfqux3.webp'} // <-- ¡Asegúrate de tener una imagen fallback!
          alt={evento.nombre}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Superposición oscura para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>

        {/* Tag de Evento Pasado */}
        {esEventoPasado && (
          <span className="absolute top-3 left-3 px-3 py-1 text-sm font-bold rounded-full bg-yellow-500 text-gray-900 z-10">
            Finalizado
          </span>
        )}

        {/* Acento Chileno (ROJO): Tag de Fecha */}
        <span
          className="
            absolute top-3 right-3 px-3 py-1 text-sm font-bold rounded-full 
            bg-red-600/90 text-white shadow-md z-10
            backdrop-blur-sm border border-red-400/50
          "
        >
          {fechaEvento.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: 'short',
          }).replace('.', '')}
        </span>
      </div>

      {/* 2. SECCIÓN DE CONTENIDO */}
      <div className="p-5">
        {/* Tag de Tipo (Neón Lima) */}
        <span
          className="px-3 py-1 text-xs font-semibold rounded-full
                     bg-lime-400/10 text-lime-300 border border-lime-400/30"
        >
          {evento.tipo?.name || 'Evento'}
        </span>

        {/* Título */}
        <h3 className="mt-3 text-2xl font-bold text-white group-hover:text-lime-300 transition-colors truncate">
          {evento.nombre}
        </h3>

        {/* Ubicación (con Acento Chileno - AZUL) */}
        {evento.venue && (
          <p className="flex items-center gap-2 text-gray-400 mt-2 text-sm">
            {/* Acento Chileno (AZUL): Icono SVG */}
            <svg
              className="w-4 h-4 text-blue-400 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="truncate">
              {evento.venue.name} - {evento.venue.address?.comuna?.name}
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}

// --- El componente de la Página ---

// Este componente es un Server Component por defecto
export default function EventosListPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-bold text-lime-300 text-center mb-12
        drop-shadow-[0_0_10px_rgba(192,252,60,0.4)]">
        Próximos Eventos
      </h1>

      {/* Usamos Suspense para mostrar un 'loading' mientras se cargan los eventos */}
      <Suspense fallback={<LoadingSpinner />}>
        <ListaDeEventos />
      </Suspense>
    </div>
  );
}

// Componente 'async' separado para la carga de datos
async function ListaDeEventos() {
  const eventos = await getEventosPublicados();

  if (eventos.length === 0) {
    return (
      <p className="text-center text-gray-300 text-xl">
        No hay eventos publicados por el momento.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {eventos.map((evento) => (
        <EventoCard key={evento.id} evento={evento} />
      ))}
    </div>
  );
}

// Un simple spinner de carga
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div
        className="w-12 h-12 rounded-full animate-spin
                   border-4 border-solid border-lime-400 border-t-transparent"
      ></div>
    </div>
  );
}