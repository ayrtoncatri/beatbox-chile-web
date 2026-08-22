import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { RoundPhase } from '@prisma/client';
import EventoLanding from '@/components/eventos/EventoLanding';

async function getEvento(id: string) {
  const evento = await prisma.evento.findUnique({
    where: { id },
    include: {
      tipo: true,
      venue: {
        include: {
          address: {
            include: {
              comuna: {
                include: { region: true },
              },
            },
          },
        },
      },
      ticketTypes: {
        where: { isActive: true },
        orderBy: { price: 'asc' },
      },
      assignments: {
        include: {
          judge: {
            select: {
              id: true,
              name: true,
              image: true,
              profile: {
                select: {
                  nombres: true,
                  apellidoPaterno: true,
                },
              },
            },
          },
          categoria: {
            select: { name: true },
          },
        },
      },
      _count: {
        select: {
          battles: true,
          wildcards: true,
        },
      },
    },
  });

  if (!evento) notFound();
  return evento;
}

function judgeName(judge: {
  name: string | null;
  profile: { nombres: string | null; apellidoPaterno: string | null } | null;
}) {
  const fromProfile = [judge.profile?.nombres, judge.profile?.apellidoPaterno]
    .filter(Boolean)
    .join(' ')
    .trim();
  return fromProfile || judge.name || 'Juez';
}

export default async function EventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evento = await getEvento(id);

  const judgesMap = new Map<
    string,
    { id: string; name: string; image: string | null; tag: string; subtitle: string }
  >();

  for (const assignment of evento.assignments) {
    if (judgesMap.has(assignment.judgeId)) continue;
    judgesMap.set(assignment.judgeId, {
      id: assignment.judgeId,
      name: judgeName(assignment.judge),
      image: assignment.judge.image,
      tag: assignment.categoria.name,
      subtitle: 'Juez oficial',
    });
  }

  const phases = Array.from(
    new Set(evento.assignments.map((assignment) => assignment.phase))
  ) as RoundPhase[];

  return (
    <EventoLanding
      evento={{
        id: evento.id,
        nombre: evento.nombre,
        fecha: evento.fecha,
        descripcion: evento.descripcion,
        reglas: evento.reglas,
        image: evento.image,
        isTicketed: evento.isTicketed,
        wildcardDeadline: evento.wildcardDeadline,
        sponsors: evento.sponsors,
        tipoName: evento.tipo?.name ?? null,
        ticketTypes: evento.ticketTypes.map((ticket) => ({
          id: ticket.id,
          name: ticket.name,
          price: ticket.price,
          capacity: ticket.capacity,
        })),
        venue: evento.venue
          ? {
              name: evento.venue.name,
              street: evento.venue.address?.street ?? null,
              comuna: evento.venue.address?.comuna?.name ?? null,
              region: evento.venue.address?.comuna?.region?.name ?? null,
              lat: evento.venue.address?.lat != null ? Number(evento.venue.address.lat) : null,
              lng: evento.venue.address?.lng != null ? Number(evento.venue.address.lng) : null,
            }
          : null,
        judges: Array.from(judgesMap.values()),
        phases,
        hasBattles: evento._count.battles > 0,
        hasWildcards: evento._count.wildcards > 0,
      }}
    />
  );
}
