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
  roles: z.array(z.string()).min(1, "El usuario debe tener al menos un rol."),
  image: z.string().optional(),
});

const ToggleUserActiveSchema = z.object({
  id: z.string().min(1),
  isActive: z.coerce.boolean(),
});

export async function editUser(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);

  try {
    await checkAdmin();
  } catch (e: any) {
    return { ok: false, error: "No tienes permisos de administrador." };
  }
  const currentUserId = (session?.user as any)?.id;

  try {
    const data = {
      id: formData.get("id") as string,
      nombres: formData.get("nombres")?.toString(),
      apellidoPaterno: formData.get("apellidoPaterno")?.toString(),
      apellidoMaterno: formData.get("apellidoMaterno")?.toString(),
      roles: formData.getAll("roles"),
      image: formData.get("image")?.toString(),
    };

    const parsed = EditUserSchema.parse(data);
    const userId = parsed.id;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: { select: { name: true, id: true } } } } },
    });

    if (!targetUser) {
      return { ok: false, error: "Usuario a editar no encontrado." };
    }

    const isTargetAdmin = targetUser.roles.some(r => r.role.name === 'admin');
    // La nueva lista de IDs de roles que vienen del formulario
    const newRoleIds = parsed.roles;
    // Buscamos el ID del rol 'admin'
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' }, select: { id: true } });

    // Si el usuario es admin, pero el rol 'admin' no está en los nuevos IDs...
    if (isTargetAdmin && !newRoleIds.includes(adminRole!.id)) {
      return { ok: false, error: "No tienes permisos para quitar el rol de 'admin' a un administrador." };
    }

    const updated = await prisma.$transaction(async (tx) => {
      
      // --- CAMBIO 4: Lógica de actualización de roles (Muchos-a-Muchos) ---
      
      // 1. Obtenemos los IDs de los roles actuales del usuario
      const currentRoleIds = targetUser.roles.map(r => r.role.id);
      
      // 2. Calculamos qué roles AÑADIR
      const rolesToAdd = newRoleIds.filter(id => !currentRoleIds.includes(id));
      
      // 3. Calculamos qué roles QUITAR
      const rolesToRemove = currentRoleIds.filter(id => !newRoleIds.includes(id));

      // 4. Ejecutamos las operaciones
      if (rolesToAdd.length > 0) {
        await tx.userRole.createMany({
          data: rolesToAdd.map(roleId => ({
            userId: userId,
            roleId: roleId,
          })),
        });
      }
      
      if (rolesToRemove.length > 0) {
        await tx.userRole.deleteMany({
          where: {
            userId: userId,
            roleId: { in: rolesToRemove },
          },
        });
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