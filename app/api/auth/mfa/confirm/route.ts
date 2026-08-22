import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { verify } from "otplib";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { createMfaSessionValue, decryptMfaSecret, mfaCookie } from "@/lib/mfa";
import { prisma } from "@/lib/prisma";
import { getRequestMetadata } from "@/lib/privacy";

const confirmationSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!roles.includes("admin") && !roles.includes("judge")) {
    return NextResponse.json({ error: "MFA no requerido para este usuario" }, { status: 403 });
  }

  const parsed = confirmationSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Codigo MFA invalido" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, totpSecretEncrypted: true, totpEnabled: true },
    });

    if (!user?.totpSecretEncrypted) {
      return NextResponse.json({ error: "Debes iniciar el enrolamiento MFA primero" }, { status: 409 });
    }

    if (user.totpEnabled) {
      return NextResponse.json({ error: "MFA ya esta habilitado" }, { status: 409 });
    }

    const result = await verify({
      secret: decryptMfaSecret(user.totpSecretEncrypted),
      token: parsed.data.code,
      epochTolerance: 30,
    });

    if (!result.valid) {
      return NextResponse.json({ error: "Codigo MFA incorrecto" }, { status: 400 });
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id: user.id },
        data: {
          totpEnabled: true,
          totpConfirmedAt: new Date(),
        },
      });
      await transaction.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "MFA_ENABLED",
          resourceType: "User",
          resourceId: user.id,
          outcome: "SUCCESS",
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
    console.error("MFA confirmation error:", error);
    return NextResponse.json({ error: "No fue posible confirmar MFA" }, { status: 500 });
  }
}
