"use server";

import { prisma } from "@/lib/prisma";
import { Prisma, RoundPhase , ScoreStatus } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export type AssignJudgeState = {
  ok: boolean;
  message?: string; // string o undefined
  error?: string;   // string o undefined
}

const EventFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(200),
  descripcion: z.string().min(1, "La descripción es requerida").max(1000),
  fecha: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha inválida",
  }),
  reglas: z.string().min(1, "Las reglas son requeridas"),
  image: z.string().url("URL de imagen inválida").optional().or(z.literal("")),
  isPublished: z.coerce.boolean(),
  isTicketed: z.coerce.boolean(),
  tipoId: z.string().cuid("ID de tipo de evento inválido"),

  venueName: z.string().optional(),
  venueStreet: z.string().optional(),
  comunaId: z.coerce.number().int().positive().optional(),

  wildcardDeadline: z.string().optional(),
});


const CreateEventSchema = EventFormSchema.extend({
  isPublished: z.coerce.boolean().default(false),
  isTicketed: z.coerce.boolean().default(true),
});

const EditEventSchema = EventFormSchema.extend({
  id: z.string().min(1),
});

const ToggleEventStatusSchema = z.object({
  id: z.string().min(1),
  isPublished: z.coerce.boolean(),
});

const TicketTypeFormSchema = z.object({
  eventId: z.string().cuid("ID de evento inválido"),
  name: z.string().min(1, "Nombre requerido").max(100),
  price: z.coerce.number().int().nonnegative("Precio debe ser >= 0"),
  capacity: z.coerce.number().int().positive().optional().nullable(), // Puede ser null
});

const DeleteTicketTypeSchema = z.object({
  id: z.string().cuid("ID de tipo de ticket inválido"),
  eventId: z.string().cuid("ID de evento inválido"), // Para revalidación
});

export async function createEvent(prevState: any, formData: FormData) {
  try {
    const data = {
      nombre: formData.get("nombre")?.toString(),
      descripcion: formData.get("descripcion")?.toString(),
      fecha: formData.get("fecha")?.toString(),
      reglas: formData.get("reglas")?.toString(),
      image: formData.get("image")?.toString(),
      isPublished: formData.get("isPublished"), // "on" o null
      isTicketed: formData.get("isTicketed"), // "on" o null
      tipoId: formData.get("tipoId")?.toString(),
      venueName: formData.get("venueName")?.toString(),
      venueStreet: formData.get("venueStreet")?.toString(),
      comunaId: formData.get("comunaId")?.toString(),
      wildcardDeadline: formData.get("wildcardDeadline")?.toString(),
    };

    const parsed = CreateEventSchema.parse(data);

    const evento = await prisma.$transaction(async (tx) => {
      let venueId: string | null = null;

      if (parsed.venueName || parsed.venueStreet || parsed.comunaId) {
        const address = await tx.address.create({
          data: {
            street: parsed.venueStreet || null,
            comunaId: parsed.comunaId || null,
          },
        });

        const venue = await tx.venue.create({
          data: {
            name: parsed.venueName || "Lugar sin nombre",
            addressId: address.id,
          },
        });
        venueId = venue.id;
      }

      const newEvento = await tx.evento.create({
        data: {
          nombre: parsed.nombre,
          descripcion: parsed.descripcion,
          fecha: new Date(parsed.fecha),
          reglas: parsed.reglas,
          image: parsed.image || null,
          isPublished: parsed.isPublished,
          isTicketed: parsed.isTicketed,
          tipoId: parsed.tipoId, 
          venueId: venueId, 
          wildcardDeadline: parsed.wildcardDeadline
            ? new Date(parsed.wildcardDeadline)
            : null,
        },
      });

      return newEvento;
    });

    revalidatePath("/admin/eventos");
    revalidatePath(`/admin/eventos/${evento.id}`);

    return { ok: true, evento };
  } catch (e: any) {
    if (e.name === "ZodError") {
      return { ok: false, error: e.errors[0]?.message || "Datos inválidos" };
    }
    return { ok: false, error: e.message || "Error al crear evento" };
  }
}

export async function editEvent(prevState: any, formData: FormData) {
  try {
    const data = {
      id: formData.get("id")?.toString(),
      nombre: formData.get("nombre")?.toString(),
      descripcion: formData.get("descripcion")?.toString(),
      fecha: formData.get("fecha")?.toString(),
      reglas: formData.get("reglas")?.toString(),
      image: formData.get("image")?.toString(),
      isPublished: formData.get("isPublished"), // "on" o null
      isTicketed: formData.get("isTicketed"), // "on" o null
      tipoId: formData.get("tipoId")?.toString(),
      venueName: formData.get("venueName")?.toString(),
      venueStreet: formData.get("venueStreet")?.toString(),
      comunaId: formData.get("comunaId")?.toString(),
      wildcardDeadline: formData.get("wildcardDeadline")?.toString(),
    };

    const parsed = EditEventSchema.parse(data);

    const evento = await prisma.$transaction(async (tx) => {
      const currentEvento = await tx.evento.findUnique({
        where: { id: parsed.id },
        select: { venueId: true, venue: { select: { addressId: true } } },
      });
      const existingVenueId = currentEvento?.venueId;
      const existingAddressId = currentEvento?.venue?.addressId;

      let venueId: string | null = existingVenueId || null;

      if (parsed.venueName || parsed.venueStreet || parsed.comunaId) {
        // 3b. "Upsert" Address
        const address = await tx.address.upsert({
          where: { id: existingAddressId || "dummy-id" }, 
          update: {
            street: parsed.venueStreet || null,
            comunaId: parsed.comunaId || null,
          },
          create: {
            street: parsed.venueStreet || null,
            comunaId: parsed.comunaId || null,
          },
        });

        // 3c. "Upsert" Venue
        const venue = await tx.venue.upsert({
          where: { id: existingVenueId || "dummy-id" },
          update: {
            name: parsed.venueName || "Lugar sin nombre",
            addressId: address.id,
          },
          create: {
            name: parsed.venueName || "Lugar sin nombre",
            addressId: address.id,
          },
        });
        venueId = venue.id;
      }
      // 4. Si NO se proporcionan datos del venue, pero existían, borrarlos
      else if (existingVenueId) {
        await tx.venue.delete({ where: { id: existingVenueId } });
        if (existingAddressId) {
          await tx.address.delete({ where: { id: existingAddressId } });
        }
        venueId = null;
      }

      // 5. Actualizar el Evento
      const updatedEvento = await tx.evento.update({
        where: { id: parsed.id },
        data: {
          nombre: parsed.nombre,
          descripcion: parsed.descripcion,
          fecha: new Date(parsed.fecha),
          reglas: parsed.reglas,
          image: parsed.image || null,
          isPublished: parsed.isPublished,
          isTicketed: parsed.isTicketed,
          tipoId: parsed.tipoId,
          venueId: venueId,
          wildcardDeadline: parsed.wildcardDeadline
            ? new Date(parsed.wildcardDeadline)
            : null,
          updatedAt: new Date(),
        },
      });

      return updatedEvento;
    });

    revalidatePath("/admin/eventos");
    revalidatePath(`/admin/eventos/${parsed.id}`);

    return { ok: true, evento };
  } catch (e: any) {
    if (e.name === "ZodError") {
      return { ok: false, error: e.errors[0]?.message || "Datos inválidos" };
    }
    return { ok: false, error: e.message || "Error al actualizar evento" };
  }
}

export async function toggleEventStatus(prevState: any, formData: FormData) {
  try {
    const data = {
      id: formData.get("id")?.toString(),
      isPublished: formData.get("isPublished") === "true",
    };

    const parsed = ToggleEventStatusSchema.parse(data);

    const evento = await prisma.evento.update({
      where: { id: parsed.id },
      data: {
        isPublished: parsed.isPublished,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/admin/eventos");
    revalidatePath(`/admin/eventos/${parsed.id}`);

    return { ok: true, evento };
  } catch (e: any) {
    return { ok: false, error: e.message || "Error al cambiar estado del evento" };
  }
}

export async function deleteEvent(prevState: any, formData: FormData) {
  try {
    const id = formData.get("id")?.toString();

    if (!id) {
      return { ok: false, error: "ID de evento requerido" };
    }

    await prisma.evento.delete({
      where: { id },
    });

    revalidatePath("/admin/eventos");

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message || "Error al eliminar evento" };
  }
}

export async function createTicketType(prevState: any, formData: FormData) {
  try {
    // 1. Extraer datos
    const data = {
      eventId: formData.get("eventId")?.toString(),
      name: formData.get("name")?.toString(),
      price: formData.get("price")?.toString(),
      capacity: formData.get("capacity")?.toString() || null, // Obtener como string o null
    };

    // 2. Validar con Zod
    const parsed = TicketTypeFormSchema.parse(data);

    // 3. Crear en la base de datos
    const newTicketType = await prisma.ticketType.create({
      data: {
        eventId: parsed.eventId,
        name: parsed.name,
        price: parsed.price,
        capacity: parsed.capacity, // Prisma maneja el number | null
        currency: "CLP", // Asumimos CLP por defecto
        isActive: true, // Activo por defecto
      },
    });

    // 4. Revalidar la caché de la página de edición del evento
    revalidatePath(`/admin/eventos/${parsed.eventId}`);

    return { ok: true, ticketType: newTicketType };
  } catch (e: any) {
    if (e.name === "ZodError") {
      return { ok: false, error: e.errors[0]?.message || "Datos inválidos" };
    }
    // Captura errores de unicidad (ej. mismo nombre de ticket en el evento)
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
       return { ok: false, error: "Ya existe un tipo de entrada con ese nombre para este evento." };
    }
    return { ok: false, error: e.message || "Error al crear tipo de entrada" };
  }
}

/**
 * Elimina un tipo de entrada.
 */
export async function deleteTicketType(prevState: any, formData: FormData) {
  try {
    // 1. Extraer datos (solo necesitamos el ID del ticket y el eventId para revalidar)
    const data = {
      id: formData.get("id")?.toString(),
      eventId: formData.get("eventId")?.toString(),
    };

    // 2. Validar con Zod
    const parsed = DeleteTicketTypeSchema.parse(data);

    // 3. Eliminar de la base de datos
    // NOTA: Si ya hay 'CompraItem' asociados, esto fallará por
    // la restricción 'onDelete: Restrict'. Podrías querer cambiarla
    // a 'SetNull' o manejar la eliminación de compras asociadas.
    // Por ahora, asumimos que no hay compras o que el error es aceptable.
    await prisma.ticketType.delete({
      where: { id: parsed.id },
    });

    // 4. Revalidar la caché de la página de edición del evento
    revalidatePath(`/admin/eventos/${parsed.eventId}`);

    return { ok: true };
  } catch (e: any) {
    if (e.name === "ZodError") {
      return { ok: false, error: e.errors[0]?.message || "ID inválido" };
    }
     // Captura error si no se puede borrar por compras asociadas
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') { // Foreign key constraint failed
       return { ok: false, error: "No se puede eliminar: hay compras asociadas a este tipo de entrada." };
    }
    return { ok: false, error: e.message || "Error al eliminar tipo de entrada" };
  }
}

/* ==================================================================
   ASIGNACIÓN DE JUECES (NUEVA FUNCIONALIDAD)
   ================================================================== */

// Zod Schema para validar el formulario del Admin
const assignJudgeSchema = z.object({
  eventoId: z.string().cuid('Evento inválido'),
  judgeId: z.string().cuid('Juez inválido'),
  categoriaId: z.string().cuid('Categoría inválida'),
  phase: z.nativeEnum(RoundPhase, {
    message: 'Fase inválida', // <-- CORREGIDO
  }),
});

/**
 * Asigna un Juez a un Evento/Categoría/Fase específicos.
 */
export async function assignJudgeAction(prevState: AssignJudgeState, formData: FormData): Promise<AssignJudgeState> {
  // 1. Validar los datos del formulario
  const validation = assignJudgeSchema.safeParse({
    eventoId: formData.get('eventoId'),
    judgeId: formData.get('judgeId'),
    categoriaId: formData.get('categoriaId'),
    phase: formData.get('phase'),
  });

  if (!validation.success) {
    return { ok: false, error: validation.error.issues[0]?.message || "Datos inválidos" }; // <-- CORREGIDO
  }

  const { eventoId, judgeId, categoriaId, phase } = validation.data;

  try {
    // 2. Crear la asignación
    await prisma.judgeAssignment.create({
      data: {
        eventoId,
        judgeId,
        categoriaId,
        phase,
      },
    });

    if (phase === RoundPhase.PRELIMINAR) {
      const battlePhases = [
        RoundPhase.OCTAVOS,
        RoundPhase.CUARTOS,
        RoundPhase.SEMIFINAL,
        RoundPhase.TERCER_LUGAR,
        RoundPhase.FINAL,
      ];

      const autoAssignments = battlePhases.map((p) => ({
        eventoId,
        judgeId,
        categoriaId,
        phase: p,
      }));

      // Usamos createMany con skipDuplicates para no fallar si el admin
      // ya había asignado manualmente alguna fase futura.
      await prisma.judgeAssignment.createMany({
        data: autoAssignments,
        skipDuplicates: true, 
      });
    }

    // 3. Éxito
    revalidatePath(`/admin/eventos/${eventoId}`); // Refrescar la página del admin
    revalidatePath('/judge/dashboard'); // Refrescar el dashboard del juez asignado

    const msg = phase === RoundPhase.PRELIMINAR 
      ? "Juez asignado a Preliminar y fases de Batalla." 
      : "Juez asignado exitosamente.";

    return { ok: true, message: msg };
    
  } catch (error: any) {
    // Manejar error si la asignación ya existe (por la llave unique)
    if (error.code === 'P2002') {
      return { ok: false, error: 'Este juez ya está asignado a esta tarea específica.' };
    }
    console.error('Error al asignar juez:', error);
    return { ok: false, error: 'Error interno del servidor al asignar juez.' };
  }
}

/* ==================================================================
   LÓGICA Y RANKING (FASE 6)
   ================================================================== */

// Definición de tipo para el resultado del ranking
export type RankingResult = {
  rank: number;
  participantId: string;
  nombreArtistico: string | null;
  avgScore: number;
  totalJudges: number;
  isClassified: boolean;
  wildcardId: string;
};

/**
 * Función helper que calcula el ranking para una categoría/fase.
 * Regla 2: Nota final = promedio de 'totalScore' entre jueces.
 * Regla 3: Ranking = orden descendente por 'avgScore'.
 */
export async function getWildcardRanking(
  eventoId: string,
  categoriaName: string,
  phase: RoundPhase = RoundPhase.WILDCARD
): Promise<RankingResult[]> {
  
  // 1. Obtener la Categoría ID
  const categoria = await prisma.categoria.findUnique({
    where: { name: categoriaName },
    select: { id: true },
  });

  if (!categoria) return [];

  const categoriaId = categoria.id;

  // 2. Calcular el promedio de los puntajes de los jueces
  // Agregamos por participante y calculamos el promedio (avg) de sus totalScores
  const scoresAggregation = await prisma.score.groupBy({
    by: ['participantId'],
    where: {
      eventoId,
      categoriaId,
      phase,
      status: ScoreStatus.SUBMITTED, // Solo contamos puntajes finales
    },
    _avg: {
      totalScore: true, // Promedio de la nota total del juez
    },
    _count: {
      judgeId: true, // Contamos cuántos jueces han votado
    },
  });

  // 3. Obtener metadatos de los participantes (Wildcard y Nombre Artístico)
  const participantIds = scoresAggregation.map((a) => a.participantId);
  
  const participantsData = await prisma.wildcard.findMany({
    where: {
      userId: { in: participantIds },
      eventoId,
      categoriaId,
    },
    select: {
      id: true,
      userId: true,
      nombreArtistico: true,
      isClassified: true,
    },
  });

  // 4. Mapear, calcular el ranking y ordenar
  let ranking = scoresAggregation
    .map((agg) => {
      const wildcard = participantsData.find((p) => p.userId === agg.participantId);
      
      // Manejo de participantes sin wildcard (aunque no debería pasar aquí)
      if (!wildcard) return null; 

      return {
        // rank se calcula después del sort
        participantId: agg.participantId,
        nombreArtistico: wildcard.nombreArtistico,
        avgScore: agg._avg.totalScore ?? 0, // Nota Final
        totalJudges: agg._count.judgeId,
        isClassified: wildcard.isClassified,
        wildcardId: wildcard.id,
      };
    })
    .filter((r): r is RankingResult => r !== null) // Filtra nulos
    .sort((a, b) => {
      // Regla 3: Orden descendente por Nota Final
      if (b.avgScore !== a.avgScore) {
        return b.avgScore - a.avgScore;
      }
      // Regla de Desempate (V2: Originalidad. Por ahora, mantenemos el orden de llegada si es empate)
      return 0; 
    });
    
  // 5. Asignar el rank basado en el orden
  return ranking.map((r, index) => ({
    ...r,
    rank: index + 1,
  }));
}


// Schema para clasificar (recibe los IDs de las wildcards a marcar)
const classifySchema = z.object({
  wildcardIds: z.array(z.string().cuid('ID de wildcard inválido')).min(1, 'Se requiere al menos una wildcard.'),
  eventoId: z.string().cuid('ID de evento inválido'), // Para revalidar
});

/**
 * Server Action para marcar Wildcards como clasificados.
 */
export async function classifyWildcardsAction(prevState: any, formData: FormData): Promise<{ ok: boolean; message?: string; error?: string }> {
  const rawIds = formData.getAll('wildcardIds');
  const eventoId = formData.get('eventoId')?.toString();

  // 1. Validación (ZOD)
  const validation = classifySchema.safeParse({ wildcardIds: rawIds, eventoId });
  
  if (!validation.success) {
    return { ok: false, error: validation.error.issues[0]?.message || 'Datos inválidos para clasificación.' };
  }
  
  const { wildcardIds } = validation.data;

  try {
    // 2. Actualizar las wildcards
    await prisma.wildcard.updateMany({
      where: {
        id: { in: wildcardIds },
        eventoId: eventoId,
      },
      data: {
        isClassified: true, // Marcar como clasificado
      },
    });

    // 3. Éxito
    revalidatePath(`/admin/eventos/${eventoId}`); // Refrescar la tabla de ranking en el admin
    revalidatePath('/eventos'); // O donde se muestren los clasificados públicamente
    
    return { ok: true, message: `Se marcaron ${wildcardIds.length} participantes como clasificados.` };
    
  } catch (error: any) {
    console.error('Error al clasificar wildcards:', error);
    return { ok: false, error: 'Error interno al actualizar la clasificación.' };
  }
}

/* ==================================================================
   GESTIÓN DE COMPETITION CATEGORY (NUEVO)
   ================================================================== */

const manageCategorySchema = z.object({
  eventoId: z.string().cuid('ID de evento inválido'),
  categoriaId: z.string().cuid('ID de categoría inválida'),
  wildcardSlots: z.coerce.number().int().min(0, 'Los cupos deben ser 0 o más'),
});

/**
 * Crea o actualiza una CompetitionCategory para un evento (define cupos).
 */
export async function upsertCompetitionCategoryAction(prevState: any, formData: FormData): Promise<{ ok: boolean; message?: string; error?: string }> {
  const data = {
    eventoId: formData.get('eventoId'),
    categoriaId: formData.get('categoriaId'),
    wildcardSlots: formData.get('wildcardSlots'),
  };

  const validation = manageCategorySchema.safeParse(data);
  if (!validation.success) {
    return { ok: false, error: validation.error.issues[0]?.message || 'Datos de categoría inválidos.' };
  }

  const { eventoId, categoriaId, wildcardSlots } = validation.data;

  try {
    await prisma.competitionCategory.upsert({
      where: {
        eventoId_categoriaId: {
          eventoId: eventoId,
          categoriaId: categoriaId,
        },
      },
      update: { wildcardSlots },
      create: {
        eventoId,
        categoriaId,
        wildcardSlots,
      },
    });

    revalidatePath(`/admin/eventos/${eventoId}`);
    return { ok: true, message: `Categoría ${categoriaId} actualizada con ${wildcardSlots} cupos.` };
  } catch (e) {
    return { ok: false, error: 'Error al gestionar la categoría del evento.' };
  }
}

export type InscritosResult = Prisma.InscripcionGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        email: true;
        profile: {
          select: { nombres: true; apellidoPaterno: true };
        };
      };
    };
    categoria: {
      select: { id: true; name: true };
    };
  };
}>;

/**
 * Obtiene la lista de todos los participantes inscritos en un evento.
 */
export async function getInscritosForEvent(
  eventoId: string
): Promise<InscritosResult[]> {
  // (2) Verificación de seguridad (opcional pero recomendada)
  // (Asumimos que esta es una función solo para admins,
  // por lo que verificamos la sesión como en las otras acciones)
  const session = await getServerSession(authOptions); // Usamos authOptions de lib/auth
  const userRoles = (session?.user as any)?.roles || [];
  if (!session?.user?.id || !userRoles.includes('admin')) {
    throw new Error('No autorizado');
  }

  try {
    // (3) La consulta a la base de datos
    const inscritos = await prisma.inscripcion.findMany({
      where: { eventoId: eventoId },
      include: {
        // Incluimos los datos del usuario
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: { nombres: true, apellidoPaterno: true },
            },
          },
        },
        // Incluimos la categoría
        categoria: {
          select: { id: true, name: true },
        },
      },
      orderBy: [
        { categoria: { name: 'asc' } }, // Ordenar por categoría
        { nombreArtistico: 'asc' }, // Luego por nombre artístico
      ],
    });

    return inscritos;
  } catch (error) {
    console.error('Error al obtener inscritos:', error);
    return []; // Devolver array vacío en caso de error
  }
}