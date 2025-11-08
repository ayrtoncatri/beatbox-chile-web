"use client";

import { useState, useEffect, useTransition } from "react";
import { PlusIcon, PencilSquareIcon, TrashIcon, TicketIcon } from "@heroicons/react/24/solid";
import { createEvent, editEvent, deleteEvent, createTicketType, deleteTicketType } from "@/app/admin/eventos/actions";
import { useRouter } from "next/navigation";
import { Prisma } from "@prisma/client";
import toast from "react-hot-toast";


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
    ticketTypes: true,
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
  ticketType?: any;
};

function SubmitButton({ isEditing, isPending }: { isEditing: boolean; isPending: boolean }) {
  return (
    <button
      type="submit"
      className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-50"
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
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold shadow-lg hover:from-red-700 hover:to-red-600 transition disabled:opacity-50"
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

  const [isTicketActionPending, startTicketAction] = useTransition();

  const [nombre, setNombre] = useState(evento?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(evento?.descripcion ?? "");
  const [fecha, setFecha] = useState(
    evento?.fecha ? new Date(evento.fecha).toISOString().split("T")[0] : ""
  );

  const [wildcardDeadline, setWildcardDeadline] = useState(
    evento?.wildcardDeadline
      ? new Date(evento.wildcardDeadline).toISOString().slice(0, 16) // Formato YYYY-MM-DDTHH:MM
      : "",
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

  const [newTicketName, setNewTicketName] = useState("");
  const [newTicketPrice, setNewTicketPrice] = useState("");
  const [newTicketCapacity, setNewTicketCapacity] = useState("");


  useEffect(() => {
    if (evento) {
      setNombre(evento.nombre);
      setDescripcion(evento.descripcion ?? "");
      setFecha(new Date(evento.fecha).toISOString().split("T")[0]);
      setReglas(evento.reglas);
      setImage(evento.image ?? "");
      setIsPublished(evento.isPublished);
      setIsTicketed(evento.isTicketed);

      setWildcardDeadline(
        evento.wildcardDeadline
          ? new Date(evento.wildcardDeadline).toISOString().slice(0, 16)
          : "",
      );

      setTipo(evento.tipo?.name ?? "");
      setVenueName(evento.venue?.name ?? "");
      setVenueStreet(evento.venue?.address?.street ?? "");

      setSelectedComunaId(evento.venue?.address?.comunaId?.toString() ?? null);
      setSelectedRegionId(evento.venue?.address?.comuna?.regionId?.toString() ?? null);

      setSelectedTipoId(evento.tipoId?.toString() ?? null);
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

    const loadingToast = toast.loading(actuallyEditing ? "Actualizando evento..." : "Creando evento...");
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
          const successMessage = actuallyEditing
            ? "Evento actualizado correctamente"
            : "Evento creado correctamente";
          toast.success(successMessage, { id: loadingToast });

          if (!actuallyEditing) {
            setTimeout(() => {
              console.log("🔄 Redirigiendo...");
              router.push("/admin/eventos");
            }, 2000);
          }
        } else if (result && result.error) {
          toast.error(result.error, { id: loadingToast });
        } else {
          console.log("⚠️ Resultado undefined, no se procesará");
          const errorMessage = "No se pudo procesar la solicitud";
          toast.error(errorMessage, { id: loadingToast });
        }
      } catch (error) {
        console.error("❌ Error:", error);
        const errorMessage = "Error al procesar la solicitud";
        toast.error(errorMessage, { id: loadingToast });
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

    const loadingToast = toast.loading("Eliminando evento...");
    startDeletion(async () => {
      try {
        console.log("🗑️ Eliminando evento...");

        const result = (await deleteEvent(null, formData)) as ActionResult;

        console.log("📝 Resultado eliminación:", result);

        if (result && result.ok) {
          toast.success("Evento eliminado correctamente", { id: loadingToast });

          router.refresh();
          setTimeout(() => {
            router.push("/admin/eventos");
          }, 500);
        } else if (result && result.error) {
          toast.error(result.error, { id: loadingToast });
        } else {
          console.log("⚠️ Resultado eliminación undefined");
          const errorMessage = "No se pudo eliminar el evento";
          toast.error(errorMessage, { id: loadingToast });
        }
      } catch (error) {
        console.error("❌ Error eliminando:", error);
        const errorMessage = "Error al eliminar el evento";
        toast.error(errorMessage, { id: loadingToast });
      }
    });
  }

  async function handleAddTicketType(formData: FormData) {
    if (!actuallyEditing) return; // Solo en modo edición

    // Añadir el eventId al formData
    formData.set("eventId", evento.id);

    const loadingToast = toast.loading("Añadiendo tipo de entrada...");
    startTicketAction(async () => {
      try {
        const result = (await createTicketType(null, formData)) as ActionResult;
        if (result?.ok) {
          toast.success("Tipo de entrada añadido", { id: loadingToast });
          // Limpiar formulario y refrescar datos
          setNewTicketName("");
          setNewTicketPrice("");
          setNewTicketCapacity("");
          router.refresh(); // Vuelve a cargar los datos del servidor (incluyendo la lista de tickets)
        } else {
          toast.error(result?.error || "Error al añadir", { id: loadingToast });
        }
      } catch (error: any) {
        toast.error(error.message || "Error al añadir", { id: loadingToast });
      }
    });
  }

  async function handleDeleteTicketType(ticketTypeId: string) {
    if (!actuallyEditing) return;
    if (!confirm("¿Eliminar este tipo de entrada?")) return;

    // Crear FormData para la acción
    const formData = new FormData();
    formData.set("id", ticketTypeId);
    formData.set("eventId", evento.id); // Para revalidación

    const loadingToast = toast.loading("Eliminando tipo de entrada...");
    startTicketAction(async () => {
      try {
        const result = (await deleteTicketType(null, formData)) as ActionResult;
        if (result?.ok) {
          toast.success("Tipo de entrada eliminado", { id: loadingToast });
          router.refresh(); // Vuelve a cargar los datos del servidor
        } else {
          toast.error(result?.error || "Error al eliminar", { id: loadingToast });
        }
      } catch (error: any) {
        toast.error(error.message || "Error al eliminar", { id: loadingToast });
      }
    });
  }

  return (
    <div className="space-y-6">
      <form action={handleSubmit} className="space-y-6">
        {actuallyEditing && <input type="hidden" name="id" value={evento!.id} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-blue-200 mb-1 font-medium">
              Nombre del evento *
            </label>
            <input
              className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white placeholder:text-blue-300/70"
              name="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del evento"
              maxLength={200}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-blue-200 mb-1 font-medium">Tipo *</label>
            <select
              className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white"
              name="tipoId" 
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
            <label className="block text-sm text-blue-200 mb-1 font-medium">Fecha del Evento *</label>
            <input
              className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white"
              name="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-blue-200 mb-1 font-medium">
              Fecha Límite Wildcards (Opcional)
            </label>
            <input
              className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white"
              name="wildcardDeadline" 
              type="datetime-local" 
              value={wildcardDeadline}
              onChange={(e) => setWildcardDeadline(e.target.value)}
            />
            <p className="mt-1 text-xs text-blue-300/70">
              Dejar vacío si el evento no acepta wildcards.
            </p>
          </div>

          <div>
            <label className="block text-sm text-blue-200 mb-1 font-medium">
              Nombre del Lugar (Venue)
            </label>
            <input
              className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white placeholder:text-blue-300/70"
              name="venueName"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="Nombre del lugar (Ej: Plaza de Maipú)"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm text-blue-200 mb-1 font-medium">Región</label>
            <select
              className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white"
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

          {/* --- Campo de Comuna (combo box) --- */}
          <div>
            <label className="block text-sm text-blue-200 mb-1 font-medium">Comuna</label>
            <select
              className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white"
              name="comunaId"
              value={selectedComunaId || ""}
              onChange={(e) => setSelectedComunaId(e.target.value || null)}
              disabled={!selectedRegionId || filteredComunas.length === 0}
            >
              <option value="">Seleccionar comuna</option>
              {filteredComunas.map((comuna) => (
                <option key={comuna.id} value={comuna.id}>
                  {comuna.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-blue-200 mb-1 font-medium">
              Dirección (Calle y Nro)
            </label>
            <input
              className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white placeholder:text-blue-300/70"
              name="venueStreet"
              value={venueStreet}
              onChange={(e) => setVenueStreet(e.target.value)}
              placeholder="Ej: Av. Pajaritos 1234"
            />
          </div>

          <div>
            <label className="block text-sm text-blue-200 mb-1 font-medium">
              Imagen (URL)
            </label>
            <input
              className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white placeholder:text-blue-300/70"
              name="image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <div>
            <label className="block text-sm text-blue-200 mb-1 font-medium">Estado</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-blue-700/50 bg-blue-950/50"
                />
                <span className="text-sm text-blue-200">Publicado</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isTicketed"
                  checked={isTicketed}
                  onChange={(e) => setIsTicketed(e.target.checked)}
                  className="rounded border-blue-700/50 bg-blue-950/50"
                />
                <span className="text-sm text-blue-200">Requiere entrada</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-blue-200 mb-1 font-medium">
            Descripción *
          </label>
          <textarea
            className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white placeholder:text-blue-300/70 h-32 resize-none"
            name="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe el evento..."
            maxLength={1000}
            required
          />
          <div className="text-xs text-blue-300/70 mt-1">
            {descripcion.length}/1000 caracteres
          </div>
        </div>

        <div>
          <label className="block text-sm text-blue-200 mb-1 font-medium">Reglas *</label>
          <textarea
            className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white placeholder:text-blue-300/70 h-32 resize-none"
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

      {/* --- SECCIÓN: Gestión de Tipos de Entrada --- */}
      {actuallyEditing && (
        <div className="space-y-6 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 p-6 rounded-lg shadow-lg mt-8">
          <h2 className="text-xl font-semibold border-b border-blue-700/30 pb-2 mb-6 text-white">
            Tipos de Entrada
          </h2>

          {/* Formulario para añadir nuevo tipo */}
          <form action={handleAddTicketType} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border-b border-blue-700/30 pb-6 mb-6">
            <div>
              <label className="block text-sm text-blue-200 mb-1 font-medium">Nombre *</label>
              <input
                name="name"
                value={newTicketName}
                onChange={(e) => setNewTicketName(e.target.value)}
                placeholder="Ej: General"
                className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white placeholder:text-blue-300/70"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-blue-200 mb-1 font-medium">Precio (CLP) *</label>
              <input
                name="price"
                type="number"
                min="0"
                step="100" // Opcional: permite incrementos de 100
                value={newTicketPrice}
                onChange={(e) => setNewTicketPrice(e.target.value)}
                placeholder="Ej: 8000"
                className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white placeholder:text-blue-300/70"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-blue-200 mb-1 font-medium">Capacidad (Opc)</label>
              <input
                name="capacity"
                type="number"
                min="1"
                value={newTicketCapacity}
                onChange={(e) => setNewTicketCapacity(e.target.value)}
                placeholder="Ej: 100"
                className="w-full border border-blue-700/50 rounded-lg px-3 py-2 text-sm bg-blue-950/50 text-white placeholder:text-blue-300/70"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-semibold shadow-lg hover:from-green-700 hover:to-green-600 transition disabled:opacity-50"
              disabled={isTicketActionPending || isPending || isDeleting}
            >
              <PlusIcon className="w-4 h-4" />
              Añadir
            </button>
          </form>


          {/* Lista de tipos existentes */}
          <h3 className="text-lg font-semibold mb-4 text-blue-200">Entradas Actuales</h3>
          {evento.ticketTypes && evento.ticketTypes.length > 0 ? (
            <ul className="space-y-3">
              {evento.ticketTypes.map((ticket) => (
                <li key={ticket.id} className="flex justify-between items-center bg-blue-900/50 p-3 rounded-lg border border-blue-700/30 text-blue-200">
                  <div className="flex items-center gap-3">
                    <TicketIcon className="w-5 h-5 text-blue-400" />
                    <div>
                      <span className="font-semibold text-white">{ticket.name}</span>
                      <span className="text-sm text-blue-200 ml-2">(${ticket.price.toLocaleString('es-CL')})</span>
                      {ticket.capacity && <span className="text-xs text-blue-300/70 ml-2">(Cap: {ticket.capacity})</span>}
                    </div>
                  </div>
                  {/* Formulario individual para eliminar */}
                  <form action={() => handleDeleteTicketType(ticket.id)}>
                    {/* No necesitamos pasar FormData aquí, el ID es suficiente */}
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600/50 text-red-200 border border-red-500/30 text-xs font-semibold hover:bg-red-600/70 transition disabled:opacity-50"
                      disabled={isTicketActionPending || isPending || isDeleting}
                      aria-label={`Eliminar ${ticket.name}`}
                    >
                      <TrashIcon className="w-3 h-3" />
                      Eliminar
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-blue-300/70 italic">No hay tipos de entrada definidos para este evento.</p>
          )}
        </div>
      )}

      {actuallyEditing && (
        <div className="border-t border-blue-700/30 pt-6 mt-8"> 
          <h3 className="text-lg font-semibold text-red-400 mb-4">
            Zona de peligro
          </h3>
          <form action={handleDelete} className="space-y-4">
            <input type="hidden" name="id" value={evento!.id} />
            <p className="text-sm text-blue-200">
              Esta acción eliminará permanentemente el evento y no se puede
              deshacer.
            </p>
            <DeleteButton isPending={isDeleting || isPending || isTicketActionPending} />
          </form>
        </div>
      )}
    </div>
  );
}