import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// 1. Importa tu formulario
import FormularioWildcard from '@/components/wildcards/FormularioWildcard';
import CompraTicketsForm from '@/components/compra-entradas/CompraTicketsForm';

/**
 * Función de servidor para obtener los datos del evento por su ID.
 */
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
      // --- 🔽 CAMBIO AQUÍ 🔽 ---
      // Incluimos los tipos de tickets para este evento
      ticketTypes: {
        where: { isActive: true },
        orderBy: { price: 'asc' }, // Opcional: ordenar por precio
      },
      // --- 🔼 FIN DEL CAMBIO 🔼 ---
    },
  });

  if (!evento) {
    notFound();
  }
  return evento;
}

/**
 * Componente local para manejar la lógica de inscripción de Wildcard.
 */
function WildcardInscripcion({ evento }: { evento: any }) {
  const ahora = new Date();
  const deadline = evento.wildcardDeadline
    ? new Date(evento.wildcardDeadline)
    : null;

  let wildcardStatus: 'abierto' | 'cerrado' | 'no_disponible' =
    'no_disponible';

  if (deadline) {
    if (deadline > ahora) {
      wildcardStatus = 'abierto';
    } else {
      wildcardStatus = 'cerrado';
    }
  }

  if (wildcardStatus === 'abierto') {
    // --- 🔽 CORRECCIÓN AQUÍ 🔽 ---
    // Añadimos esta comprobación. Aunque ya sabemos que 'deadline' no es null,
    // esto se lo confirma a TypeScript.
    if (!deadline) {
      return (
        <p className="text-center text-red-400">Error al cargar la fecha.</p>
      );
    }
    // --- 🔼 FIN DE LA CORRECCIÓN 🔼 ---

    return (
      <Suspense fallback={<p>Cargando formulario...</p>}>
        <div className="mb-6 text-center">
          <p className="text-lg text-lime-300">
            ¡Inscripciones abiertas! Tienes hasta el:
          </p>
          <p className="text-xl font-bold text-white">
            {/* Ahora TypeScript sabe que 'deadline' no es null aquí */}
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
      <div className="max-w-2xl mx-auto text-center bg-yellow-900/50 p-6 rounded-lg border border-yellow-700">
        <h3 className="text-2xl font-bold text-yellow-300">
          Inscripciones Cerradas
        </h3>
        <p className="text-yellow-200 mt-2">
          El plazo para enviar wildcards para este evento ha finalizado.
        </p>
      </div>
    );
  }

  // (wildcardStatus === 'no_disponible')
  return (
    <div className="max-w-2xl mx-auto text-center bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 className="text-xl font-bold text-gray-300">
        Inscripción Wildcard
      </h3>
      <p className="text-gray-400 mt-2">
        Este evento no tiene un proceso de clasificación por wildcard.
      </p>
    </div>
  );
}


function CompraEntradasSeccion({ evento }: { evento: any }) {
  // Verificamos si el evento está marcado para tickets Y
  // si realmente tiene tipos de tickets definidos (ticketTypes.length > 0)
  const isTicketed = evento.isTicketed && evento.ticketTypes.length > 0;
  const esEventoPasado = new Date(evento.fecha) < new Date();

  if (esEventoPasado) {
    return (
      <div className="max-w-2xl mx-auto text-center bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold text-gray-300">Venta de Entradas</h3>
        <p className="text-gray-400 mt-2">Este evento ya ha finalizado.</p>
      </div>
    );
  }

  if (isTicketed) {
    // Si hay tickets, mostramos el formulario
    return (
      <CompraTicketsForm
        eventoId={evento.id}
        ticketTypes={evento.ticketTypes}
      />
    );
  }

  // Si no, mostramos un mensaje
  return (
    <div className="max-w-2xl mx-auto text-center bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 className="text-xl font-bold text-gray-300">Venta de Entradas</h3>
      <p className="text-gray-400 mt-2">
        Las entradas para este evento no están disponibles para la venta online
        o aún no han sido publicadas.
      </p>
    </div>
  );
}

/**
 * La página de detalle del evento principal (Server Component)
 */
export default async function EventoPage({
  params,
}: {
  params: { id: string };
}) {
  const evento = await getEvento(params.id);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Sección 1: Detalles del Evento */}
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-lime-300 mb-2">
          {evento.nombre}
        </h1>
        <p className="text-2xl text-white">
          {new Date(evento.fecha).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        {evento.venue && (
          <p className="text-xl text-gray-300 mt-2">
            {evento.venue.name} - {evento.venue.address?.comuna?.name}
          </p>
        )}
      </header>

      {/* Sección 2: Reglas */}
      <div className="max-w-3xl mx-auto bg-gray-900 p-6 rounded-lg mb-12 border border-gray-700">
        <h2 className="text-3xl font-bold text-lime-300 mb-4">
          Reglas del Evento
        </h2>
        <div className="prose prose-invert text-gray-200">
          <p className="whitespace-pre-wrap">{evento.reglas}</p>
        </div>
      </div>

      {/* Sección 3: Formulario de Wildcard */}
      <WildcardInscripcion evento={evento} />
      
      <hr className="max-w-3xl mx-auto border-t-2 border-lime-400/20 my-16" />

      <Suspense fallback={<p>Cargando sección de entradas...</p>}>
        <CompraEntradasSeccion evento={evento} />
      </Suspense>
    </div>
  );
}