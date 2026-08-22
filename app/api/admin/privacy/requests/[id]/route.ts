import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { sendPrivacyRequestClosedEmail } from "@/lib/email";
import { ensureAdminApi } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getRequestMetadata } from "@/lib/privacy";
import { fulfillPrivacyRequest } from "@/lib/privacy/fulfill-request";

const updateSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("VERIFY_IDENTITY"), userId: z.string().min(1) }),
  z.object({ action: z.literal("MARK_IN_PROGRESS") }),
  z.object({ action: z.literal("EXTEND") }),
  z.object({
    action: z.literal("FULFILL"),
    resolution: z.string().trim().min(10).max(4000),
  }),
  z.object({
    action: z.literal("COMPLETE"),
    resolution: z.string().trim().min(10).max(4000),
  }),
  z.object({
    action: z.literal("REJECT"),
    rejectionReason: z.string().trim().min(10).max(4000),
  }),
]);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorizationError = await ensureAdminApi();
  if (authorizationError) return authorizationError;

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Actualizacion de solicitud invalida" }, { status: 400 });
  }

  const { id } = await params;
  const session = await getServerSession(authOptions);
  const existing = await prisma.privacyRequest.findUnique({
    where: { id },
    select: {
      id: true,
      receivedAt: true,
      status: true,
      type: true,
      userId: true,
      email: true,
      detail: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }

  if (["COMPLETED", "REJECTED"].includes(existing.status)) {
    return NextResponse.json({ error: "La solicitud ya se encuentra cerrada" }, { status: 409 });
  }

  const meta = getRequestMetadata(req);
  const actorUserId = session?.user?.id;

  if (parsed.data.action === "VERIFY_IDENTITY") {
    const user = await prisma.user.findUnique({
      where: { id: parsed.data.userId },
      select: { id: true, email: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const request = await prisma.$transaction(async (tx) => {
      const updated = await tx.privacyRequest.update({
        where: { id },
        data: {
          userId: user.id,
          email: user.email,
          status: "IN_PROGRESS",
        },
      });
      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "PRIVACY_REQUEST_IDENTITY_VERIFIED",
          resourceType: "PrivacyRequest",
          resourceId: id,
          outcome: "SUCCESS",
          metadata: { userId: user.id },
          ...meta,
        },
      });
      return updated;
    });

    return NextResponse.json({ ok: true, request });
  }

  if (parsed.data.action === "MARK_IN_PROGRESS") {
    const request = await prisma.privacyRequest.update({
      where: { id },
      data: { status: "IN_PROGRESS" },
    });
    return NextResponse.json({ ok: true, request });
  }

  if (parsed.data.action === "EXTEND") {
    const extendedUntil = new Date(existing.receivedAt.getTime() + 60 * 24 * 60 * 60 * 1000);
    const request = await prisma.$transaction(async (tx) => {
      const updated = await tx.privacyRequest.update({
        where: { id },
        data: { status: "EXTENDED", extendedUntil },
      });
      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "PRIVACY_REQUEST_EXTENDED",
          resourceType: "PrivacyRequest",
          resourceId: id,
          outcome: "SUCCESS",
          metadata: { extendedUntil },
          ...meta,
        },
      });
      return updated;
    });
    return NextResponse.json({ ok: true, request });
  }

  if (parsed.data.action === "REJECT") {
    const rejectionReason = parsed.data.rejectionReason;
    const request = await prisma.$transaction(async (tx) => {
      const updated = await tx.privacyRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectionReason,
          completedAt: new Date(),
        },
      });
      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "PRIVACY_REQUEST_REJECTED",
          resourceType: "PrivacyRequest",
          resourceId: id,
          outcome: "SUCCESS",
          ...meta,
        },
      });
      return updated;
    });

    void sendPrivacyRequestClosedEmail({
      email: existing.email,
      requestId: id,
      right: existing.type,
      status: "REJECTED",
      message: rejectionReason,
    });

    return NextResponse.json({ ok: true, request });
  }

  if (parsed.data.action === "FULFILL") {
    const adminResolution = parsed.data.resolution;
    const fulfill = await fulfillPrivacyRequest({
      requestId: id,
      type: existing.type,
      userId: existing.userId,
      detail: existing.detail,
      actorUserId,
    });

    if (!fulfill.ok) {
      return NextResponse.json({ error: fulfill.summary }, { status: 422 });
    }

    const resolution = `${adminResolution}\n\nEjecucion tecnica: ${fulfill.summary}${
      fulfill.retainedReasons?.length
        ? `\nRetencion: ${fulfill.retainedReasons.join(" | ")}`
        : ""
    }`;

    const request = await prisma.privacyRequest.update({
      where: { id },
      data: {
        status: "COMPLETED",
        resolution,
        completedAt: new Date(),
      },
    });

    void sendPrivacyRequestClosedEmail({
      email: existing.email,
      requestId: id,
      right: existing.type,
      status: "COMPLETED",
      message: resolution,
    });

    return NextResponse.json({
      ok: true,
      request,
      fulfill: {
        summary: fulfill.summary,
        retainedReasons: fulfill.retainedReasons,
        exportPayload: fulfill.exportPayload,
      },
    });
  }

  if (parsed.data.action !== "COMPLETE") {
    return NextResponse.json({ error: "Accion no soportada" }, { status: 400 });
  }

  const completeResolution = parsed.data.resolution;
  // COMPLETE sin ejecucion automatica (cierre manual documentado)
  const request = await prisma.$transaction(async (tx) => {
    const updated = await tx.privacyRequest.update({
      where: { id },
      data: {
        status: "COMPLETED",
        resolution: completeResolution,
        completedAt: new Date(),
      },
    });
    await tx.auditLog.create({
      data: {
        actorUserId,
        action: "PRIVACY_REQUEST_COMPLETED",
        resourceType: "PrivacyRequest",
        resourceId: id,
        outcome: "SUCCESS",
        ...meta,
      },
    });
    return updated;
  });

  void sendPrivacyRequestClosedEmail({
    email: existing.email,
    requestId: id,
    right: existing.type,
    status: "COMPLETED",
    message: completeResolution,
  });

  return NextResponse.json({ ok: true, request });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorizationError = await ensureAdminApi();
  if (authorizationError) return authorizationError;

  const { id } = await params;
  const request = await prisma.privacyRequest.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          anonymizedAt: true,
          processingBlockedAt: true,
        },
      },
    },
  });

  if (!request) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, request });
}
