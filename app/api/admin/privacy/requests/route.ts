import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const statuses = new Set([
  "RECEIVED",
  "IDENTITY_PENDING",
  "IN_PROGRESS",
  "EXTENDED",
  "COMPLETED",
  "REJECTED",
]);

export async function GET(req: Request) {
  const authorizationError = await ensureAdminApi();
  if (authorizationError) return authorizationError;

  const { searchParams } = new URL(req.url);
  const requestedStatus = searchParams.get("status");
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const requestedPageSize = Number(searchParams.get("pageSize") || 20);
  const pageSize = Math.min(100, Math.max(1, Number.isNaN(requestedPageSize) ? 20 : requestedPageSize));
  const status = requestedStatus && statuses.has(requestedStatus) ? requestedStatus : undefined;

  const where = status ? { status } : undefined;
  const [total, requests] = await Promise.all([
    prisma.privacyRequest.count({ where }),
    prisma.privacyRequest.findMany({
      where,
      orderBy: { receivedAt: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        email: true,
        name: true,
        type: true,
        status: true,
        receivedAt: true,
        deadlineAt: true,
        extendedUntil: true,
        completedAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    requests,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}
