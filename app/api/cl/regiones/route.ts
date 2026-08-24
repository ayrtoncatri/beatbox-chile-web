import { NextResponse } from "next/server";
import { getAllRegionesStatic } from "@/lib/cl-geo-static";
import type { DPARegion } from "@/lib/cl-geo";

const HTTPS = "https://apis.digital.gob.cl/dpa/regiones";

export async function GET() {
  // 1) HTTPS
  try {
    const res = await fetch(HTTPS, { cache: "no-store" });
    if (!res.ok) throw new Error("https_bad_status");
    const data: DPARegion[] = await res.json();
    data.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), "es"));
    return NextResponse.json({ ok: true, regiones: data, source: "dpa_https" }, { status: 200 });
  } catch {
    // 2) Fallback Local (backup completo)
    const data = getAllRegionesStatic();
    return NextResponse.json({ ok: true, regiones: data, source: "static_backup" }, { status: 200 });
  }
}
