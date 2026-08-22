import { prisma } from "@/lib/prisma";

const PENDING_MFA_ENROLLMENT_HOURS = 24;
const USED_RECOVERY_CODE_DAYS = 30;

type RetentionResult = {
  expiredPasswordResetTokens: number;
  abandonedMfaEnrollments: number;
  expiredMfaRecoveryCodes: number;
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

    const result: RetentionResult = {
      expiredPasswordResetTokens: passwordResetTokens.count,
      abandonedMfaEnrollments: abandonedUserIds.length,
      expiredMfaRecoveryCodes: mfaRecoveryCodes.count,
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
