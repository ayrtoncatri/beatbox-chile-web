"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  DPARegion,
  DPAComuna,
  fetchRegiones,
  fetchComunasByRegionCode,
  normalize,
} from "@/lib/cl-geo";

type UserLike = {
  email: string;
  image?: string | null;
  nombres?: string | null;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  region?: string | null;
  comuna?: string | null;
  comunaId?: number;
  edad?: number | string | null;
  wildcards?: any[];
};

type PerfilFormState = {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  region: string;
  comuna: string;
  comunaId?: number;
  birthDate?: string;
  edad: string;
};

export default function PerfilForm({ user }: { user: UserLike }) {
  const [form, setForm] = useState<PerfilFormState>({
    nombres: user.nombres || "",
    apellidoPaterno: user.apellidoPaterno || "",
    apellidoMaterno: user.apellidoMaterno || "",
    region: user.region || "",
    comuna: user.comuna || "",
    comunaId: user.comunaId,
    birthDate: "",
    edad: user.edad ? String(user.edad) : "",
  });
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [regiones, setRegiones] = useState<DPARegion[]>([]);
  const [comunas, setComunas] = useState<DPAComuna[]>([]);
  const [loadingRegiones, setLoadingRegiones] = useState(true);
  const [loadingComunas, setLoadingComunas] = useState(false);
  const [errorGeo, setErrorGeo] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setErrorGeo(null);
      try {
        setLoadingRegiones(true);
        const regs = await fetchRegiones();
        if (!alive) return;
        setRegiones(regs);

        if (form.region) {
          const r = regs.find(
            (x) => normalize(x.nombre) === normalize(form.region)
          );
          if (r) {
            setLoadingComunas(true);
            const cms = await fetchComunasByRegionCode(r.codigo);
            if (!alive) return;
            setComunas(cms);
            if (
              form.comuna &&
              !cms.some(
                (c) => normalize(c.nombre) === normalize(form.comuna)
              )
            ) {
              setForm((f) => ({ ...f, comuna: "" }));
            }
          } else {
            setForm((f) => ({ ...f, region: "", comuna: "" }));
          }
        }
      } catch {
        if (!alive) return;
        setErrorGeo("No se pudieron cargar las regiones. Intenta más tarde.");
      } finally {
        if (alive) {
          setLoadingRegiones(false);
          setLoadingComunas(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "region") {
      setForm((f) => ({ ...f, region: value, comuna: "" }));

      const selected = regiones.find((r) => r.nombre === value);
      if (selected) {
        setLoadingComunas(true);
        setErrorGeo(null);
        try {
          const cms = await fetchComunasByRegionCode(selected.codigo);
          setComunas(cms);
        } catch {
          setComunas([]);
          setErrorGeo("No se pudieron cargar las comunas. Intenta más tarde.");
        } finally {
          setLoadingComunas(false);
        }
      } else {
        setComunas([]);
      }
      return;
    }

    if (name === "comuna") {
      const selectedComuna = comunas.find((c) => c.nombre === value);
      setForm((f) => ({
        ...f,
        comuna: value,
        comunaId: selectedComuna ? Number(selectedComuna.codigo) : undefined,
      }));
      return;
    }

    setForm((f) => ({ ...f, [name]: value }));

    // Validación en tiempo real de edad
    if (name === "edad") {
      const edadNum = parseInt(value, 10);
      let error = "";
      if (isNaN(edadNum)) error = "La edad debe ser un número válido";
      else if (edadNum < 10) error = "La edad mínima es 10 años";
      else if (edadNum > 80) error = "La edad máxima es 80 años";
      setErrors((prev) => ({ ...prev, edad: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setErrors({});

    // Validar edad antes de enviar
    const edadNum = parseInt(form.edad, 10);
    if (isNaN(edadNum) || edadNum < 10 || edadNum > 80) {
      setErrors({ edad: "Edad fuera de rango permitido" });
      return;
    }

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        body: JSON.stringify({
          nombres: form.nombres,
          apellidoPaterno: form.apellidoPaterno,
          apellidoMaterno: form.apellidoMaterno,
          comunaId: form.comunaId,
          birthDate: calcularBirthDateDesdeEdad(edadNum),
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Perfil actualizado correctamente");
      } else {
        setMsg(data?.error || "Error al actualizar perfil");
      }
    } catch {
      setMsg("Error de red al actualizar");
    }
  };

  const avatarName =
    (form.nombres ? form.nombres.split(" ")[0] : "") +
    (form.apellidoPaterno ? " " + form.apellidoPaterno : "");

  const comunasDisponibles = useMemo(
    () => comunas.map((c) => c.nombre),
    [comunas]
  );

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-900/80 via-neutral-900/90 to-blue-950/80 rounded-3xl shadow-2xl border border-blue-800/40 backdrop-blur-lg p-8 flex flex-col gap-6 items-center"
      >
        <div className="flex flex-col items-center gap-2 w-full">
          <Image
            src={
              user.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                avatarName || user.email || "U"
              )}&background=3b82f6&color=fff&size=128`
            }
            alt="Imagen de perfil"
            width={112}
            height={112}
            className="rounded-full object-cover border-4 border-blue-700 shadow-lg transition-all"
            priority
          />
          <span className="text-blue-100 font-semibold text-lg mt-2 break-all text-center">
            {user.email}
          </span>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <input
            name="nombres"
            value={form.nombres}
            onChange={handleChange}
            placeholder="Nombres"
            className="w-full rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <div className="flex flex-col md:flex-row gap-2 w-full">
            <input
              name="apellidoPaterno"
              value={form.apellidoPaterno}
              onChange={handleChange}
              placeholder="Apellido paterno"
              className="w-full md:w-1/2 rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <input
              name="apellidoMaterno"
              value={form.apellidoMaterno}
              onChange={handleChange}
              placeholder="Apellido materno"
              className="w-full md:w-1/2 rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-2 w-full">
            <select
              name="region"
              value={form.region}
              onChange={handleChange}
              disabled={loadingRegiones}
              className="w-full md:w-1/2 rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingRegiones ? "Cargando regiones..." : "Selecciona región"}
              </option>
              {regiones.map((r) => (
                <option key={r.codigo} value={r.nombre}>
                  {r.nombre}
                </option>
              ))}
            </select>

            <select
              name="comuna"
              value={form.comuna}
              onChange={handleChange}
              disabled={
                !form.region ||
                loadingComunas ||
                comunasDisponibles.length === 0
              }
              className="w-full md:w-1/2 rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">
                {!form.region
                  ? "Primero elige una región"
                  : loadingComunas
                  ? "Cargando comunas..."
                  : comunasDisponibles.length
                  ? "Selecciona comuna"
                  : "Sin comunas disponibles"}
              </option>
              {comunasDisponibles.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <input
              name="edad"
              value={form.edad}
              onChange={handleChange}
              placeholder="Edad"
              type="number"
              min={10}
              max={80}
              required
              className={`w-full rounded-lg bg-neutral-800/80 border px-4 py-2 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 transition ${
                errors.edad
                  ? "border-red-500 focus:ring-red-500"
                  : "border-blue-800/30 focus:ring-blue-500"
              }`}
            />
            {errors.edad && (
              <p className="text-red-400 text-sm mt-1">{errors.edad}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 transition-all text-white py-2 font-bold shadow-md border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Guardar cambios
        </button>

        {msg && <p className="text-center text-blue-300">{msg}</p>}
        {errorGeo && <p className="text-center text-red-300">{errorGeo}</p>}
      </form>

      {user.wildcards && user.wildcards.length > 0 && (
        <div className="w-full max-w-md mx-auto mt-8 bg-neutral-800/70 rounded-xl p-6 shadow-lg border border-blue-800/30">
          <h3 className="text-blue-200 font-bold mb-4 text-lg">Editar Wildcard</h3>
          {user.wildcards.map((wc: any) => (
            <WildcardEditForm key={wc.id} wildcard={wc} />
          ))}
        </div>
      )}
    </div>
  );
}

function WildcardEditForm({ wildcard }: { wildcard: any }) {
  const [nombreArtistico, setNombreArtistico] = useState(
    wildcard.nombreArtistico || ""
  );
  const [youtubeUrl, setYoutubeUrl] = useState(wildcard.youtubeUrl || "");
  const [msg, setMsg] = useState("");
  const [errMsg, setErrMsg] = useState(""); // Estado separado para errores

  // 1. Leemos la fecha límite que cargamos desde la página
  // El 'wildcard.evento' ahora existe gracias al Paso 1
  const deadline = wildcard.evento?.wildcardDeadline
    ? new Date(wildcard.evento.wildcardDeadline)
    : null;
  
  // 2. Verificamos si la edición está permitida
  // (La wildcard también debe estar 'PENDING', como chequea tu API)
  const isEditingAllowed =
    (!deadline || new Date() < deadline) && wildcard.status === "PENDING";
  
  // 3. Mensaje de por qué está deshabilitado
  const disabledMessage =
    wildcard.status !== "PENDING"
      ? "Tu wildcard ya fue revisada."
      : "La fecha límite para editar ya pasó.";

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMsg("");
    setErrMsg("");

    const res = await fetch("/api/wildcard", {
      method: "PUT",
      body: JSON.stringify({ id: wildcard.id, nombreArtistico, youtubeUrl }),
      headers: { "Content-Type": "application/json" },
    });

    // 4. Mejoramos el manejo de mensajes
    if (res.ok) {
      setMsg("Wildcard actualizada correctamente");
    } else {
      // Mostramos el error real que envía el backend
      const data = await res.json();
      setErrMsg(data.error || "Error al actualizar wildcard");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {wildcard.evento?.nombre && (
        <p className="text-sm text-center text-blue-300 -mb-1">
          Evento: <span className="font-semibold">{wildcard.evento.nombre}</span>
        </p>
      )}
      <input
        value={nombreArtistico}
        onChange={(e) => setNombreArtistico(e.target.value)}
        placeholder="Nombre artístico"
        className="rounded-lg bg-neutral-900/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!isEditingAllowed} // 5. Deshabilitar input
      />
  _    <input
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        placeholder="Link del video (YouTube)"
        className="rounded-lg bg-neutral-900/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!isEditingAllowed} // 6. Deshabilitar input
      />
      <button
        type="submit"
        className="rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 transition-all text-white py-2 font-bold shadow-md border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-500"
        disabled={!isEditingAllowed} // 7. Deshabilitar botón
      >
        {isEditingAllowed ? "Guardar cambios" : "Edición cerrada"}
      </button>
      
      {msg && <p className="text-center text-green-400 text-sm">{msg}</p>}
      {errMsg && <p className="text-center text-red-400 text-sm">{errMsg}</p>}
      
      {/* 8. Mensaje claro de por qué está deshabilitado */}
      {!isEditingAllowed && (
        <p className="text-center text-yellow-400 text-xs mt-2">
          {disabledMessage}
        </p>
      )}
    </form>
  );
}

// Utilidad para calcular birthDate desde edad (aprox. al 1 de enero)
function calcularBirthDateDesdeEdad(edad: number) {
  const hoy = new Date();
  return new Date(hoy.getFullYear() - edad, 0, 1).toISOString();
}