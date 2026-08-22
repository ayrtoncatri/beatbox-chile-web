import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { ensureAdminApi } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getRequestMetadata } from "@/lib/privacy";

const updateSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("IN_PROGRESS") }),
  z.object({ status: z.literal("EXTENDED") }),
  z.object({
    status: z.literal("COMPLETED"),
    resolution: z.string().trim().min(10).max(4000),
  }),
  z.object({
    status: z.literal("REJECTED"),
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
    select: { id: true, receivedAt: true, status: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }

  if (["COMPLETED", "REJECTED"].includes(existing.status)) {
    return NextResponse.json({ error: "La solicitud ya se encuentra cerrada" }, { status: 409 });
  }

  const completedAt = ["COMPLETED", "REJECTED"].includes(parsed.data.status)
    ? new Date()
    : null;
  const extendedUntil = parsed.data.status === "EXTENDED"
    ? new Date(existing.receivedAt.getTime() + 60 * 24 * 60 * 60 * 1000)
    : undefined;

  const request = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.privacyRequest.update({
      where: { id },
      data: {
        status: parsed.data.status,
        extendedUntil,
        completedAt,
        resolution: parsed.data.status === "COMPLETED" ? parsed.data.resolution : undefined,
        rejectionReason: parsed.data.status === "REJECTED" ? parsed.data.rejectionReason : undefined,
      },
      select: {
        id: true,
        type: true,
        status: true,
        receivedAt: true,
        deadlineAt: true,
        extendedUntil: true,
        completedAt: true,
      },
    });

    await transaction.auditLog.create({
      data: {
        actorUserId: session?.user?.id,
        action: "PRIVACY_REQUEST_STATUS_UPDATED",
        resourceType: "PrivacyRequest",
        resourceId: id,
        outcome: "SUCCESS",
        metadata: { from: existing.status, to: parsed.data.status },
        ...getRequestMetadata(req),
      },
    });

    return updated;
  });

  return NextResponse.json({ ok: true, request });
}
