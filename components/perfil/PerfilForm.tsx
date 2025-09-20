"use client";
import { useState } from "react";
import Image from "next/image";

export default function PerfilForm({ user }: { user: any }) {
  const [form, setForm] = useState({
    nombres: user.nombres || "",
    apellidoPaterno: user.apellidoPaterno || "",
    apellidoMaterno: user.apellidoMaterno || "",
    region: user.region || "",
    comuna: user.comuna || "",
    edad: user.edad || "",
  });
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateEdad = (edad: string) => {
    if (!edad || edad.trim() === "") {
      return "La edad es requerida";
    }
    const edadNum = parseInt(edad);
    if (isNaN(edadNum)) {
      return "La edad debe ser un número válido";
    }
    if (edadNum < 10) {
      return "La edad mínima es 10 años";
    }
    if (edadNum > 80) {
      return "La edad máxima es 80 años";
    }
    return "";
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    
    // Validar edad en tiempo real
    if (name === "edad") {
      const error = validateEdad(value);
      setErrors(prev => ({ ...prev, edad: error }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMsg("");
    setErrors({});
    
    // Validar edad antes de enviar
    const edadError = validateEdad(form.edad);
    if (edadError) {
      setErrors({ edad: edadError });
      return;
    }
    
    const res = await fetch("/api/user/update", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });
    
    const data = await res.json();
    if (res.ok) {
      setMsg("Perfil actualizado correctamente");
    } else {
      setMsg(data.error || "Error al actualizar perfil");
    }
  };

  // Genera las iniciales para el avatar
  const avatarName =
    (form.nombres ? form.nombres.split(" ")[0] : "") +
    (form.apellidoPaterno ? " " + form.apellidoPaterno : "");

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
              `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName || user.email || "U")}&background=3b82f6&color=fff&size=128`
            }
            alt="Imagen de perfil"
            width={112}
            height={112}
            className="rounded-full object-cover border-4 border-blue-700 shadow-lg transition-all"
            priority
          />
          <span className="text-blue-100 font-semibold text-lg mt-2 break-all text-center">{user.email}</span>
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
            <input
              name="region"
              value={form.region}
              onChange={handleChange}
              placeholder="Región"
              className="w-full md:w-1/2 rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <input
              name="comuna"
              value={form.comuna}
              onChange={handleChange}
              placeholder="Comuna"
              className="w-full md:w-1/2 rounded-lg bg-neutral-800/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
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
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-blue-800/30 focus:ring-blue-500'
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
      </form>

      {/* Wildcard Edit Section */}
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

// Componente para editar una wildcard
function WildcardEditForm({ wildcard }: { wildcard: any }) {
  const [nombreArtistico, setNombreArtistico] = useState(wildcard.nombreArtistico || "");
  const [youtubeUrl, setYoutubeUrl] = useState(wildcard.youtubeUrl || "");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/wildcard", {
      method: "PUT",
      body: JSON.stringify({ id: wildcard.id, nombreArtistico, youtubeUrl }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) setMsg("Wildcard actualizada correctamente");
    else setMsg("Error al actualizar wildcard");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        value={nombreArtistico}
        onChange={(e) => setNombreArtistico(e.target.value)}
        placeholder="Nombre artístico"
        className="rounded-lg bg-neutral-900/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />
      <input
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        placeholder="Link del video (YouTube)"
        className="rounded-lg bg-neutral-900/80 border border-blue-800/30 px-4 py-2 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />
      <button
        type="submit"
        className="rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 transition-all text-white py-2 font-bold shadow-md border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Guardar cambios
      </button>
      {msg && <p className="text-blue-300">{msg}</p>}
    </form>
  );
}
