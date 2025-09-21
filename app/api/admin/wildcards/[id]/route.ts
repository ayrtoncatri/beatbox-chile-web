import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminApi } from "@/lib/permissions";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

const updateSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  nombreArtistico: z.string().trim().min(1).max(100).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  youtubeUrl: z.string().url().max(500).optional().nullable(),
});

function getIdFromRequest(req: NextRequest) {
  const segments = req.nextUrl.pathname.split("/");
  return segments[segments.length - 1];
}

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

  const updateData: Prisma.WildcardUpdateInput = {};

  if ("status" in data) updateData.status = data.status!;
  if ("nombreArtistico" in data) updateData.nombreArtistico = data.nombreArtistico as any;
  if ("notes" in data) updateData.notes = data.notes as any;
  if ("youtubeUrl" in data) updateData.youtubeUrl = data.youtubeUrl as any;

  if ("status" in data) {
    if (data.status === "PENDING") {
      updateData.reviewedAt = null;
      updateData.reviewedBy = { disconnect: true };
    } else {
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = actorId ? { connect: { id: actorId } } : { disconnect: true };
    }
  }

  try {
    const updated = await prisma.wildcard.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, email: true, nombres: true } },
        reviewedBy: { select: { id: true, email: true, nombres: true } },
      },
    });
    return NextResponse.json({ data: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}