"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// --- CAMBIO: Actualizamos el schema de Zod ---
// Añadimos 'judge' (o cualquier otro rol que tengas)
const EditUserSchema = z.object({
  id: z.string().min(1),
  nombres: z.string().optional(),
  apellidoPaterno: z.string().optional(),
  apellidoMaterno: z.string().optional(),
  role: z.enum(["user", "admin", "judge"]), // <-- Asegúrate que esto incluya todos tus roles
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
      role: formData.get("role")?.toString(), // "admin"
      image: formData.get("image")?.toString(),
    };

    const parsed = EditUserSchema.parse(data);
    const userId = parsed.id;

    // --- CAMBIO: Usamos una transacción para actualizar 3 modelos ---
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Encontrar el ID del Rol basado en el nombre ("admin" -> "cl...id...")
      const roleRecord = await tx.role.findUnique({
        where: { name: parsed.role },
        select: { id: true },
      });

      if (!roleRecord) {
        throw new Error(`El rol "${parsed.role}" no existe en la base de datos.`);
      }

      // 2. Actualizar el modelo User (solo la imagen)
      await tx.user.update({
        where: { id: userId },
        data: {
          image: parsed.image || null,
        },
      });

      // 3. Crear o Actualizar el UserProfile (con 'upsert')
      await tx.userProfile.upsert({
        where: { userId: userId },
        // Qué crear si no existe
        create: {
          userId: userId,
          nombres: parsed.nombres,
          apellidoPaterno: parsed.apellidoPaterno,
          apellidoMaterno: parsed.apellidoMaterno,
        },
        // Qué actualizar si ya existe
        update: {
          nombres: parsed.nombres,
          apellidoPaterno: parsed.apellidoPaterno,
          apellidoMaterno: parsed.apellidoMaterno,
        },
      });

      // 4. Actualizar el Rol (borramos todos los anteriores y asignamos el nuevo)
      // Esto asegura que el usuario solo tenga el rol seleccionado en el formulario.
      await tx.userRole.deleteMany({
        where: { userId: userId },
      });

      await tx.userRole.create({
        data: {
          userId: userId,
          roleId: roleRecord.id,
        },
      });
      
      return true; // Éxito de la transacción
    });

    // Revalidar todas las páginas relacionadas con usuarios
    revalidatePath("/admin/usuarios");
    revalidatePath(`/admin/usuarios/${parsed.id}`);

    return { ok: true, user: updated };
  } catch (e: any) {
    // Si la transacción falla, 'e' tendrá el error
    return { ok: false, error: e.message || "Error al actualizar" };
  }
}

// --- SIN CAMBIOS: Esta función es compatible con el nuevo schema ---
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
    revalidatePath("/admin/usuarios");
    revalidatePath(`/admin/usuarios/${parsed.id}`);

    return { ok: true, user: updated };
  } catch (e: any) {
    return { ok: false, error: e.message || "Error al cambiar estado del usuario" };
  }
}