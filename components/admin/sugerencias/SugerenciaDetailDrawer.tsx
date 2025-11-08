"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { getSugerenciaById, updateSugerencia, deleteSugerencia } from "@/app/admin/sugerencias/actions";
import { SuggestionStatus } from "@prisma/client";
import toast from "react-hot-toast";

type SugerenciaDetalle = {
  id: string;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    profile: {
      nombres: string | null;
      apellidoPaterno: string | null;
    } | null;
  } | null;
  nombre: string | null; // Para anónimos
  email: string | null; // Para anónimos
  mensaje: string;
  asunto: string | null;
  estado: SuggestionStatus;
  notaPrivada: string | null;
};
const statusLabels: Record<SuggestionStatus, string> = {
  [SuggestionStatus.nuevo]: "Nuevo",
  [SuggestionStatus.en_progreso]: "En Progreso",
  [SuggestionStatus.resuelta]: "Resuelta",
  [SuggestionStatus.descartada]: "Descartada",
};

export default function SugerenciaDetailDrawer({ sugerenciaId, isOpen, onClose }: {
  sugerenciaId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [sugerencia, setSugerencia] = useState<SugerenciaDetalle | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Estado inicial para el formulario
  const initialState = { success: false, message: "", errors: {} };
  
  // useFormState para manejar la acción del servidor
  const [formState, formAction] = useFormState(updateSugerencia, initialState);
  
  // Cargar datos de la sugerencia cuando se abre el drawer
  useEffect(() => {
    if (isOpen && sugerenciaId) {
      loadSugerencia();
    }
  }, [isOpen, sugerenciaId]);

  // Función para cargar los datos de la sugerencia
  async function loadSugerencia() {
    setLoading(true);
    try {
      const data = await getSugerenciaById(sugerenciaId);
      setSugerencia(data as SugerenciaDetalle);
    } catch (error) {
      console.error("Error al cargar la sugerencia:", error);
    } finally {
      setLoading(false);
    }
  }
  
  // Función para eliminar la sugerencia
  async function handleDelete() {
    if (!confirm("¿Estás seguro que deseas eliminar esta sugerencia?")) {
      return;
    }
    
    const loadingToast = toast.loading("Eliminando sugerencia...");
    setDeleteLoading(true);
    try {
      const result = await deleteSugerencia(sugerenciaId);
      if (result.success) {
        toast.success("Sugerencia eliminada correctamente", { id: loadingToast });
        onClose();
        router.refresh();
      } else {
        toast.error(result.message || "Error al eliminar la sugerencia", { id: loadingToast });
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("Error al eliminar la sugerencia", { id: loadingToast });
    } finally {
      setDeleteLoading(false);
    }
  }

  // Efecto para cerrar el drawer cuando se actualiza exitosamente
  useEffect(() => {
    if (formState.success) {
      toast.success("Sugerencia actualizada correctamente");
      router.refresh();
      onClose();
    } else if (formState.message && !formState.success) {
      toast.error(formState.message);
    }
  }, [formState.success, formState.message, router, onClose]);

  const renderUserName = () => {
    if (loading || !sugerencia) return 'Cargando...';
    
    if (sugerencia.user) {
      const userName = [sugerencia.user.profile?.nombres, sugerencia.user.profile?.apellidoPaterno]
        .filter(Boolean)
        .join(" ");
      
      // Mostrar "Nombre (email)" o "email" si no tiene perfil
      return userName ? `${userName} (${sugerencia.user.email})` : sugerencia.user.email;
    }
    
    // Fallback para sugerencias anónimas
    return sugerencia.nombre ? `${sugerencia.nombre} (${sugerencia.email || 'sin email'})` : 'Anónimo';
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      {/* Drawer */}
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border-l border-blue-700/30 shadow-lg">
        <div className="p-4 flex justify-between items-center border-b border-blue-700/30">
          <h2 className="text-xl font-bold text-white">Detalle de sugerencia</h2>
          <button onClick={onClose} className="text-blue-300 hover:text-blue-100">
            Cerrar
          </button>
        </div>
        
        {loading ? (
          <div className="p-4 text-blue-200">Cargando...</div>
        ) : sugerencia ? (
          <div className="p-4 text-blue-100">
            <form action={formAction}>
              <input type="hidden" name="id" value={sugerencia.id} />
              
              {/* Información básica */}
              <div className="mb-4">
                <p><strong className="text-blue-200">ID:</strong> <span className="text-blue-100">{sugerencia.id}</span></p>
                <p><strong className="text-blue-200">Fecha:</strong> <span className="text-blue-100">{new Date(sugerencia.createdAt).toLocaleString()}</span></p>
                <p><strong className="text-blue-200">Usuario:</strong> <span className="text-blue-100">{renderUserName()}</span></p>
              </div>
              
              {/* Mensaje */}
              <div className="mb-4">
                <h3 className="font-semibold mb-1 text-blue-200">Mensaje:</h3>
                <p className="bg-blue-900/50 border border-blue-700/30 p-2 rounded text-blue-100">{sugerencia.mensaje}</p>
              </div>
              
              {/* Estado */}
              <div className="mb-4">
                <label className="block font-semibold mb-1 text-blue-200">Estado:</label>
                <select 
                  name="estado" 
                  defaultValue={sugerencia.estado}
                  className="w-full p-2 border border-blue-700/50 rounded bg-blue-950/50 text-blue-100"
                >
                    {/* CAMBIO: Usar los valores y etiquetas del Enum */}
                    {Object.values(SuggestionStatus).map(status => (
                      <option key={status} value={status}>
                        {statusLabels[status] || status}
                      </option>
                    ))}
                </select>
              </div>
              
              {/* Nota privada */}
              <div className="mb-4">
                <label className="block font-semibold mb-1 text-blue-200">Nota privada:</label>
                <textarea
                  name="notaPrivada"
                  defaultValue={sugerencia.notaPrivada || ''}
                  className="w-full p-2 border border-blue-700/50 rounded h-24 bg-blue-950/50 text-blue-100 placeholder:text-blue-400/50"
                />
              </div>
              
              {/* Mensajes de estado */}
              {formState.message && (
                <div className={`p-2 mb-4 rounded border ${formState.success ? 'bg-green-900/50 text-green-300 border-green-700/30' : 'bg-red-900/50 text-red-300 border-red-700/30'}`}>
                  {formState.message}
                </div>
              )}
              
              {/* Botones de acción */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:from-red-700 hover:to-red-600 disabled:opacity-50"
                >
                  {deleteLoading ? 'Eliminando...' : 'Eliminar'}
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-600"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-4 text-blue-200">No se encontró la sugerencia</div>
        )}
      </div>
    </div>
  );
}