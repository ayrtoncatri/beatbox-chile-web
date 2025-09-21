import { prisma } from "@/lib/prisma";
import ReviewButtons from "@/components/admin/wildcards/ReviewButtons";
import WildcardEditForm from "@/components/admin/wildcards/WildcardEditForm";
import Link from "next/link";

function toYouTubeEmbed(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === "youtu.be") {
      const v = u.pathname.slice(1);
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
  } catch {}
  return null;
}

export default async function WildcardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const w = await prisma.wildcard.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, email: true, nombres: true, apellidoPaterno: true, apellidoMaterno: true },
      },
      reviewedBy: { select: { id: true, email: true, nombres: true } },
    },
  });

  if (!w) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">Wildcard no encontrado.</div>
        <Link href="/admin/wildcards" className="text-blue-600 underline text-sm">← Volver</Link>
      </div>
    );
  }

  const nombreUsuario = [w.user?.nombres, w.user?.apellidoPaterno, w.user?.apellidoMaterno]
    .filter(Boolean)
    .join(" ");
  const embed = toYouTubeEmbed(w.youtubeUrl);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Wildcard</h2>
          <div className="text-sm text-gray-600">ID: {w.id}</div>
        </div>
        <Link href="/admin/wildcards" className="text-sm text-blue-600 hover:underline">← Volver</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded border bg-white p-4">
            <h3 className="font-medium mb-4">Editar wildcard</h3>
            <WildcardEditForm
              item={{
                id: w.id,
                nombreArtistico: w.nombreArtistico,
                notes: w.notes,
                youtubeUrl: w.youtubeUrl,
                status: w.status as any,
              }}
            />
          </div>

          <div className="rounded border bg-white p-4">
            <h3 className="font-medium mb-4">Video</h3>
            {embed ? (
              <div className="aspect-video">
                <iframe
                  className="w-full h-full rounded"
                  src={embed}
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                {w.youtubeUrl ? (
                  <>
                    URL no reconocida para embeber.{" "}
                    <a href={w.youtubeUrl} className="text-blue-600 underline" target="_blank">
                      Abrir enlace
                    </a>
                  </>
                ) : (
                  "Sin URL de YouTube."
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded border bg-white p-4">
            <h3 className="font-medium mb-4">Resumen</h3>
            <div className="text-sm space-y-2">
              <div><span className="text-gray-500">Usuario:</span> {nombreUsuario || "—"} <span className="text-gray-400">({w.user?.email || "—"})</span></div>
              <div><span className="text-gray-500">Alias:</span> {w.nombreArtistico || "—"}</div>
              <div>
                <span className="text-gray-500">Estado:</span>{" "}
                <span className={
                  w.status === "APPROVED" ? "text-green-700" : w.status === "REJECTED" ? "text-red-700" : "text-yellow-700"
                }>
                  {w.status}
                </span>
              </div>
              <div><span className="text-gray-500">Revisado por:</span> {w.reviewedBy?.nombres || w.reviewedBy?.email || "—"}</div>
              <div><span className="text-gray-500">Fecha revisión:</span> {w.reviewedAt ? new Date(w.reviewedAt).toLocaleString() : "—"}</div>
            </div>
            <div className="mt-4">
              <ReviewButtons id={w.id} status={w.status as any} />
            </div>
          </div>

          <div className="rounded border bg-white p-4">
            <h3 className="font-medium mb-2">Notas</h3>
            <div className="text-sm whitespace-pre-wrap text-gray-700">{w.notes || "Sin notas."}</div>
          </div>
        </div>
      </div>
    </div>
  );
}