import type { PrivacyRequestType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { retainReasonsForSuppression } from "@/lib/privacy/data-map";

export type FulfillResult = {
  ok: boolean;
  summary: string;
  retainedReasons?: string[];
  exportPayload?: unknown;
};

type Tx = Prisma.TransactionClient;

async function exportSubjectData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      isActive: true,
      processingBlockedAt: true,
      anonymizedAt: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          nombres: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          birthDate: true,
          comunaId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      roles: { select: { role: { select: { name: true } } } },
      wildcards: {
        select: {
          id: true,
          youtubeUrl: true,
          nombreArtistico: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      compras: {
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
          updatedAt: true,
          items: {
            select: {
              quantity: true,
              unitPrice: true,
              subtotal: true,
            },
          },
        },
      },
      sugerencias: {
        select: {
          id: true,
          asunto: true,
          mensaje: true,
          estado: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      mensajes: {
        select: {
          id: true,
          nombre: true,
          email: true,
          mensaje: true,
          createdAt: true,
        },
      },
      privacyConsents: {
        select: {
          category: true,
          policyVersion: true,
          method: true,
          givenAt: true,
          revokedAt: true,
        },
      },
      privacyRequests: {
        select: {
          id: true,
          type: true,
          status: true,
          receivedAt: true,
          deadlineAt: true,
          completedAt: true,
        },
      },
      inscripciones: {
        select: {
          id: true,
          createdAt: true,
          eventoId: true,
          categoriaId: true,
          source: true,
          nombreArtistico: true,
        },
      },
      stats: {
        select: {
          id: true,
          eventoId: true,
          puntos: true,
          detalle: true,
        },
      },
      participantScores: {
        select: {
          id: true,
          eventoId: true,
          categoriaId: true,
          phase: true,
          totalScore: true,
          status: true,
          createdAt: true,
        },
      },
      battlesAsParticipantA: {
        select: { id: true, eventoId: true, phase: true, orderInRound: true },
      },
      battlesAsParticipantB: {
        select: { id: true, eventoId: true, phase: true, orderInRound: true },
      },
    },
  });

  return user;
}

async function anonymizeSubject(tx: Tx, userId: string) {
  const anonEmail = `anonimizado-${userId.slice(0, 8)}@invalid.local`;

  await tx.user.update({
    where: { id: userId },
    data: {
      email: anonEmail,
      name: null,
      password: null,
      image: null,
      isActive: false,
      totpSecretEncrypted: null,
      totpEnabled: false,
      totpConfirmedAt: null,
      anonymizedAt: new Date(),
      processingBlockedAt: new Date(),
    },
  });

  await tx.userProfile.updateMany({
    where: { userId },
    data: {
      nombres: null,
      apellidoPaterno: null,
      apellidoMaterno: null,
      birthDate: null,
      comunaId: null,
      parentalGuardianName: null,
      parentalConsentAt: null,
    },
  });

  await tx.wildcard.updateMany({
    where: { userId },
    data: {
      youtubeUrl: "https://invalid.local/anonimizado",
      nombreArtistico: "ANONIMIZADO",
      notes: null,
    },
  });

  await tx.inscripcion.updateMany({
    where: { userId },
    data: { nombreArtistico: "ANONIMIZADO" },
  });

  await tx.puntaje.updateMany({
    where: { userId },
    data: { detalle: null },
  });

  await tx.score.updateMany({
    where: { participantId: userId },
    data: { notes: null },
  });

  await tx.sugerencia.updateMany({
    where: { userId },
    data: {
      nombre: null,
      email: null,
      asunto: null,
      mensaje: "[contenido anonimizado]",
      notaPrivada: null,
    },
  });

  await tx.mensaje.updateMany({
    where: { userId },
    data: {
      nombre: "ANONIMIZADO",
      email: anonEmail,
      mensaje: "[contenido anonimizado]",
    },
  });

  await tx.privacyConsent.updateMany({
    where: { userId },
    data: {
      email: null,
      ip: null,
      userAgent: null,
    },
  });

  await tx.mfaRecoveryCode.deleteMany({ where: { userId } });
  await tx.passwordResetToken.deleteMany({ where: { userId } });
}

async function applyRectification(
  tx: Tx,
  userId: string,
  detail: string,
) {
  // El detalle puede incluir JSON opcional: {"nombres":"...","apellidoPaterno":"...","name":"...","email":"..."}
  let patch: {
    name?: string;
    email?: string;
    nombres?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
  } = {};

  try {
    const parsed = JSON.parse(detail) as typeof patch;
    if (parsed && typeof parsed === "object") patch = parsed;
  } catch {
    return {
      ok: false as const,
      summary:
        "Rectificacion requiere detalle en JSON con campos permitidos (name, email, nombres, apellidoPaterno, apellidoMaterno).",
    };
  }

  if (patch.email || patch.name !== undefined) {
    await tx.user.update({
      where: { id: userId },
      data: {
        ...(patch.email ? { email: patch.email } : {}),
        ...(patch.name !== undefined ? { name: patch.name } : {}),
      },
    });
  }

  if (
    patch.nombres !== undefined
    || patch.apellidoPaterno !== undefined
    || patch.apellidoMaterno !== undefined
  ) {
    await tx.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        nombres: patch.nombres ?? null,
        apellidoPaterno: patch.apellidoPaterno ?? null,
        apellidoMaterno: patch.apellidoMaterno ?? null,
      },
      update: {
        ...(patch.nombres !== undefined ? { nombres: patch.nombres } : {}),
        ...(patch.apellidoPaterno !== undefined
          ? { apellidoPaterno: patch.apellidoPaterno }
          : {}),
        ...(patch.apellidoMaterno !== undefined
          ? { apellidoMaterno: patch.apellidoMaterno }
          : {}),
      },
    });
  }

  return { ok: true as const, summary: "Datos rectificados segun el detalle aportado." };
}

async function revokeCookieConsent(tx: Tx, userId: string) {
  await tx.privacyConsent.updateMany({
    where: {
      userId,
      category: "COOKIES",
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}

function parseOppositionScope(detail: string): "MARKETING" | "COOKIES" | "NON_ESSENTIAL" {
  const trimmed = detail.trim();
  const firstLine = trimmed.split("\n")[0] ?? "";
  if (firstLine.startsWith("{")) {
    try {
      const parsed = JSON.parse(firstLine) as { scope?: string };
      if (parsed.scope === "COOKIES" || parsed.scope === "NON_ESSENTIAL" || parsed.scope === "MARKETING") {
        return parsed.scope;
      }
    } catch {
      // seguir con heuristicas
    }
  }
  const lower = trimmed.toLowerCase();
  if (lower.includes("cookie") || lower.includes("youtube") || lower.includes("tercer")) {
    return "COOKIES";
  }
  if (lower.includes("esencial") || lower.includes("no esencial") || lower.includes("tratamiento no")) {
    return "NON_ESSENTIAL";
  }
  return "MARKETING";
}

async function revokeMarketing(tx: Tx, userId: string) {
  const now = new Date();
  await tx.privacyConsent.updateMany({
    where: {
      userId,
      category: "MARKETING",
      revokedAt: null,
    },
    data: { revokedAt: now },
  });
  return { ok: true as const, summary: "Consentimiento de marketing revocado." };
}

/**
 * Ejecuta el derecho solicitado sobre el titular vinculado a la PrivacyRequest.
 */
export async function fulfillPrivacyRequest(params: {
  requestId: string;
  type: PrivacyRequestType;
  userId: string | null;
  detail: string;
  actorUserId?: string | null;
}): Promise<FulfillResult> {
  const { requestId, type, userId, detail, actorUserId } = params;

  if (!userId && type !== "OPOSICION" && type !== "REVOCACION") {
    return {
      ok: false,
      summary: "La solicitud debe vincularse a un usuario verificado antes de ejecutarse.",
    };
  }

  if (type === "ACCESO" || type === "PORTABILIDAD") {
    if (!userId) {
      return { ok: false, summary: "Se requiere usuario vinculado para exportar." };
    }
    const exportPayload = await exportSubjectData(userId);
    await prisma.auditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        action: type === "PORTABILIDAD" ? "PRIVACY_EXPORT" : "PRIVACY_ACCESS",
        resourceType: "PrivacyRequest",
        resourceId: requestId,
        outcome: "SUCCESS",
        metadata: { formatVersion: 2 },
      },
    });
    return {
      ok: true,
      summary: "Exportacion de datos personales generada.",
      exportPayload: {
        exportedAt: new Date().toISOString(),
        formatVersion: 2,
        data: exportPayload,
      },
    };
  }

  if (type === "BLOQUEO") {
    if (!userId) return { ok: false, summary: "Se requiere usuario vinculado." };
    await prisma.user.update({
      where: { id: userId },
      data: {
        processingBlockedAt: new Date(),
        isActive: false,
      },
    });
    await prisma.auditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        action: "PRIVACY_BLOCK",
        resourceType: "User",
        resourceId: userId,
        outcome: "SUCCESS",
        metadata: { requestId },
      },
    });
    return {
      ok: true,
      summary:
        "Tratamiento no esencial bloqueado (cuenta desactivada y processingBlockedAt fijado). Plazo de atencion de bloqueo documentado: 2 dias habiles.",
    };
  }

  if (type === "SUPRESION") {
    if (!userId) return { ok: false, summary: "Se requiere usuario vinculado." };
    const retainedReasons = retainReasonsForSuppression();
    await prisma.$transaction(async (tx) => {
      await anonymizeSubject(tx, userId);
      await tx.auditLog.create({
        data: {
          actorUserId: actorUserId ?? null,
          action: "PRIVACY_ERASURE",
          resourceType: "User",
          resourceId: userId,
          outcome: "SUCCESS",
          metadata: { requestId, retainedReasons },
        },
      });
    });
    return {
      ok: true,
      summary:
        "PII anonimizada. Se conservan registros contables/competitivos estructurales segun matriz de retencion.",
      retainedReasons,
    };
  }

  if (type === "RECTIFICACION") {
    if (!userId) return { ok: false, summary: "Se requiere usuario vinculado." };
    const result = await prisma.$transaction(async (tx) => {
      const rect = await applyRectification(tx, userId, detail);
      if (rect.ok) {
        await tx.auditLog.create({
          data: {
            actorUserId: actorUserId ?? null,
            action: "PRIVACY_RECTIFICATION",
            resourceType: "User",
            resourceId: userId,
            outcome: "SUCCESS",
            metadata: { requestId },
          },
        });
      }
      return rect;
    });
    return result;
  }

  if (type === "REVOCACION" || type === "OPOSICION") {
    if (!userId) {
      return {
        ok: false,
        summary: "Vincular usuario verificado para aplicar revocacion/oposicion.",
      };
    }
    const scope = parseOppositionScope(detail);
    await prisma.$transaction(async (tx) => {
      if (scope === "COOKIES") {
        await revokeCookieConsent(tx, userId);
      } else if (scope === "NON_ESSENTIAL") {
        await revokeMarketing(tx, userId);
        await revokeCookieConsent(tx, userId);
      } else {
        await revokeMarketing(tx, userId);
      }
      await tx.auditLog.create({
        data: {
          actorUserId: actorUserId ?? null,
          action:
            scope === "COOKIES"
              ? "PRIVACY_COOKIE_REVOKE"
              : scope === "NON_ESSENTIAL"
                ? "PRIVACY_NON_ESSENTIAL_OPPOSE"
                : "PRIVACY_MARKETING_REVOKE",
          resourceType: "User",
          resourceId: userId,
          outcome: "SUCCESS",
          metadata: { requestId, type, scope },
        },
      });
    });
    const summary =
      scope === "COOKIES"
        ? "Oposicion a cookies y contenidos de terceros aplicada."
        : scope === "NON_ESSENTIAL"
          ? "Oposicion a tratamientos no esenciales aplicada (marketing y cookies). La cuenta contractual sigue activa."
          : "Oposicion/revocacion de comunicaciones comerciales aplicada.";
    return { ok: true, summary };
  }

  return { ok: false, summary: `Tipo de derecho no soportado: ${type}` };
}

export { exportSubjectData };
