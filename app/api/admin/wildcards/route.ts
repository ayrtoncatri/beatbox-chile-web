import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminApi } from "@/lib/permissions";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const guard = await ensureAdminApi();
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const status = (searchParams.get("status") || "all").toUpperCase(); // all|PENDING|APPROVED|REJECTED
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const skip = (page - 1) * pageSize;

  const where: Prisma.WildcardWhereInput = {};

  if (q) {
    where.OR = [
      { nombreArtistico: { contains: q, mode: "insensitive" as const } },
      { user: { email: { contains: q, mode: "insensitive" as const } } },
      { user: { nombres: { contains: q, mode: "insensitive" as const } } },
      { user: { apellidoPaterno: { contains: q, mode: "insensitive" as const } } },
      { user: { apellidoMaterno: { contains: q, mode: "insensitive" as const } } },
    ];
  }

  if (status === "PENDING" || status === "APPROVED" || status === "REJECTED") {
    where.status = status as any;
  }

  const [total, items] = await Promise.all([
    prisma.wildcard.count({ where }),
    prisma.wildcard.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nombres: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
          },
        },
        reviewedBy: {
          select: { id: true, email: true, nombres: true },
        },
      },
      orderBy: { id: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    data: items,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}