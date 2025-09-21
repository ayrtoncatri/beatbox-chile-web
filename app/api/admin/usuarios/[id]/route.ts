import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminApi } from "@/lib/permissions";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function getIdFromRequest(req: NextRequest) {
  const segments = req.nextUrl.pathname.split("/");
  return segments[segments.length - 1];
}

export async function GET(req: NextRequest) {
  const guard = await ensureAdminApi();
  if (guard) return guard;

  const id = getIdFromRequest(req);

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      nombres: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      role: true,
      image: true,
      isActive: true,
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: user });
}

const updateSchema = z.object({
  nombres: z.string().trim().min(1).max(100).optional().nullable(),
  apellidoPaterno: z.string().trim().min(1).max(100).optional().nullable(),
  apellidoMaterno: z.string().trim().min(1).max(100).optional().nullable(),
  role: z.enum(["user", "admin"]).optional(),
  image: z.string().url().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const guard = await ensureAdminApi();
  if (guard) return guard;

  const id = getIdFromRequest(req);

  const session = await getServerSession(authOptions);
  const actorId = (session?.user as any)?.id as string | undefined;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  if ("isActive" in data && data.isActive === false && actorId && actorId === id) {
    return NextResponse.json({ error: "No puedes desactivar tu propia cuenta." }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...("nombres" in data ? { nombres: data.nombres } : {}),
        ...("apellidoPaterno" in data ? { apellidoPaterno: data.apellidoPaterno } : {}),
        ...("apellidoMaterno" in data ? { apellidoMaterno: data.apellidoMaterno } : {}),
        ...("image" in data ? { image: data.image } : {}),
        ...("role" in data ? { role: data.role } : {}),
        ...("isActive" in data ? { isActive: data.isActive } : {}),
      },
      select: {
        id: true,
        email: true,
        nombres: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        role: true,
        image: true,
        isActive: true,
      },
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}