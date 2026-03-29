"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PublicationStatus, PublicationType } from "@prisma/client";

const PublicacionSchema = z.object({
  titulo: z.string().min(1, "El título es requerido").max(200),
  descripcion: z.string().max(4000).optional(),
  tipo: z.nativeEnum(PublicationType),
  fecha: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha inválida",
  }),
  estado: z.nativeEnum(PublicationStatus),
  url: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+/i.test(val), {
      message: "La URL debe comenzar con http:// o https://",
    }),
  autor: z.string().min(1, "El autor es requerido").max(120),
  imagenPortada: z
    .string()
    .trim()
    .min(1, "La imagen de portada es requerida")
    .refine((val) => /^https?:\/\/.+/i.test(val), {
      message: "La imagen de portada debe ser una URL válida",
    }),
  imagenesGaleria: z
    .array(z.string().url("Una o más URLs de galería son inválidas"))
    .default([]),
});

const EditPublicacionSchema = PublicacionSchema.extend({
  id: z.string().min(1, "El id es requerido"),
});

function parseGaleria(raw: FormDataEntryValue | null): string[] {
  if (!raw) return [];

  return raw
    .toString()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export type PublicacionActionState = {
  ok: boolean;
  error?: string;
};

export async function createPublicacion(
  _prevState: PublicacionActionState,
  formData: FormData
): Promise<PublicacionActionState> {
  try {
    const parsed = PublicacionSchema.parse({
      titulo: formData.get("titulo")?.toString(),
      descripcion: formData.get("descripcion")?.toString() || "",
      tipo: formData.get("tipo")?.toString(),
      fecha: formData.get("fecha")?.toString(),
      estado: formData.get("estado")?.toString(),
      url: formData.get("url")?.toString(),
      autor: formData.get("autor")?.toString(),
      imagenPortada: formData.get("imagenPortada")?.toString(),
      imagenesGaleria: parseGaleria(formData.get("imagenesGaleria")),
    });

    const imagenes = [parsed.imagenPortada, ...parsed.imagenesGaleria];

    const created = await prisma.publicacion.create({
      data: {
        titulo: parsed.titulo,
        descripcion: parsed.descripcion || null,
        tipo: parsed.tipo,
        fecha: new Date(parsed.fecha),
        estado: parsed.estado,
        url: parsed.url || null,
        autor: parsed.autor,
        imagenes,
      },
    });

    revalidatePath("/admin/publicaciones");
    revalidatePath(`/admin/publicaciones/${created.id}`);
    revalidatePath("/admin/publicaciones/nuevo");
    revalidatePath("/");
    revalidatePath(`/publicaciones/${created.id}`);
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      return { ok: false, error: e.errors[0]?.message || "Datos inválidos" };
    }

    return { ok: false, error: "Error al crear publicación" };
  }

  redirect("/admin/publicaciones");
}

export async function editPublicacion(
  _prevState: PublicacionActionState,
  formData: FormData
): Promise<PublicacionActionState> {
  try {
    const parsed = EditPublicacionSchema.parse({
      id: formData.get("id")?.toString(),
      titulo: formData.get("titulo")?.toString(),
      descripcion: formData.get("descripcion")?.toString() || "",
      tipo: formData.get("tipo")?.toString(),
      fecha: formData.get("fecha")?.toString(),
      estado: formData.get("estado")?.toString(),
      url: formData.get("url")?.toString(),
      autor: formData.get("autor")?.toString(),
      imagenPortada: formData.get("imagenPortada")?.toString(),
      imagenesGaleria: parseGaleria(formData.get("imagenesGaleria")),
    });

    const imagenes = [parsed.imagenPortada, ...parsed.imagenesGaleria];

    await prisma.publicacion.update({
      where: { id: parsed.id },
      data: {
        titulo: parsed.titulo,
        descripcion: parsed.descripcion || null,
        tipo: parsed.tipo,
        fecha: new Date(parsed.fecha),
        estado: parsed.estado,
        url: parsed.url || null,
        autor: parsed.autor,
        imagenes,
      },
    });

    revalidatePath("/admin/publicaciones");
    revalidatePath(`/admin/publicaciones/${parsed.id}`);
    revalidatePath("/");
    revalidatePath(`/publicaciones/${parsed.id}`);
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      return { ok: false, error: e.errors[0]?.message || "Datos inválidos" };
    }

    return { ok: false, error: "Error al actualizar publicación" };
  }

  redirect("/admin/publicaciones");
}

export async function deletePublicacion(
  _prevState: PublicacionActionState,
  formData: FormData
): Promise<PublicacionActionState> {
  try {
    const id = formData.get("id")?.toString();

    if (!id) {
      return { ok: false, error: "ID de publicación requerido" };
    }

    await prisma.publicacion.delete({
      where: { id },
    });

    revalidatePath("/admin/publicaciones");
    revalidatePath("/");
    revalidatePath(`/publicaciones/${id}`);

    return { ok: true };
  } catch {
    return { ok: false, error: "Error al eliminar publicación" };
  }
}