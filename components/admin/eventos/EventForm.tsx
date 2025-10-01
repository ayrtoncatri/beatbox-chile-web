"use client";

import { useState, useEffect, useTransition } from "react";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { createEvent, editEvent, deleteEvent } from "@/app/admin/eventos/actions";
import { useRouter } from "next/navigation";

type Evento = {
  id: string;
  nombre: string;
  descripcion: string | null;
  fecha: Date;
  lugar: string | null;
  ciudad: string | null;
  direccion: string | null;
  tipo: string;
  reglas: string;
  imagen: string | null;
  isPublished: boolean;
  isTicketed: boolean;
} | null;

type EventFormProps = {
  evento?: Evento;
  mode?: "create" | "edit";
};

// Definir el tipo de respuesta de los Server Actions
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

export default function EventForm({ evento, mode }: EventFormProps) {
  const isEditing = !!evento || mode === "edit";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeletion] = useTransition();
  
  // Estados del formulario
  const [nombre, setNombre] = useState(evento?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(evento?.descripcion ?? "");
  const [fecha, setFecha] = useState(
    evento?.fecha ? new Date(evento.fecha).toISOString().split('T')[0] : ""
  );
  const [lugar, setLugar] = useState(evento?.lugar ?? "");
  const [ciudad, setCiudad] = useState(evento?.ciudad ?? "");
  const [direccion, setDireccion] = useState(evento?.direccion ?? "");
  const [tipo, setTipo] = useState(evento?.tipo ?? "");
  const [reglas, setReglas] = useState(evento?.reglas ?? "");
  const [imagen, setImagen] = useState(evento?.imagen ?? "");
  const [isPublished, setIsPublished] = useState(evento?.isPublished ?? false);
  const [isTicketed, setIsTicketed] = useState(evento?.isTicketed ?? true);

  // Estados para manejar el resultado
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Limpiar mensaje después de un tiempo
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Sincronizar estados cuando cambie el prop evento
  useEffect(() => {
    if (evento) {
      setNombre(evento.nombre);
      setDescripcion(evento.descripcion ?? "");
      setFecha(new Date(evento.fecha).toISOString().split('T')[0]);
      setLugar(evento.lugar ?? "");
      setCiudad(evento.ciudad ?? "");
      setDireccion(evento.direccion ?? "");
      setTipo(evento.tipo);
      setReglas(evento.reglas);
      setImagen(evento.imagen ?? "");
      setIsPublished(evento.isPublished);
      setIsTicketed(evento.isTicketed);
    }
  }, [evento]);

  const actuallyEditing = isEditing && !!evento;

  // Manejar envío del formulario
  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        let result: ActionResult;
        
        if (actuallyEditing) {
          console.log("🔄 Actualizando evento...");
          result = await editEvent(null, formData) as ActionResult;
        } else {
          console.log("🔄 Creando evento...");
          result = await createEvent(null, formData) as ActionResult;
        }

        console.log("📝 Resultado:", result);

        // ✅ Solo proceder si result existe y tiene la propiedad ok
        if (result && result.ok) {
          setMessage({ 
            type: 'success', 
            text: actuallyEditing ? 'Evento actualizado correctamente' : 'Evento creado correctamente' 
          });
          
          // ✅ Solo redirigir si estamos creando un evento (no editando)
          if (!actuallyEditing) {
            setTimeout(() => {
              console.log("🔄 Redirigiendo...");
              router.push('/admin/eventos');
            }, 2000); // 2 segundos para ver el mensaje
          }
        } else if (result && result.error) {
          // Hay un error específico
          setMessage({ 
            type: 'error', 
            text: result.error 
          });
        } else {
          // ✅ No hacer nada si result es undefined
          console.log("⚠️ Resultado undefined, no se procesará");
          setMessage({ 
            type: 'error', 
            text: 'No se pudo procesar la solicitud' 
          });
        }
      } catch (error) {
        console.error("❌ Error:", error);
        setMessage({ 
          type: 'error', 
          text: 'Error al procesar la solicitud' 
        });
      }
    });
  }

  // Manejar eliminación del evento
  async function handleDelete(formData: FormData) {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) {
      return;
    }

    startDeletion(async () => {
      try {
        console.log("🗑️ Eliminando evento...");
        
        // ✅ CAMBIO: Mostrar mensaje inmediatamente
        setMessage({ 
          type: 'success', 
          text: 'Eliminando evento...' 
        });

        const result = await deleteEvent(null, formData) as ActionResult;
        
        console.log("📝 Resultado eliminación:", result);

        if (result && result.ok) {
          setMessage({ 
            type: 'success', 
            text: 'Evento eliminado correctamente. Redirigiendo...' 
          });
          
          // ✅ CAMBIO: Forzar refresh del cache y redirigir más rápido
          router.refresh(); // Actualiza el cache
          setTimeout(() => {
            router.push('/admin/eventos');
          }, 500); // Solo 500ms
        } else if (result && result.error) {
          setMessage({ 
            type: 'error', 
            text: result.error 
          });
        } else {
          console.log("⚠️ Resultado eliminación undefined");
          setMessage({ 
            type: 'error', 
            text: 'No se pudo eliminar el evento' 
          });
        }
      } catch (error) {
        console.error("❌ Error eliminando:", error);
        setMessage({ 
          type: 'error', 
          text: 'Error al eliminar el evento' 
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Formulario Principal */}
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
            <label className="block text-sm text-gray-600 mb-1 font-medium">
              Tipo *
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              name="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="BATALLA">Batalla</option>
              <option value="TALLER">Taller</option>
              <option value="COMPETENCIA">Competencia</option>
              <option value="SHOWCASE">Showcase</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">
              Fecha *
            </label>
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
              Lugar
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              name="lugar"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
              placeholder="Nombre del lugar"
              maxLength={200}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">
              Ciudad
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              name="ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Ciudad donde se realiza"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">
              Dirección
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              name="direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Dirección exacta"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">
              Imagen (URL)
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              name="imagen"
              type="url"
              value={imagen}
              onChange={(e) => setImagen(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">
              Estado
            </label>
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

        {/* Mensaje entre descripción y reglas */}
        {message && (
          <div className={`text-sm p-3 rounded-lg border ${
            message.type === 'success' 
              ? 'text-green-700 bg-green-50 border-green-200' 
              : 'text-red-600 bg-red-50 border-red-200'
          }`}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
            {message.type === 'success' && !actuallyEditing && ' Redirigiendo en 2 segundos...'}
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-600 mb-1 font-medium">
            Reglas *
          </label>
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

      {/* Formulario de Eliminación (solo en modo edición) */}
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