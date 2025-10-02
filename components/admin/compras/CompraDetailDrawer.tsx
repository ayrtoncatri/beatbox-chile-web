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
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-lg">
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold">Detalle de compra</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            Cerrar
          </button>
        </div>
        
        {loading ? (
          <div className="p-4">Cargando...</div>
        ) : compra ? (
          <div className="p-4">
            {/* Información de la compra */}
            <div className="mb-4">
              <p><strong>ID:</strong> {compra.id}</p>
              <p><strong>Fecha compra:</strong> {new Date(compra.createdAt).toLocaleString()}</p>
            </div>
            
            {/* Información del comprador */}
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Comprador:</h3>
              <p><strong>Nombre:</strong> {compra.userNombre}</p>
              <p><strong>Email:</strong> {compra.userEmail}</p>
            </div>
            
            {/* Información del evento */}
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Evento:</h3>
              <p><strong>Nombre:</strong> {compra.eventoNombre}</p>
              <p><strong>Fecha:</strong> {new Date(compra.eventoFecha).toLocaleString()}</p>
            </div>
            
            {/* Información de la entrada */}
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Entrada:</h3>
              <p><strong>Tipo:</strong> {compra.tipoEntrada}</p>
              <p><strong>Cantidad:</strong> {compra.cantidad}</p>
              <p><strong>Precio unitario:</strong> ${compra.precioUnitario}</p>
              <p><strong>Total:</strong> ${compra.total}</p>
            </div>
            
            {/* Botones de acción */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300"
              >
                {deleteLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
              
              <button
                onClick={() => router.push(`/admin/eventos/${compra.eventoId}`)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Ver evento
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4">No se encontró la compra</div>
        )}
      </div>
    </div>
  );
}