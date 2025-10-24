"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

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
          where: { id: existingAddressId || "dummy-id" }, // dummy-id fuerza 'create' si es null
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

// --- SIN CAMBIOS: Esta función es compatible con el nuevo schema ---
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

// --- SIN CAMBIOS: Esta función es compatible con el nuevo schema ---
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