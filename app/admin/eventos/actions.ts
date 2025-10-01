"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const CreateEventSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(200),
  descripcion: z.string().min(1, "La descripción es requerida").max(1000),
  fecha: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha inválida"
  }),
  lugar: z.string().min(1, "El lugar es requerido").max(200),
  ciudad: z.string().optional(),
  direccion: z.string().optional(),
  tipo: z.string().min(1, "El tipo es requerido"),
  reglas: z.string().min(1, "Las reglas son requeridas"),
  imagen: z.string().url("URL de imagen inválida").optional().or(z.literal("")),
  isPublished: z.coerce.boolean().default(false),
  isTicketed: z.coerce.boolean().default(true),
});

const EditEventSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1, "El nombre es requerido").max(200),
  descripcion: z.string().min(1, "La descripción es requerida").max(1000),
  fecha: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha inválida"
  }),
  lugar: z.string().min(1, "El lugar es requerido").max(200),
  ciudad: z.string().optional(),
  direccion: z.string().optional(),
  tipo: z.string().min(1, "El tipo es requerido"),
  reglas: z.string().min(1, "Las reglas son requeridas"),
  imagen: z.string().url("URL de imagen inválida").optional().or(z.literal("")),
  isPublished: z.coerce.boolean(),
  isTicketed: z.coerce.boolean(),
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
      lugar: formData.get("lugar")?.toString(),
      ciudad: formData.get("ciudad")?.toString(),
      direccion: formData.get("direccion")?.toString(),
      tipo: formData.get("tipo")?.toString(),
      reglas: formData.get("reglas")?.toString(),
      imagen: formData.get("imagen")?.toString(),
      isPublished: formData.get("isPublished")?.toString() || "false",
      isTicketed: formData.get("isTicketed")?.toString() || "true",
    };

    const parsed = CreateEventSchema.parse(data);

    const evento = await prisma.evento.create({
      data: {
        nombre: parsed.nombre,
        descripcion: parsed.descripcion || null,
        fecha: new Date(parsed.fecha),
        lugar: parsed.lugar || null,
        ciudad: parsed.ciudad || null,
        direccion: parsed.direccion || null,
        tipo: parsed.tipo,
        reglas: parsed.reglas,
        imagen: parsed.imagen || null,
        isPublished: parsed.isPublished,
        isTicketed: parsed.isTicketed,
      },
    });

    revalidatePath('/admin/eventos');
    revalidatePath(`/admin/eventos/${evento.id}`);
    
    return { ok: true, evento };
    
  } catch (e: any) {
    if (e.name === 'ZodError') {
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
      lugar: formData.get("lugar")?.toString(),
      ciudad: formData.get("ciudad")?.toString(),
      direccion: formData.get("direccion")?.toString(),
      tipo: formData.get("tipo")?.toString(),
      reglas: formData.get("reglas")?.toString(),
      imagen: formData.get("imagen")?.toString(),
      isPublished: formData.get("isPublished")?.toString(),
      isTicketed: formData.get("isTicketed")?.toString(),
    };

    const parsed = EditEventSchema.parse(data);

    const evento = await prisma.evento.update({
      where: { id: parsed.id },
      data: {
        nombre: parsed.nombre,
        descripcion: parsed.descripcion || null,
        fecha: new Date(parsed.fecha),
        lugar: parsed.lugar || null,
        ciudad: parsed.ciudad || null,
        direccion: parsed.direccion || null,
        tipo: parsed.tipo,
        reglas: parsed.reglas,
        imagen: parsed.imagen || null,
        isPublished: parsed.isPublished,
        isTicketed: parsed.isTicketed,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/eventos');
    revalidatePath(`/admin/eventos/${parsed.id}`);

    return { ok: true, evento };
  } catch (e: any) {
    if (e.name === 'ZodError') {
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

    revalidatePath('/admin/eventos');
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

    revalidatePath('/admin/eventos');
    
    // ✅ CAMBIO: No usar redirect(), devolver ok: true
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message || "Error al eliminar evento" };
  }
}