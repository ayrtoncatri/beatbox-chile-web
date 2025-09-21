import EventForm from "@/components/admin/eventos/EventForm";
import { notFound } from "next/navigation";

async function getEvento(id: string) {
  const res = await fetch(`/api/admin/eventos/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const { data } = await res.json();
  return data as any;
}

export default async function AdminEditEventoPage({ params }: { params: { id: string } }) {
  const evento = await getEvento(params.id);
  if (!evento) notFound();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Editar evento</h1>
      <EventForm
        mode="edit"
        initialData={{
          id: evento.id,
          nombre: evento.nombre,
          fecha: evento.fecha,
          lugar: evento.lugar,
          ciudad: evento.ciudad,
          direccion: evento.direccion,
          descripcion: evento.descripcion,
          tipo: evento.tipo,
          reglas: evento.reglas,
          isPublished: evento.isPublished,
          isTicketed: evento.isTicketed,
        }}
      />
    </main>
  );
}