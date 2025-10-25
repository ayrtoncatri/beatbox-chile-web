"use client";

import { useState, useEffect, useTransition } from "react";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { createEvent, editEvent, deleteEvent } from "@/app/admin/eventos/actions";
import { useRouter } from "next/navigation";
import { Prisma } from "@prisma/client";


const eventoWithDetails = Prisma.validator<Prisma.EventoDefaultArgs>()({
  include: {
    tipo: true,
    venue: {
      include: {
        address: {
          include: {
            comuna: {
              include: {
                region: true, 
              },
            },
          },
        },
      },
    },
  },
});
type EventoFormProps = Prisma.EventoGetPayload<typeof eventoWithDetails>;
type RegionProps = Prisma.RegionGetPayload<null>;
type ComunaProps = Prisma.ComunaGetPayload<null>;
type EventTypeProps = Prisma.EventTypeGetPayload<null>;

type EventFormPropsWrapper = {
  evento?: EventoFormProps | null;
  mode?: "create" | "edit";

  regiones: RegionProps[];
  comunas: ComunaProps[];

  eventTypes: EventTypeProps[];
};

type ActionResult = {
  ok: boolean;
  error?: string;
  evento?: any;
};

function SubmitButton({ isEditing, isPending }: { isEditing: boolean; isPending: boolean }) {
  return (
    <button
      type="submit"
      className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50"
      disabled={isPending}
    >
      {isEditing ? <PencilSquareIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
      {isPending ? "Guardando..." : isEditing ? "Actualizar evento" : "Crear evento"}
    </button>
  );
}

function DeleteButton({ isPending }: { isPending: boolean }) {
  return (
    <button
      type="submit"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition disabled:opacity-50"
      disabled={isPending}
    >
      <TrashIcon className="w-4 h-4" />
      {isPending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}

export default function EventForm({ evento, mode, regiones, comunas, eventTypes }: EventFormPropsWrapper) {
  const isEditing = !!evento || mode === "edit";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeletion] = useTransition();

  const [nombre, setNombre] = useState(evento?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(evento?.descripcion ?? "");
  const [fecha, setFecha] = useState(
    evento?.fecha ? new Date(evento.fecha).toISOString().split("T")[0] : ""
  );
  const [venueName, setVenueName] = useState(evento?.venue?.name ?? "");
  const [venueStreet, setVenueStreet] = useState(evento?.venue?.address?.street ?? "");

  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(
    evento?.venue?.address?.comuna?.regionId?.toString() ?? null
  );
  const [selectedComunaId, setSelectedComunaId] = useState<string | null>(
    evento?.venue?.address?.comunaId?.toString() ?? null
  );
  const [selectedTipoId, setSelectedTipoId] = useState<string | null>(
    evento?.tipoId?.toString() ?? null 
  );

  const [tipo, setTipo] = useState(evento?.tipo?.name ?? "");
  const [reglas, setReglas] = useState(evento?.reglas ?? "");
  const [image, setImage] = useState(evento?.image ?? "");
  const [isPublished, setIsPublished] = useState(evento?.isPublished ?? false);
  const [isTicketed, setIsTicketed] = useState(evento?.isTicketed ?? true);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (evento) {
      setNombre(evento.nombre);
      setDescripcion(evento.descripcion ?? "");
      setFecha(new Date(evento.fecha).toISOString().split("T")[0]);
      setReglas(evento.reglas);
      setImage(evento.image ?? "");
      setIsPublished(evento.isPublished);
      setIsTicketed(evento.isTicketed);

      setTipo(evento.tipo?.name ?? "");
      setVenueName(evento.venue?.name ?? "");
      setVenueStreet(evento.venue?.address?.street ?? "");

      setSelectedComunaId(evento.venue?.address?.comunaId?.toString() ?? null);
      setSelectedRegionId(evento.venue?.address?.comuna?.regionId?.toString() ?? null);

      setSelectedTipoId(evento.tipoId?.toString() ?? null);
    } else {
      setSelectedComunaId(null);
      setSelectedRegionId(null);
      setSelectedTipoId(null);
    }
  }, [evento]);

  const filteredComunas = selectedRegionId
    ? comunas.filter((c) => c.regionId === Number(selectedRegionId))
    : [];

  const actuallyEditing = isEditing && !!evento;

  async function handleSubmit(formData: FormData) {
    if (selectedRegionId) {
      formData.set("selectedRegionId", selectedRegionId);
    }
    if (selectedComunaId) {
      formData.set("selectedComunaId", selectedComunaId);
    }
    if (selectedTipoId) {
      formData.set("selectedTipoId", selectedTipoId);
    }

    startTransition(async () => {
      try {
        let result: ActionResult;

        if (actuallyEditing) {
          console.log("🔄 Actualizando evento...");
          result = (await editEvent(null, formData)) as ActionResult;
        } else {
          console.log("🔄 Creando evento...");
          result = (await createEvent(null, formData)) as ActionResult;
        }

        console.log("📝 Resultado:", result);

        if (result && result.ok) {
          setMessage({
            type: "success",
            text: actuallyEditing
              ? "Evento actualizado correctamente"
              : "Evento creado correctamente",
          });

          if (!actuallyEditing) {
            setTimeout(() => {
              console.log("🔄 Redirigiendo...");
              router.push("/admin/eventos");
            }, 2000);
          }
        } else if (result && result.error) {
          setMessage({
            type: "error",
            text: result.error,
          });
        } else {
          console.log("⚠️ Resultado undefined, no se procesará");
          setMessage({
            type: "error",
            text: "No se pudo procesar la solicitud",
          });
        }
      } catch (error) {
        console.error("❌ Error:", error);
        setMessage({
          type: "error",
          text: "Error al procesar la solicitud",
        });
      }
    });
  }

  async function handleDelete(formData: FormData) {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    startDeletion(async () => {
      try {
        console.log("🗑️ Eliminando evento...");

        setMessage({
          type: "success",
          text: "Eliminando evento...",
        });

        const result = (await deleteEvent(null, formData)) as ActionResult;

        console.log("📝 Resultado eliminación:", result);

        if (result && result.ok) {
          setMessage({
            type: "success",
            text: "Evento eliminado correctamente. Redirigiendo...",
          });

          router.refresh();
          setTimeout(() => {
            router.push("/admin/eventos");
          }, 500);
        } else if (result && result.error) {
          setMessage({
            type: "error",
            text: result.error,
          });
        } else {
          console.log("⚠️ Resultado eliminación undefined");
          setMessage({
            type: "error",
            text: "No se pudo eliminar el evento",
          });
        }
      } catch (error) {
        console.error("❌ Error eliminando:", error);
        setMessage({
          type: "error",
          text: "Error al eliminar el evento",
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <form action={handleSubmit} className="space-y-6">
        {actuallyEditing && <input type="hidden" name="id" value={evento!.id} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">
              Nombre del evento *
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              name="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del evento"
              maxLength={200}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">Tipo *</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              name="tipoId" // <-- CAMBIO: El 'name' ahora es 'tipoId'
              value={selectedTipoId || ""}
              onChange={(e) => setSelectedTipoId(e.target.value)}
              required
            >
              <option value="">Seleccionar tipo</option>
              {eventTypes.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">Fecha *</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              name="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">
              Nombre del Lugar (Venue)
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              name="venueName"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="Nombre del lugar (Ej: Plaza de Maipú)"
              maxLength={200}
            />
          </div>

          {/* --- CAMBIO: Campo de Región (combo box) --- */}
          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">Región</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              value={selectedRegionId || ""}
              onChange={(e) => {
                setSelectedRegionId(e.target.value || null);
                setSelectedComunaId(null); // Resetear comuna al cambiar la región
              }}
            >
              <option value="">Seleccionar región</option>
              {regiones.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          {/* --- CAMBIO: Campo de Comuna (combo box) --- */}
          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">Comuna</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              name="comunaId" // <-- CAMBIO: El 'name' del input ahora es 'comunaId'
              value={selectedComunaId || ""}
              onChange={(e) => setSelectedComunaId(e.target.value || null)}
              disabled={!selectedRegionId || filteredComunas.length === 0} // Deshabilitar si no hay región o comunas
            >
              <option value="">Seleccionar comuna</option>
              {filteredComunas.map((comuna) => (
                <option key={comuna.id} value={comuna.id}>
                  {comuna.name}
                </option>
              ))}
            </select>
          </div>
          {/* --- Fin del cambio de Region/Comuna --- */}

          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">
              Dirección (Calle y Nro)
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              name="venueStreet"
              value={venueStreet}
              onChange={(e) => setVenueStreet(e.target.value)}
              placeholder="Ej: Av. Pajaritos 1234"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">
              Imagen (URL)
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              name="image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">Estado</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Publicado</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isTicketed"
                  checked={isTicketed}
                  onChange={(e) => setIsTicketed(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Requiere entrada</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">
            Descripción *
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 h-32 resize-none"
            name="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe el evento..."
            maxLength={1000}
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {descripcion.length}/1000 caracteres
          </div>
        </div>

        {message && (
          <div
            className={`text-sm p-3 rounded-lg border ${
              message.type === "success"
                ? "text-green-700 bg-green-50 border-green-200"
                : "text-red-600 bg-red-50 border-red-200"
            }`}
          >
            {message.type === "success" ? "✅" : "❌"} {message.text}
            {message.type === "success" &&
              !actuallyEditing &&
              " Redirigiendo en 2 segundos..."}
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">Reglas *</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 h-32 resize-none"
            name="reglas"
            value={reglas}
            onChange={(e) => setReglas(e.target.value)}
            placeholder="Reglas del evento, premios, etc."
            required
          />
        </div>

        <div className="flex justify-between items-center">
          <SubmitButton isEditing={actuallyEditing} isPending={isPending || isDeleting} />
        </div>
      </form>

      {actuallyEditing && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Zona de peligro</h3>
          <form action={handleDelete} className="space-y-4">
            <input type="hidden" name="id" value={evento!.id} />
            <p className="text-sm text-gray-600">
              Esta acción eliminará permanentemente el evento y no se puede deshacer.
            </p>
            <DeleteButton isPending={isDeleting} />
          </form>
        </div>
      )}
    </div>
  );
}