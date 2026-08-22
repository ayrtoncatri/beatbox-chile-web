import { prisma } from "@/lib/prisma";

const PENDING_MFA_ENROLLMENT_HOURS = 24;
const USED_RECOVERY_CODE_DAYS = 30;
/** Mensajes de contacto sin usuario, mas antiguos que este plazo, se anonimizan. */
const ORPHAN_MENSAJE_DAYS = 365;
/** Sugerencias cerradas (resuelto/descartado) mas antiguas: se anonimiza PII del mensaje. */
const CLOSED_SUGERENCIA_DAYS = 730;
/** AuditLog: retencion operativa 2 anos (evidencia de cumplimiento). */
const AUDIT_LOG_DAYS = 730;

type RetentionResult = {
  expiredPasswordResetTokens: number;
  abandonedMfaEnrollments: number;
  expiredMfaRecoveryCodes: number;
  anonymizedOrphanMensajes: number;
  anonymizedClosedSugerencias: number;
  purgedAuditLogs: number;
};

export async function runDataRetention(now = new Date()): Promise<RetentionResult> {
  const run = await prisma.dataRetentionRun.create({
    data: { status: "RUNNING" },
    select: { id: true },
  });

  try {
    const pendingMfaCutoff = new Date(
      now.getTime() - PENDING_MFA_ENROLLMENT_HOURS * 60 * 60 * 1000,
    );
    const usedRecoveryCodeCutoff = new Date(
      now.getTime() - USED_RECOVERY_CODE_DAYS * 24 * 60 * 60 * 1000,
    );
    const orphanMensajeCutoff = new Date(
      now.getTime() - ORPHAN_MENSAJE_DAYS * 24 * 60 * 60 * 1000,
    );
    const closedSugerenciaCutoff = new Date(
      now.getTime() - CLOSED_SUGERENCIA_DAYS * 24 * 60 * 60 * 1000,
    );
    const auditLogCutoff = new Date(
      now.getTime() - AUDIT_LOG_DAYS * 24 * 60 * 60 * 1000,
    );

    const abandonedEnrollments = await prisma.user.findMany({
      where: {
        totpEnabled: false,
        totpSecretEncrypted: { not: null },
        totpConfirmedAt: null,
        updatedAt: { lt: pendingMfaCutoff },
      },
      select: { id: true },
    });
    const abandonedUserIds = abandonedEnrollments.map((user) => user.id);

    const [passwordResetTokens, mfaRecoveryCodes] = await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({
        where: { expiresAt: { lt: now } },
      }),
      prisma.mfaRecoveryCode.deleteMany({
        where: {
          usedAt: { lt: usedRecoveryCodeCutoff },
        },
      }),
      ...(abandonedUserIds.length > 0
        ? [
            prisma.mfaRecoveryCode.deleteMany({
              where: { userId: { in: abandonedUserIds } },
            }),
            prisma.user.updateMany({
              where: { id: { in: abandonedUserIds } },
              data: { totpSecretEncrypted: null },
            }),
          ]
        : []),
    ]);

    const orphanMensajes = await prisma.mensaje.updateMany({
      where: {
        userId: null,
        createdAt: { lt: orphanMensajeCutoff },
        NOT: { email: "anonimizado@invalid.local" },
      },
      data: {
        nombre: "ANONIMIZADO",
        email: "anonimizado@invalid.local",
        mensaje: "[contenido anonimizado por retencion]",
      },
    });

    const closedSugerencias = await prisma.sugerencia.updateMany({
      where: {
        updatedAt: { lt: closedSugerenciaCutoff },
        estado: { in: ["resuelta", "descartada"] },
        NOT: { mensaje: "[contenido anonimizado por retencion]" },
      },
      data: {
        nombre: null,
        email: null,
        asunto: null,
        mensaje: "[contenido anonimizado por retencion]",
        notaPrivada: null,
      },
    });

    const purgedAuditLogs = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: auditLogCutoff } },
    });

    const result: RetentionResult = {
      expiredPasswordResetTokens: passwordResetTokens.count,
      abandonedMfaEnrollments: abandonedUserIds.length,
      expiredMfaRecoveryCodes: mfaRecoveryCodes.count,
      anonymizedOrphanMensajes: orphanMensajes.count,
      anonymizedClosedSugerencias: closedSugerencias.count,
      purgedAuditLogs: purgedAuditLogs.count,
    };

    await prisma.dataRetentionRun.update({
      where: { id: run.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        result,
      },
    });
    await prisma.auditLog.create({
      data: {
        action: "DATA_RETENTION_COMPLETED",
        resourceType: "DataRetentionRun",
        resourceId: run.id,
        outcome: "SUCCESS",
        metadata: result,
      },
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    await prisma.dataRetentionRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        error: errorMessage,
      },
    });
    await prisma.auditLog.create({
      data: {
        action: "DATA_RETENTION_FAILED",
        resourceType: "DataRetentionRun",
        resourceId: run.id,
        outcome: "FAILURE",
        metadata: { error: errorMessage },
      },
    });
    throw error;
  }
}
