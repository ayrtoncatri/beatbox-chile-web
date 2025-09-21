export type DPARegion = { codigo: string; nombre: string; [k: string]: any };
export type DPAComuna  = { codigo: string; nombre: string; [k: string]: any };

export async function fetchRegiones(): Promise<DPARegion[]> {
  const res = await fetch("/api/cl/regiones", { cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.ok) throw new Error("fail");
  return (json.regiones as DPARegion[]) ?? [];
}

export async function fetchComunasByRegionCode(codigoRegion: string): Promise<DPAComuna[]> {
  if (!codigoRegion) return [];
  const res = await fetch(`/api/cl/comunas/${encodeURIComponent(codigoRegion)}`, { cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.ok) throw new Error("fail");
  return (json.comunas as DPAComuna[]) ?? [];
}

export function normalize(s: string) {
  return s.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}
