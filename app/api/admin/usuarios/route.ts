import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminApi } from "@/lib/permissions";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const guard = await ensureAdminApi();
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const status = searchParams.get("status") || "all";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const skip = (page - 1) * pageSize;

  const where: Prisma.UserWhereInput = {};

  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" as const } },
      { nombres: { contains: q, mode: "insensitive" as const } },
      { apellidoPaterno: { contains: q, mode: "insensitive" as const } },
      { apellidoMaterno: { contains: q, mode: "insensitive" as const } },
    ];
  }

  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
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
      orderBy: { id: "asc" },
      skip,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    data: users,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}