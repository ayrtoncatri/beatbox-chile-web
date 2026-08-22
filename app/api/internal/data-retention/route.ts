import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { runDataRetention } from "@/lib/data-retention";

export const runtime = "nodejs";

function hasValidCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization");
  if (!secret || !authorization?.startsWith("Bearer ")) return false;

  const received = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(secret);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function POST(req: NextRequest) {
  if (!hasValidCronSecret(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await runDataRetention();
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Data retention run failed:", error);
    return NextResponse.json({ error: "Error al ejecutar retencion" }, { status: 500 });
  }
}
