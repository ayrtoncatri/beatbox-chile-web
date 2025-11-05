"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkAdmin } from "@/lib/permissions";


const EditUserSchema = z.object({
  id: z.string().min(1),
  nombres: z.string().optional(),
  apellidoPaterno: z.string().optional(),
  apellidoMaterno: z.string().optional(),
  role: z.enum(["user", "admin", "judge"]),
  image: z.string().optional(),
});

const ToggleUserActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.coerce.boolean(),
});

export async function editUser(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);

  try {
    // 3. VERIFICAR QUE EL USUARIO ACTUAL ES ADMIN
    await checkAdmin();
  } catch (e: any) {
    return { ok: false, error: "No tienes permisos de administrador." };
  }
  // Obtenemos el ID del admin que realiza la acción
  const currentUserId = (session?.user as any)?.id;

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
    const userId = parsed.id;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: { select: { name: true } } } } },
    });

    if (!targetUser) {
      return { ok: false, error: "Usuario a editar no encontrado." };
    }

    const isSelf = targetUser.id === currentUserId;
    const isTargetAdmin = targetUser.roles.some(r => r.role.name === 'admin');
    const currentRoleName = targetUser.roles[0]?.role.name;
    const isRoleChanging = parsed.role !== currentRoleName;

    if ((isSelf || isTargetAdmin) && isRoleChanging) {
      return { ok: false, error: "No tienes permisos para cambiar el rol de un administrador." };
    }

    const updated = await prisma.$transaction(async (tx) => {
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

      if (isRoleChanging) {
        await tx.userRole.deleteMany({
          where: { userId: userId },
        });
        await tx.userRole.create({
          data: {
            userId: userId,
            roleId: roleRecord.id,
          },
        });
      }
      
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

export async function toggleUserActive(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);

  try {
    // 2. VERIFICAR QUE EL USUARIO ACTUAL ES ADMIN
    await checkAdmin();
  } catch (e: any) {
    return { ok: false, error: "No tienes permisos de administrador." };
  }
  // Obtenemos el ID del admin que realiza la acción
  const currentUserId = (session?.user as any)?.id;

  try {
    const data = {
      id: formData.get("id") as string,
      isActive: formData.get("isActive") === "true",
    };

    const parsed = ToggleUserActiveSchema.parse(data);
    const targetUserId = parsed.id;

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { roles: { include: { role: { select: { name: true } } } } },
    });

    if (!targetUser) {
      return { ok: false, error: "Usuario no encontrado." };
    }

    const isSelf = targetUser.id === currentUserId;
    const isTargetAdmin = targetUser.roles.some(r => r.role.name === 'admin');

    if (isSelf) {
      return { ok: false, error: "No puedes desactivar tu propia cuenta." };
    }
    if (isTargetAdmin) {
      return { ok: false, error: "No puedes desactivar a otro administrador." };
    }

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