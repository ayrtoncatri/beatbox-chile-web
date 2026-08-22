import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { sendPrivacyRequestReceivedEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getRequestMetadata } from "@/lib/privacy";

const rightsSchema = z.object({
  right: z.enum([
    "ACCESO",
    "RECTIFICACION",
    "SUPRESION",
    "OPOSICION",
    "PORTABILIDAD",
    "BLOQUEO",
    "REVOCACION",
  ]),
  detail: z.string().min(10).max(4000),
  name: z.string().max(120).optional(),
  email: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = rightsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Solicitud invalida" },
        { status: 400 },
      );
    }

    const session = await getServerSession(authOptions);
    const { right, detail, name, email } = parsed.data;
  const receivedAt = new Date();
  const deadlineAt = new Date(receivedAt);
  deadlineAt.setDate(deadlineAt.getDate() + 30);
  const requestMetadata = getRequestMetadata(req);

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true },
      });

      if (!user) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
      }

      const ticket = await prisma.privacyRequest.create({
        data: {
          userId: user.id,
          email: user.email,
          name: name?.trim() || null,
          type: right,
          status: "IN_PROGRESS",
          detail,
          receivedAt,
          deadlineAt,
          ...requestMetadata,
        },
        select: {
          id: true,
          type: true,
          status: true,
          receivedAt: true,
          deadlineAt: true,
        },
      });

      void sendPrivacyRequestReceivedEmail({
        email: user.email,
        requestId: ticket.id,
        right,
        deadlineAt,
      });

      return NextResponse.json(
        {
          ok: true,
          ticket,
          legalDeadline: "30 dias corridos (prorroga unica por 30 dias)",
        },
        { status: 201 },
      );
    }

    if (!name || !email) {
      return NextResponse.json(
        { error: "Para solicitudes sin sesion, name y email son obligatorios" },
        { status: 400 },
      );
    }

    const ticket = await prisma.privacyRequest.create({
      data: {
        name: name.trim(),
        email,
        type: right,
        status: "IDENTITY_PENDING",
        detail,
        receivedAt,
        deadlineAt,
        ...requestMetadata,
      },
      select: {
        id: true,
        type: true,
        status: true,
        receivedAt: true,
        deadlineAt: true,
      },
    });

    void sendPrivacyRequestReceivedEmail({
      email,
      requestId: ticket.id,
      right,
      deadlineAt,
    });

    return NextResponse.json(
      {
        ok: true,
        ticket,
        legalDeadline: "30 dias corridos (prorroga unica por 30 dias)",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Privacy rights request error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const requests = await prisma.privacyRequest.findMany({
    where: {
      userId: user.id,
    },
    orderBy: { receivedAt: "desc" },
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

  return NextResponse.json({ ok: true, requests });
}
