import { prisma } from "@/lib/prisma";
import ReviewButtons from "@/components/admin/wildcards/ReviewButtons";
import WildcardEditForm from "@/components/admin/wildcards/WildcardEditForm";
import Link from "next/link";
import { UserIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";

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
      inscripcion: {
        select: { id: true }
      },
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

  const embed = toYouTubeEmbed(w.youtubeUrl);

  const isInscrito = w.inscripcion !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-2 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Wildcard</h2>
            <div className="text-sm text-gray-600">ID: {w.id}</div>
          </div>
          <Link href="/admin/wildcards" className="btn btn-outline btn-sm">
            ← Volver
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow">
              <h3 className="font-semibold mb-4 text-lg text-gray-800">Editar wildcard</h3>
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

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow">
              <h3 className="font-semibold mb-4 text-lg text-gray-800">Video</h3>
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
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow flex flex-col gap-4">
              <h3 className="font-semibold mb-2 text-lg text-gray-800">Resumen</h3>
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-400 font-bold border-2 border-indigo-200 shadow">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <span>
                    <span className="text-gray-700">{nombreUsuario || "—"}</span>
                    <span className="text-gray-400"> ({w.user?.email || "—"})</span>
                  </span>
                </div>
                <div className="text-gray-900"><span className="text-gray-500">Alias:</span> {w.nombreArtistico || "—"}</div>
                <div>
                  <span className="text-gray-500">Estado:</span>{" "}
                  <span className={
                    w.status === "APPROVED"
                      ? "bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold"
                      : w.status === "REJECTED"
                      ? "bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold"
                      : "bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-semibold"
                  }>
                    {w.status}
                  </span>
                </div>

                {w.status === "APPROVED" && (
                  <div>
                    <span className="text-gray-500">Inscripción:</span>{" "}
                    {isInscrito ? (
                      <span className="inline-flex items-center gap-1 text-green-700 font-semibold text-xs px-2 py-0.5 bg-green-100 rounded-full">
                        <CheckBadgeIcon className="w-4 h-4" />
                        Creada
                      </span>
                    ) : (
                      <span className="text-yellow-700 font-semibold text-xs px-2 py-0.5 bg-yellow-100 rounded-full">
                        Procesando...
                      </span>
                    )}
                  </div>
                )}
                <div className="text-gray-900"><span className="text-gray-500">Revisado por:</span> {nombreRevisor || w.reviewedBy?.email || "—"}</div>
                <div className="text-gray-900"><span className="text-gray-500">Fecha revisión:</span> {w.reviewedAt ? new Date(w.reviewedAt).toLocaleString() : "—"}</div>
              </div>
              <div className="pt-2 w-full">
                <ReviewButtons id={w.id} status={w.status as any} isInscrito={isInscrito} />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow">
              <h3 className="font-semibold mb-2 text-lg text-gray-800">Notas</h3>
              <div className="text-sm whitespace-pre-wrap text-gray-700">{w.notes || "Sin notas."}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}