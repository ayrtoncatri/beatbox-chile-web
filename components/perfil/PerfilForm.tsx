"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { updatePerfil } from "@/app/perfil/actions"; // Tu action existente
import { useRouter } from "next/navigation";
import { PencilSquareIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";

// Tipos recibidos desde la DB
type Region = { id: number; name: string };
type Comuna = { id: number; name: string; regionId: number };

// --- CORRECCIÓN 1: Definición de Tipos Completa ---
// Esto arregla el error en page.tsx (regionName does not exist...)
export type UserLike = {
  email: string;
  image?: string | null;
  nombres?: string | null;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  regionName?: string; // <--- Agregado
  comunaName?: string; // <--- Agregado
  comunaId?: number | null;
  regionId?: number; 
  birthDate?: string; 
  edad?: number | string | null;
  wildcards?: any[];
};

interface PerfilFormProps {
  user: UserLike;
  regiones: Region[];
  comunas: Comuna[];
}

export default function PerfilForm({ user, regiones, comunas }: PerfilFormProps) {
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);

  // Estados para Selects
  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    user.regionId ? user.regionId.toString() : ""
  );
  const [selectedComunaId, setSelectedComunaId] = useState<string>(
    user.comunaId ? user.comunaId.toString() : ""
  );

  const comunasFiltradas = useMemo(() => {
    if (!selectedRegionId) return [];
    return comunas.filter((c) => c.regionId === Number(selectedRegionId));
  }, [selectedRegionId, comunas]);

  // Manejo del Guardado
  const handleSubmit = async (formData: FormData) => {
    const loadingId = toast.loading("Guardando cambios...");
    
    // --- CORRECCIÓN 2: Adaptación a tu actions.ts ---
    // Tu action devuelve { ok: boolean }, no { success: string }
    const result = await updatePerfil(null, formData);

    // Usamos 'result?.ok' en lugar de 'result?.success'
    if (result && result.ok) {
      toast.success("Perfil actualizado", { id: loadingId });
      setIsEditing(false); 
      router.refresh();    
    } else {
      // Tu action devuelve el error en 'result.error'
      toast.error(result?.error || "Error al guardar", { id: loadingId });
    }
  };

  const avatarName = (user.nombres?.[0] || "") + (user.apellidoPaterno?.[0] || "");

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 p-4">
      
      {/* --- TARJETA PRINCIPAL --- */}
      <div className="relative w-full bg-[#0f172a] rounded-3xl shadow-2xl border border-blue-900/30 p-8">
        
        {/* Avatar y Cabecera */}
        <div className="flex flex-col items-center gap-4 mb-8">
           <div className="relative group">
             <Image
                src={user.image || `https://ui-avatars.com/api/?name=${avatarName}&background=3b82f6&color=fff&size=128`}
                alt="Perfil"
                width={128}
                height={128}
                className="rounded-full object-cover border-4 border-blue-600 shadow-lg"
             />
           </div>
           <div className="text-center">
             <h2 className="text-2xl font-bold text-white">{user.nombres || "Usuario"} {user.apellidoPaterno}</h2>
             <span className="text-blue-400 text-sm font-medium">{user.email}</span>
           </div>
        </div>

        {/* FORMULARIO */}
        <form action={handleSubmit} className="flex flex-col gap-6">
          
          {/* Datos Personales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 ml-1 mb-1.5 block font-bold">Nombres</label>
                <input
                    name="nombres"
                    defaultValue={user.nombres || ""}
                    disabled={!isEditing}
                    className="w-full rounded-xl bg-black/20 border border-gray-700 px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
             </div>
             <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 ml-1 mb-1.5 block font-bold">Apellido Paterno</label>
                <input
                    name="apellidoPaterno"
                    defaultValue={user.apellidoPaterno || ""}
                    disabled={!isEditing}
                    className="w-full rounded-xl bg-black/20 border border-gray-700 px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 ml-1 mb-1.5 block font-bold">Apellido Materno</label>
                <input
                    name="apellidoMaterno"
                    defaultValue={user.apellidoMaterno || ""}
                    disabled={!isEditing}
                    className="w-full rounded-xl bg-black/20 border border-gray-700 px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
             </div>
             <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 ml-1 mb-1.5 block font-bold">Fecha Nacimiento</label>
                <input
                    type="date"
                    name="birthDate"
                    defaultValue={user.birthDate || ""}
                    disabled={!isEditing}
                    className="w-full rounded-xl bg-black/20 border border-gray-700 px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed icon-invert"
                    style={{ colorScheme: 'dark' }} 
                />
             </div>
          </div>

          {/* Ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 ml-1 mb-1.5 block font-bold">Región</label>
                <select
                    name="regionId_display" // Nombre dummy, no se envía directo
                    value={selectedRegionId}
                    onChange={(e) => {
                        setSelectedRegionId(e.target.value);
                        setSelectedComunaId(""); 
                    }}
                    disabled={!isEditing}
                    className="w-full rounded-xl bg-black/20 border border-gray-700 px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                >
                    <option value="">Selecciona Región</option>
                    {regiones.map(r => (
                        <option key={r.id} value={r.id} className="bg-gray-900">{r.name}</option>
                    ))}
                </select>
             </div>
             <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 ml-1 mb-1.5 block font-bold">Comuna</label>
                <select
                    name="comunaId"
                    value={selectedComunaId}
                    onChange={(e) => setSelectedComunaId(e.target.value)}
                    disabled={!isEditing || !selectedRegionId}
                    className="w-full rounded-xl bg-black/20 border border-gray-700 px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                >
                    <option value="">Selecciona Comuna</option>
                    {comunasFiltradas.map(c => (
                        <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>
                    ))}
                </select>
             </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-4 border-t border-white/5 mt-2">
            {!isEditing ? (
                <button
                    type="button"
                    onClick={() => setIsEditing(true)} 
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2"
                >
                    <PencilSquareIcon className="w-5 h-5" />
                    Editar Perfil
                </button>
            ) : (
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => {
                           setIsEditing(false);
                           // Aquí podrías resetear los valores si quisieras
                        }}
                        className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        <XMarkIcon className="w-5 h-5" />
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-900/30 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckIcon className="w-5 h-5" />
                        Guardar Cambios
                    </button>
                </div>
            )}
          </div>

        </form>
      </div>

      {/* --- SECCIÓN WILDCARDS --- */}
      {user.wildcards && user.wildcards.length > 0 && (
        <div className="w-full bg-[#1a1a1a] rounded-3xl border border-white/10 p-8 shadow-xl">
          <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-3">
             <span className="text-2xl">🎥</span> Tus Wildcards Enviadas
          </h3>
          <div className="space-y-4">
            {user.wildcards.map((wc: any) => (
              <WildcardItem key={wc.id} wildcard={wc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente visual para mostrar el estado de la Wildcard
function WildcardItem({ wildcard }: { wildcard: any }) {
  return (
    <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-white/10 hover:bg-black/40">
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded">
                    {wildcard.evento?.nombre || "Evento"}
                </span>
            </div>
            <p className="text-white font-semibold text-lg">{wildcard.nombreArtistico}</p>
            {wildcard.youtubeUrl && (
                <a href={wildcard.youtubeUrl} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-blue-300 transition-colors underline underline-offset-2">
                    Ver Video
                </a>
            )}
        </div>

        <div className="flex items-center">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                wildcard.status === 'APPROVED' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                wildcard.status === 'REJECTED' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            }`}>
                {wildcard.status === 'PENDING' ? 'EN REVISIÓN' : 
                 wildcard.status === 'APPROVED' ? 'APROBADO' : 'RECHAZADO'}
            </span>
        </div>
    </div>
  )
}