import { NextResponse, type NextRequest } from "next/server";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await ctx.params; // 👈 importante: await

  if (!codigo) {
    return NextResponse.json({ ok: false, error: "Código requerido" }, { status: 400 });
  }

  try {
    const url = `https://apis.digital.gob.cl/dpa/regiones/${encodeURIComponent(codigo)}/comunas`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "DPA error" }, { status: 502 });
    }
    const data = await res.json();
    data.sort((a: any, b: any) => String(a.nombre).localeCompare(String(b.nombre), "es"));
    return NextResponse.json({ ok: true, comunas: data }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Proxy error" }, { status: 500 });
  }
}
