"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const EditUserSchema = z.object({
  id: z.string().min(1),
  nombres: z.string().optional(),
  apellidoPaterno: z.string().optional(),
  apellidoMaterno: z.string().optional(),
  role: z.enum(["user", "admin"]),
  image: z.string().optional(),
});

const ToggleUserActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.coerce.boolean(),
});

export async function editUser(prevState: any, formData: FormData) {
  try {
    const data = {
      id: formData.get("id") as string,
      nombres: formData.get("nombres")?.toString(),
      apellidoPaterno: formData.get("apellidoPaterno")?.toString(),
      apellidoMaterno: formData.get("apellidoMaterno")?.toString(),
      role: formData.get("role")?.toString(),
      image: formData.get("image")?.toString(),
    };

    const parsed = EditUserSchema.parse(data);

    const updated = await prisma.user.update({
      where: { id: parsed.id },
      data: {
        nombres: parsed.nombres || null,
        apellidoPaterno: parsed.apellidoPaterno || null,
        apellidoMaterno: parsed.apellidoMaterno || null,
        role: parsed.role,
        image: parsed.image || null,
        updatedAt: new Date(),
      },
    });

    // Revalidar todas las páginas relacionadas con usuarios
    revalidatePath('/admin/usuarios');
    revalidatePath(`/admin/usuarios/${parsed.id}`);

    return { ok: true, user: updated };
  } catch (e: any) {
    return { ok: false, error: e.message || "Error al actualizar" };
  }
}

export async function toggleUserActive(prevState: any, formData: FormData) {
  try {
    const data = {
      id: formData.get("id") as string,
      isActive: formData.get("isActive") === "true",
    };

    const parsed = ToggleUserActiveSchema.parse(data);

    const updated = await prisma.user.update({
      where: { id: parsed.id },
      data: {
        isActive: parsed.isActive,
        updatedAt: new Date(),
      },
    });

    // Revalidar todas las páginas relacionadas con usuarios
    revalidatePath('/admin/usuarios');
    revalidatePath(`/admin/usuarios/${parsed.id}`);

    return { ok: true, user: updated };
  } catch (e: any) {
    return { ok: false, error: e.message || "Error al cambiar estado del usuario" };
  }
}