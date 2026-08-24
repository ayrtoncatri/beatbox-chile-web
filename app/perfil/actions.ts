"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import { getHeaderMetadata } from "@/lib/privacy";
import { parseBirthDateInput } from "@/lib/privacy/age";
import { parentalConsentError, persistParentalConsent } from "@/lib/privacy/parental";

const UpdatePerfilSchema = z.object({
  nombres: z.string().max(100).optional(),
  apellidoPaterno: z.string().max(100).optional(),
  apellidoMaterno: z.string().max(100).optional(),
  comunaId: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  birthDate: z.string().optional(),
  image: z.string().max(500).optional(),
});

export async function updatePerfil(prevState: any, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { ok: false, error: "No autorizado" };
    }

    const data = {
      nombres: formData.get("nombres")?.toString(),
      apellidoPaterno: formData.get("apellidoPaterno")?.toString(),
      apellidoMaterno: formData.get("apellidoMaterno")?.toString(),
      comunaId: formData.get("comunaId")?.toString(),
      birthDate: formData.get("birthDate")?.toString(),
      image: formData.get("image")?.toString(),
    };

    const parsed = UpdatePerfilSchema.parse(data);
    const birthDate = parseBirthDateInput(parsed.birthDate);
    const guardianName = formData.get("parentalGuardianName")?.toString() ?? "";
    const parentalAccepted = formData.get("parentalConsent") === "on";
    const parentalError = parentalConsentError(birthDate, guardianName, parentalAccepted);
    if (parentalError) return { ok: false, error: parentalError };

    // Busca el usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true },
    });
    if (!user) return { ok: false, error: "Usuario no encontrado" };

    const requestHeaders = await headers();

    await prisma.$transaction(async (tx) => {
      await tx.userProfile.upsert({
        where: { userId: user.id },
        update: {
          nombres: parsed.nombres,
          apellidoPaterno: parsed.apellidoPaterno,
          apellidoMaterno: parsed.apellidoMaterno,
          birthDate: birthDate ?? undefined,
          comunaId: parsed.comunaId,
        },
        create: {
          userId: user.id,
          nombres: parsed.nombres,
          apellidoPaterno: parsed.apellidoPaterno,
          apellidoMaterno: parsed.apellidoMaterno,
          birthDate: birthDate ?? undefined,
          comunaId: parsed.comunaId,
        },
      });

      await persistParentalConsent({
        tx,
        userId: user.id,
        email: user.email,
        birthDate,
        guardianName,
        accepted: parentalAccepted,
        headers: requestHeaders,
      });

      if (parsed.image) {
        await tx.user.update({
          where: { id: user.id },
          data: { image: parsed.image },
        });
      }
    });

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message || "Error al actualizar perfil" };
  }
}

export async function revokeMarketingConsent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "No autorizado" };
  }

  const requestHeaders = await headers();
  const result = await prisma.$transaction(async (transaction) => {
    const revoked = await transaction.privacyConsent.updateMany({
      where: {
        userId: session.user.id,
        category: "MARKETING",
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    await transaction.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: "MARKETING_CONSENT_REVOKED",
        resourceType: "User",
        resourceId: session.user.id,
        outcome: "SUCCESS",
        metadata: { recordsRevoked: revoked.count },
        ...getHeaderMetadata(requestHeaders),
      },
    });

    return revoked;
  });

  return { ok: true, recordsRevoked: result.count };
}