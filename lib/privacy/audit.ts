import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getHeaderMetadata } from "@/lib/privacy";

export async function writeAuditLog(params: {
  actorUserId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  outcome?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    const h = await headers();
    const meta = getHeaderMetadata(h);
    await prisma.auditLog.create({
      data: {
        actorUserId: params.actorUserId ?? null,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId ?? null,
        outcome: params.outcome ?? "SUCCESS",
        metadata: params.metadata,
        ...meta,
      },
    });
  } catch (error) {
    console.error("writeAuditLog error:", error);
  }
}
