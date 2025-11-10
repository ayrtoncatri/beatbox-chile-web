import { prisma } from "@/lib/prisma";
import ReviewButtons from "@/components/admin/wildcards/ReviewButtons";
import WildcardEditForm from "@/components/admin/wildcards/WildcardEditForm";
import Link from "next/link";
import { UserIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
import { WildcardVideoPlayer } from "@/components/admin/wildcards/WildcardVideoPlayer";

function getYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;
    }
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1); // Quita el '/' inicial
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
        select: {
          id: true,
          email: true,
          profile: {
            select: { nombres: true, apellidoPaterno: true, apellidoMaterno: true },
          },
        },
      },
      reviewedBy: {
        // CAMBIO: Seleccionamos el perfil anidado
        select: {
          id: true,
          email: true,
          profile: {
            select: { nombres: true, apellidoPaterno: true },
          },
        },
      },
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

  const nombreUsuario = [w.user?.profile?.nombres, w.user?.profile?.apellidoPaterno, w.user?.profile?.apellidoMaterno]
    .filter(Boolean)
    .join(" ");
  
  // CAMBIO: Creamos una variable para el nombre del revisor
  const nombreRevisor = [w.reviewedBy?.profile?.nombres, w.reviewedBy?.profile?.apellidoPaterno]
    .filter(Boolean)
    .join(" ");

  const videoId = getYouTubeVideoId(w.youtubeUrl);

  return (
    <div className="min-h-screen py-8 px-2 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Wildcard</h2>
            <div className="text-sm text-blue-300/70">ID: {w.id}</div>
          </div>
          <Link href="/admin/wildcards" className="btn btn-outline btn-sm text-blue-200 border-blue-700/50 hover:bg-blue-800/50">
            ← Volver
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-blue-700/30 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg p-8 shadow-lg">
              <h3 className="font-semibold mb-4 text-lg text-white">Editar wildcard</h3>
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

            <div className="rounded-2xl border border-blue-700/30 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg p-8 shadow-lg">
              <h3 className="font-semibold mb-4 text-lg text-white">Video</h3>
              {videoId ? (
                <WildcardVideoPlayer
                  videoId={videoId}
                  title={`Wildcard de ${w.nombreArtistico || nombreUsuario}`}
                />
              ) : (
                <div className="text-sm text-blue-300/70">
                  {w.youtubeUrl ? (
                    <>
                      URL no reconocida para embeber.{" "}
                      <a href={w.youtubeUrl} className="text-blue-400 underline hover:text-blue-300" target="_blank">
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
            <div className="rounded-2xl border border-blue-700/30 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg p-8 shadow-lg flex flex-col gap-4">
              <h3 className="font-semibold mb-2 text-lg text-white">Resumen</h3>
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-300 font-bold border-2 border-blue-500/50 shadow">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <span>
                    <span className="text-blue-100">{nombreUsuario || "—"}</span>
                    <span className="text-blue-300/70"> ({w.user?.email || "—"})</span>
                  </span>
                </div>
                <div className="text-blue-100"><span className="text-blue-300/70">Alias:</span> {w.nombreArtistico || "—"}</div>
                <div>
                  <span className="text-blue-300/70">Estado:</span>{" "}
                  <span className={
                    w.status === "APPROVED"
                      ? "bg-green-900/50 text-green-300 border border-green-700/30 px-2 py-0.5 rounded-full text-xs font-semibold"
                      : w.status === "REJECTED"
                      ? "bg-red-900/50 text-red-300 border border-red-700/30 px-2 py-0.5 rounded-full text-xs font-semibold"
                      : "bg-yellow-900/50 text-yellow-300 border border-yellow-700/30 px-2 py-0.5 rounded-full text-xs font-semibold"
                  }>
                    {w.status}
                  </span>
                </div>
                {w.status === "APPROVED" && (
                  <div>
                    <span className="text-blue-300/70">Inscripción:</span>{" "}
                    {w.isClassified ? (
                      <span className="inline-flex items-center gap-1 text-green-300 font-semibold text-xs px-2 py-0.5 bg-green-900/50 border border-green-700/30 rounded-full">
                        <CheckBadgeIcon className="w-4 h-4" />
                        Clasificado
                      </span>
                    ) : (
                      <span className="text-yellow-300 font-semibold text-xs px-2 py-0.5 bg-yellow-900/50 border border-yellow-700/30 rounded-full">
                        Pendiente
                      </span>
                    )}
                  </div>
                )}
                <div className="text-blue-100"><span className="text-blue-300/70">Revisado por:</span> {nombreRevisor || w.reviewedBy?.email || "—"}</div>
                <div className="text-blue-100"><span className="text-blue-300/70">Fecha revisión:</span> {w.reviewedAt ? new Date(w.reviewedAt).toLocaleString() : "—"}</div>
              </div>
              <div className="pt-2 w-full">
                <ReviewButtons id={w.id} status={w.status as any} isClassified={w.isClassified} />
              </div>
            </div>

            <div className="rounded-2xl border border-blue-700/30 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg p-8 shadow-lg">
              <h3 className="font-semibold mb-2 text-lg text-white">Notas</h3>
              <div className="text-sm whitespace-pre-wrap text-blue-200">{w.notes || "Sin notas."}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}