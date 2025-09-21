import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://apis.digital.gob.cl/dpa/regiones", { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ ok: false, error: "DPA error" }, { status: 502 });
    const data = await res.json();
    data.sort((a: any, b: any) => String(a.nombre).localeCompare(String(b.nombre), "es"));
    return NextResponse.json({ ok: true, regiones: data }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Proxy error" }, { status: 500 });
  }
}
