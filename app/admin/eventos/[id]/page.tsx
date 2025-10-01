import { prisma } from "@/lib/prisma";
import EventForm from "@/components/admin/eventos/EventForm";
import { notFound } from "next/navigation";

export default async function AdminEditEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const evento = await prisma.evento.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      fecha: true,
      lugar: true,
      ciudad: true,
      direccion: true,
      descripcion: true,
      tipo: true,
      reglas: true,
      imagen: true, // Agregué este campo que faltaba
      isPublished: true,
      isTicketed: true,
    },
  });

  if (!evento) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-2 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Editar evento</h1>
        <EventForm evento={evento} />
      </div>
    </main>
  );
}