"use client";
import { useEffect, useState, useTransition } from "react";
import { getSugerenciaById, updateSugerencia } from "@/app/admin/sugerencias/actions";
import PopupModal from "@/components/ui/PopupModal";
import { SuggestionStatus } from "@prisma/client";

const ESTADOS = [
  { value: SuggestionStatus.nuevo, label: "Nuevo", color: "bg-yellow-100 text-yellow-700" },
  { value: SuggestionStatus.en_progreso, label: "En Progreso", color: "bg-blue-100 text-blue-700" },
  { value: SuggestionStatus.resuelta, label: "Resuelta", color: "bg-green-100 text-green-700" },
  { value: SuggestionStatus.descartada, label: "Descartada", color: "bg-red-100 text-red-700" },
];

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

export default function SugerenciaDetailPopup({
  id,
  open,
  onClose,
}: {
  id: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const [sugerencia, setSugerencia] = useState<SugerenciaDetalle | null>(null);
  const [isPending, startTransition] = useTransition();
  const [estado, setEstado] = useState<SuggestionStatus>(SuggestionStatus.nuevo);
  const [notaPrivada, setNotaPrivada] = useState<string>("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
  if (open && id) {
    startTransition(async () => {
      const data = await getSugerenciaById(id);
      setSugerencia(data);
      if (data) {
        setEstado(data.estado);
        setNotaPrivada(data.notaPrivada || "");
      }
      setMsg(null);
    });
  }
}, [id, open]);

  const handleEstadoChange = async (nuevoEstado: SuggestionStatus) => {
    if (!id) return;
    const formData = new FormData();
    formData.append("id", id);
    formData.append("estado", nuevoEstado);
    formData.append("notaPrivada", notaPrivada);
    startTransition(async () => {
      const res = await updateSugerencia({}, formData);
      setMsg(res.message);
      if (res.success) {
        setEstado(nuevoEstado);
        // Opcional: recargar sugerencia
        const data = await getSugerenciaById(id);
        setSugerencia(data);
      }
    });
  };

  if (!open) return null;

  return (
    <PopupModal open={open} onClose={onClose}>
      <div className="min-w-[350px] animate-fade-in text-blue-100">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-lg text-white">Detalle de sugerencia</h2>
          <button onClick={onClose} className="text-blue-300 hover:text-blue-100 text-sm">Cerrar</button>
        </div>
        {!sugerencia || isPending ? (
          <div className="p-8 text-center text-blue-200">Cargando...</div>
        ) : (
          <>
            <div className="text-xs text-blue-300/70 mb-2">ID: {sugerencia.id}</div>
            <div className="mb-2 text-blue-200">Fecha: {new Date(sugerencia.createdAt).toLocaleString("es-CL")}</div>
            <div className="mb-2 text-blue-200">
              Usuario: {sugerencia.user
                ? `${sugerencia.user.profile?.nombres || ""} ${sugerencia.user.profile?.apellidoPaterno || ""}`.trim()
                : sugerencia.nombre || "(Sin nombre)"} — {sugerencia.user ? sugerencia.user.email : sugerencia.email}
            </div>
            <div className="mb-2 text-blue-200">Asunto: {sugerencia.asunto || <span className="text-blue-300/70">(Sin asunto)</span>}</div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-blue-200">Estado:</span>
              {ESTADOS.map((e) => (
                <button
                  key={e.value}
                  className={`px-2 py-1 rounded text-xs font-semibold border transition ${
                    estado === e.value
                      ? `${e.color.includes('yellow') ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700/30' : e.color.includes('green') ? 'bg-green-900/50 text-green-300 border-green-700/30' : e.color.includes('blue') ? 'bg-blue-900/50 text-blue-300 border-blue-700/30' : 'bg-red-900/50 text-red-300 border-red-700/30'} border-blue-500/30`
                      : "bg-blue-900/50 text-blue-300 border-blue-700/30 hover:border-blue-500/50"
                  }`}
                  onClick={() => handleEstadoChange(e.value)}
                  disabled={estado === e.value || isPending}
                  type="button"
                >
                  {e.label}
                </button>
              ))}
            </div>
            <div className="mb-2">
              <div className="font-semibold text-blue-200">Mensaje:</div>
              <div className="whitespace-pre-line text-blue-100">{sugerencia.mensaje}</div>
            </div>
            <div className="mb-2">
              <div className="font-semibold text-blue-200">Nota privada:</div>
              <textarea
                className="w-full border border-blue-700/50 rounded p-1 text-sm bg-blue-950/50 text-blue-100 placeholder:text-blue-400/50"
                rows={2}
                value={notaPrivada}
                onChange={e => setNotaPrivada(e.target.value)}
                onBlur={() => handleEstadoChange(estado)}
                disabled={isPending}
              />
            </div>
            {msg && <div className="text-xs text-green-300 mt-2">{msg}</div>}
          </>
        )}
      </div>
    </PopupModal>
  );
}