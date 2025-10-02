"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { getSugerenciaById, updateSugerencia, deleteSugerencia } from "@/app/admin/sugerencias/actions";

export default function SugerenciaDetailDrawer({ sugerenciaId, isOpen, onClose }: {
  sugerenciaId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [sugerencia, setSugerencia] = useState<any>(null);
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
      setSugerencia(data);
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
    
    setDeleteLoading(true);
    try {
      const result = await deleteSugerencia(sugerenciaId);
      if (result.success) {
        onClose();
        router.refresh();
      } else {
        alert(result.message || "Error al eliminar la sugerencia");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar la sugerencia");
    } finally {
      setDeleteLoading(false);
    }
  }

  // Efecto para cerrar el drawer cuando se actualiza exitosamente
  useEffect(() => {
    if (formState.success) {
      router.refresh();
    }
  }, [formState.success, router]);

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      {/* Drawer */}
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-lg">
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold">Detalle de sugerencia</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            Cerrar
          </button>
        </div>
        
        {loading ? (
          <div className="p-4">Cargando...</div>
        ) : sugerencia ? (
          <div className="p-4">
            <form action={formAction}>
              <input type="hidden" name="id" value={sugerencia.id} />
              
              {/* Información básica */}
              <div className="mb-4">
                <p><strong>ID:</strong> {sugerencia.id}</p>
                <p><strong>Fecha:</strong> {new Date(sugerencia.createdAt).toLocaleString()}</p>
                <p><strong>Usuario:</strong> {sugerencia.user ? sugerencia.user.email : sugerencia.email || sugerencia.nombre || 'Anónimo'}</p>
              </div>
              
              {/* Mensaje */}
              <div className="mb-4">
                <h3 className="font-semibold mb-1">Mensaje:</h3>
                <p className="bg-gray-50 p-2 rounded">{sugerencia.mensaje}</p>
              </div>
              
              {/* Estado */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">Estado:</label>
                <select 
                  name="estado" 
                  defaultValue={sugerencia.estado}
                  className="w-full p-2 border rounded"
                >
                  <option value="nuevo">Nuevo</option>
                  <option value="revisado">Revisado</option>
                  <option value="descartado">Descartado</option>
                </select>
              </div>
              
              {/* Nota privada */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">Nota privada:</label>
                <textarea
                  name="notaPrivada"
                  defaultValue={sugerencia.notaPrivada || ''}
                  className="w-full p-2 border rounded h-24"
                />
              </div>
              
              {/* Mensajes de estado */}
              {formState.message && (
                <div className={`p-2 mb-4 rounded ${formState.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {formState.message}
                </div>
              )}
              
              {/* Botones de acción */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300"
                >
                  {deleteLoading ? 'Eliminando...' : 'Eliminar'}
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-4">No se encontró la sugerencia</div>
        )}
      </div>
    </div>
  );
}