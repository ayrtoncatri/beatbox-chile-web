import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Suspense } from 'react';

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
      className={`block p-6 rounded-2xl bg-gray-900 border border-gray-700
                  hover:border-lime-400 hover:shadow-xl hover:shadow-lime-500/10
                  transition-all duration-300 group
                  ${esEventoPasado ? 'opacity-60' : ''}
                 `}
    >
      <div className="flex justify-between items-center mb-2">
        <span
          className="px-3 py-1 text-sm font-semibold rounded-full
                       bg-lime-400/10 text-lime-300 border border-lime-400/30"
        >
          {evento.tipo?.name || 'Evento'}
        </span>
        <span className="text-sm text-gray-400">
          {fechaEvento.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-white group-hover:text-lime-300 transition-colors">
        {evento.nombre}
      </h3>
      {evento.venue && (
        <p className="text-gray-300 mt-1">
          {evento.venue.name} - {evento.venue.address?.comuna?.name}
        </p>
      )}
      {esEventoPasado && (
        <p className="text-yellow-500 text-sm font-semibold mt-3">
          (Evento finalizado)
        </p>
      )}
    </Link>
  );
}

// --- El componente de la Página ---

// Este componente es un Server Component por defecto
export default function EventosListPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-bold text-lime-300 text-center mb-12">
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