import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcrypt";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { verify } from "otplib";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { createMfaSessionValue, decryptMfaSecret, mfaCookie } from "@/lib/mfa";
import { prisma } from "@/lib/prisma";
import { getRequestMetadata } from "@/lib/privacy";

const challengeSchema = z.object({
  code: z.string().trim().min(6).max(32),
});

const limiter = new RateLimiterMemory({
  points: 5,
  duration: 5 * 60,
});

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = challengeSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Codigo MFA invalido" }, { status: 400 });
  }

  const rateLimitKey = `${session.user.id}:${getClientIp(req)}`;
  try {
    await limiter.consume(rateLimitKey);
  } catch {
    return NextResponse.json(
      { error: "Demasiados intentos. Intenta nuevamente en unos minutos." },
      { status: 429 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        totpEnabled: true,
        totpSecretEncrypted: true,
        mfaRecoveryCodes: {
          where: { usedAt: null },
          select: { id: true, codeHash: true },
        },
      },
    });

    if (!user?.totpEnabled || !user.totpSecretEncrypted) {
      return NextResponse.json({ error: "MFA no esta habilitado" }, { status: 409 });
    }

    let valid = false;
    let recoveryCodeId: string | undefined;

    if (/^\d{6}$/.test(parsed.data.code)) {
      const result = await verify({
        secret: decryptMfaSecret(user.totpSecretEncrypted),
        token: parsed.data.code,
        epochTolerance: 30,
      });
      valid = result.valid;
    } else {
      for (const recoveryCode of user.mfaRecoveryCodes) {
        if (await bcrypt.compare(parsed.data.code.toUpperCase(), recoveryCode.codeHash)) {
          valid = true;
          recoveryCodeId = recoveryCode.id;
          break;
        }
      }
    }

    if (!valid) {
      return NextResponse.json({ error: "Codigo MFA incorrecto" }, { status: 400 });
    }

    await prisma.$transaction(async (transaction) => {
      if (recoveryCodeId) {
        await transaction.mfaRecoveryCode.update({
          where: { id: recoveryCodeId },
          data: { usedAt: new Date() },
        });
      }
      await transaction.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "MFA_CHALLENGE_PASSED",
          resourceType: "User",
          resourceId: user.id,
          outcome: "SUCCESS",
          metadata: { method: recoveryCodeId ? "recovery_code" : "totp" },
          ...getRequestMetadata(req),
        },
      });
    });

    const { value, expiresAt } = createMfaSessionValue(user.id);
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: mfaCookie.name,
      value,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
      maxAge: mfaCookie.maxAge,
    });

    return response;
  } catch (error) {
    console.error("MFA challenge error:", error);
    return NextResponse.json({ error: "No fue posible verificar MFA" }, { status: 500 });
  }
}
