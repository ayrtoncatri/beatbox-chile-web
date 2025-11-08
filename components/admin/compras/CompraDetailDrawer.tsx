"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCompraById, deleteCompra } from "@/app/admin/compras/actions";

export default function CompraDetailDrawer({ compraId, isOpen, onClose }: {
  compraId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [compra, setCompra] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Cargar datos de la compra cuando se abre el drawer
  useEffect(() => {
    if (isOpen && compraId) {
      loadCompra();
    }
  }, [isOpen, compraId]);

  // Función para cargar los datos de la compra
  async function loadCompra() {
    setLoading(true);
    try {
      const data = await getCompraById(compraId);
      setCompra(data);
    } catch (error) {
      console.error("Error al cargar la compra:", error);
    } finally {
      setLoading(false);
    }
  }
  
  // Función para eliminar la compra
  async function handleDelete() {
    if (!confirm("¿Estás seguro que deseas eliminar esta compra?")) {
      return;
    }
    
    setDeleteLoading(true);
    try {
      const result = await deleteCompra(compraId);
      if (result.success) {
        onClose();
        router.refresh();
      } else {
        alert(result.message || "Error al eliminar la compra");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar la compra");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      {/* Drawer */}
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border-l border-blue-700/30 shadow-lg">
        <div className="p-4 flex justify-between items-center border-b border-blue-700/30">
          <h2 className="text-xl font-bold text-white">Detalle de compra</h2>
          <button onClick={onClose} className="text-blue-300 hover:text-blue-100">
            Cerrar
          </button>
        </div>
        
        {loading ? (
          <div className="p-4 text-blue-200">Cargando...</div>
        ) : compra ? (
          <div className="p-4 text-blue-100">
            {/* Información de la compra */}
            <div className="mb-4">
              <p><strong className="text-blue-200">ID:</strong> {compra.id}</p>
              <p><strong className="text-blue-200">Fecha compra:</strong> {new Date(compra.createdAt).toLocaleString()}</p>
            </div>
            
            {/* Información del comprador */}
            <div className="mb-4">
              <h3 className="font-semibold mb-1 text-blue-200">Comprador:</h3>
              <p><strong className="text-blue-200">Nombre:</strong> {compra.userNombre}</p>
              <p><strong className="text-blue-200">Email:</strong> {compra.userEmail}</p>
            </div>
            
            {/* Información del evento */}
            <div className="mb-4">
              <h3 className="font-semibold mb-1 text-blue-200">Evento:</h3>
              <p><strong className="text-blue-200">Nombre:</strong> {compra.eventoNombre}</p>
              <p><strong className="text-blue-200">Fecha:</strong> {new Date(compra.eventoFecha).toLocaleString()}</p>
            </div>
            
            {/* Información de la entrada */}
            <div className="mb-4">
              <h3 className="font-semibold mb-1 text-blue-200">Entrada:</h3>
              <p><strong className="text-blue-200">Tipo:</strong> {compra.tipoEntrada}</p>
              <p><strong className="text-blue-200">Cantidad:</strong> {compra.cantidad}</p>
              <p><strong className="text-blue-200">Precio unitario:</strong> ${compra.precioUnitario}</p>
              <p><strong className="text-blue-200">Total:</strong> ${compra.total}</p>
            </div>
            
            {/* Botones de acción */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:from-red-700 hover:to-red-600 disabled:opacity-50"
              >
                {deleteLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
              
              <button
                onClick={() => router.push(`/admin/eventos/${compra.eventoId}`)}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-600"
              >
                Ver evento
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 text-blue-200">No se encontró la compra</div>
        )}
      </div>
    </div>
  );
}