import { NextResponse, type NextRequest } from "next/server";
import { getComunasByRegionCodigoStatic } from "@/lib/cl-geo-static";
import type { DPAComuna } from "@/lib/cl-geo";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await ctx.params;
  if (!codigo) return NextResponse.json({ ok: false, error: "Código requerido" }, { status: 400 });

  const HTTPS = `https://apis.digital.gob.cl/dpa/regiones/${encodeURIComponent(codigo)}/comunas`;

  // 1) HTTPS
  try {
    const res = await fetch(HTTPS, { cache: "no-store" });
    if (!res.ok) throw new Error("https_bad_status");
    const data: DPAComuna[] = await res.json();
    data.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), "es"));
    return NextResponse.json({ ok: true, comunas: data, source: "dpa_https" }, { status: 200 });
  } catch {
    // 2) Fallback Local (backup completo)
    const data = getComunasByRegionCodigoStatic(codigo);
    return NextResponse.json({ ok: true, comunas: data, source: "static_backup" }, { status: 200 });
  }
}
