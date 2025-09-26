import { NextResponse } from "next/server";
import { getAllRegionesStatic } from "@/lib/cl-geo-static";

const HTTPS = "https://apis.digital.gob.cl/dpa/regiones";

export async function GET() {
  // 1) HTTPS
  try {
    const res = await fetch(HTTPS, { cache: "no-store" });
    if (!res.ok) throw new Error("https_bad_status");
    const data = await res.json();
    data.sort((a: any, b: any) => String(a.nombre).localeCompare(String(b.nombre), "es"));
    return NextResponse.json({ ok: true, regiones: data, source: "dpa_https" }, { status: 200 });
  } catch {
    // 2) Fallback Local (backup completo)
    const data = getAllRegionesStatic();
    return NextResponse.json({ ok: true, regiones: data, source: "static_backup" }, { status: 200 });
  }
}
