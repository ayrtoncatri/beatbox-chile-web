import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcrypt";
import QRCode from "qrcode";
import { generateSecret, generateURI } from "otplib";

import { authOptions } from "@/lib/auth";
import { encryptMfaSecret, generateRecoveryCodes } from "@/lib/mfa";
import { prisma } from "@/lib/prisma";
import { getRequestMetadata } from "@/lib/privacy";

function isPrivileged(roles: string[]): boolean {
  return roles.includes("admin") || roles.includes("judge");
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!isPrivileged(roles)) {
    return NextResponse.json({ error: "MFA solo es requerido para roles privilegiados" }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, totpEnabled: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (user.totpEnabled) {
      return NextResponse.json({ error: "MFA ya esta habilitado" }, { status: 409 });
    }

    const secret = generateSecret();
    const recoveryCodes = generateRecoveryCodes();
    const recoveryCodeHashes = await Promise.all(
      recoveryCodes.map((code) => bcrypt.hash(code, 12)),
    );
    const otpAuthUrl = generateURI({
      issuer: "Beatbox Chile",
      label: user.email,
      secret,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 256,
    });

    await prisma.$transaction(async (transaction) => {
      await transaction.mfaRecoveryCode.deleteMany({ where: { userId: user.id } });
      await transaction.user.update({
        where: { id: user.id },
        data: {
          totpSecretEncrypted: encryptMfaSecret(secret),
          totpEnabled: false,
          totpConfirmedAt: null,
        },
      });
      await transaction.mfaRecoveryCode.createMany({
        data: recoveryCodeHashes.map((codeHash) => ({
          userId: user.id,
          codeHash,
        })),
      });
      await transaction.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "MFA_ENROLLMENT_STARTED",
          resourceType: "User",
          resourceId: user.id,
          outcome: "SUCCESS",
          metadata: { recoveryCodesIssued: recoveryCodes.length },
          ...getRequestMetadata(req),
        },
      });
    });

    return NextResponse.json({
      qrCodeDataUrl,
      recoveryCodes,
    });
  } catch (error) {
    console.error("MFA setup error:", error);
    return NextResponse.json(
      { error: "No fue posible preparar MFA. Revisa la configuracion del servidor." },
      { status: 500 },
    );
  }
}
