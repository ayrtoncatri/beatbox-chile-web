import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRequestMetadata } from "@/lib/privacy";
import { exportSubjectData } from "@/lib/privacy/fulfill-request";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, anonymizedAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  if (user.anonymizedAt) {
    return NextResponse.json(
      { error: "La cuenta fue anonimizada; no hay datos personales exportables." },
      { status: 410 },
    );
  }

  const data = await exportSubjectData(user.id);

  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "PRIVACY_EXPORT",
        resourceType: "User",
        resourceId: user.id,
        outcome: "SUCCESS",
        metadata: { formatVersion: 2 },
        ...getRequestMetadata(req),
      },
    });
  } catch (error) {
    console.error("Privacy export audit log error:", error);
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    formatVersion: 2,
    data,
  };

  return NextResponse.json(payload, {
    headers: {
      "Content-Disposition": `attachment; filename=datos-personales-${user.id}.json`,
      "Cache-Control": "no-store",
    },
  });
}
