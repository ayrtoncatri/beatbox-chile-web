import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PublicacionForm from "@/components/admin/publicaciones/PublicacionForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPublicacionPage({ params }: Props) {
  const { id } = await params;

  const publicacion = await prisma.publicacion.findUnique({
    where: { id },
  });

  if (!publicacion) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-white">Editar publicacion</h1>
        <PublicacionForm publicacion={publicacion} mode="edit" />
      </div>
    </div>
  );
}
