"use client";

import Image from "next/image";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  createPublicacion,
  editPublicacion,
  type PublicacionActionState,
} from "@/app/admin/publicaciones/actions";
import {
  PublicationStatus,
  PublicationType,
  Publicacion,
} from "@prisma/client";

type Props = {
  mode: "create" | "edit";
  publicacion?: Publicacion;
};

const initialState: PublicacionActionState = {
  ok: false,
  error: "",
};

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 font-semibold text-white shadow-lg transition hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60"
    >
      {pending
        ? "Guardando..."
        : mode === "create"
        ? "Crear publicación"
        : "Guardar cambios"}
    </button>
  );
}

function toDatetimeLocal(date: Date | string) {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function parseGaleriaPreview(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatFechaPreview(fecha?: string) {
  if (!fecha) return "";
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function PublicacionForm({ mode, publicacion }: Props) {
  const action = mode === "create" ? createPublicacion : editPublicacion;
  const [state, formAction] = useActionState(action, initialState);

  const [titulo, setTitulo] = useState(publicacion?.titulo ?? "");
  const [autor, setAutor] = useState(publicacion?.autor ?? "");
  const [tipo, setTipo] = useState<PublicationType>(
    publicacion?.tipo ?? PublicationType.noticia
  );
  const [fecha, setFecha] = useState(
    publicacion?.fecha ? toDatetimeLocal(publicacion.fecha) : ""
  );
  const [estado, setEstado] = useState<PublicationStatus>(
    publicacion?.estado ?? PublicationStatus.borrador
  );
  const [url, setUrl] = useState(publicacion?.url ?? "");
  const [descripcion, setDescripcion] = useState(publicacion?.descripcion ?? "");
  const [imagenPortada, setImagenPortada] = useState(
    publicacion?.imagenes?.[0] ?? ""
  );
  const [imagenesGaleria, setImagenesGaleria] = useState(
    publicacion?.imagenes?.slice(1).join("\n") ?? ""
  );

  const galeriaPreview = useMemo(
    () => parseGaleriaPreview(imagenesGaleria),
    [imagenesGaleria]
  );

  const fechaPreview = formatFechaPreview(fecha);

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-5">
        {mode === "edit" && (
          <input type="hidden" name="id" value={publicacion?.id} />
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-blue-100">
              Título *
            </label>
            <input
              type="text"
              name="titulo"
              required
              maxLength={200}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Beatbox Chile anuncia nueva fecha de competencia"
              className="w-full rounded-xl border border-blue-700/40 bg-blue-950/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-blue-100">
              Autor *
            </label>
            <input
              type="text"
              name="autor"
              required
              maxLength={120}
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              placeholder="Ej: Beatbox Chile"
              className="w-full rounded-xl border border-blue-700/40 bg-blue-950/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-blue-100">
              Tipo *
            </label>
            <select
              name="tipo"
              required
              value={tipo}
              onChange={(e) => setTipo(e.target.value as PublicationType)}
              className="w-full rounded-xl border border-blue-700/40 bg-blue-950/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            >
              <option value={PublicationType.noticia}>Noticia</option>
              <option value={PublicationType.blog}>Blog</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-blue-100">
              Fecha *
            </label>
            <input
              type="datetime-local"
              name="fecha"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-xl border border-blue-700/40 bg-blue-950/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-blue-100">
              Estado *
            </label>
            <select
              name="estado"
              required
              value={estado}
              onChange={(e) => setEstado(e.target.value as PublicationStatus)}
              className="w-full rounded-xl border border-blue-700/40 bg-blue-950/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            >
              <option value={PublicationStatus.borrador}>Borrador</option>
              <option value={PublicationStatus.publicado}>Publicado</option>
              <option value={PublicationStatus.archivado}>Archivado</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-blue-100">
              URL relacionada
            </label>
            <input
              type="url"
              name="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-blue-700/40 bg-blue-950/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />
            <div className="mt-2 rounded-lg border border-cyan-400/20 bg-cyan-500/5 px-3 py-2 text-xs text-blue-100/80">
              <p className="font-semibold text-cyan-200">
                ¿Para qué sirve este campo?
              </p>
              <p>
                Este enlace es opcional y se usa como <strong>URL externa relacionada</strong>.
                Por ejemplo: una fuente, publicación original, referencia, sitio oficial o contenido complementario.
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-blue-100">
              Descripción / contenido
            </label>
            <textarea
              name="descripcion"
              rows={8}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Escribe aquí el contenido de la noticia o blog..."
              className="w-full rounded-xl border border-blue-700/40 bg-blue-950/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-blue-100">
              Imagen de portada *
            </label>
            <input
              type="url"
              name="imagenPortada"
              required
              value={imagenPortada}
              onChange={(e) => setImagenPortada(e.target.value)}
              placeholder="https://ejemplo.com/portada.jpg"
              className="w-full rounded-xl border border-blue-700/40 bg-blue-950/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />
            <div className="mt-2 rounded-lg border border-blue-400/20 bg-blue-500/5 px-3 py-2 text-xs text-blue-100/80">
              <p className="font-semibold text-cyan-200">
                ¿Dónde se verá esta imagen?
              </p>
              <p>
                Esta imagen se mostrará en el <strong>home</strong> como portada de la card
                y también en la <strong>cabecera</strong> de la publicación completa.
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-blue-100">
              Imágenes de galería
            </label>
            <textarea
              name="imagenesGaleria"
              rows={5}
              value={imagenesGaleria}
              onChange={(e) => setImagenesGaleria(e.target.value)}
              placeholder={`https://ejemplo.com/galeria-1.jpg
https://ejemplo.com/galeria-2.jpg`}
              className="w-full rounded-xl border border-blue-700/40 bg-blue-950/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />
            <div className="mt-2 rounded-lg border border-blue-400/20 bg-blue-500/5 px-3 py-3 text-xs text-blue-100/80 space-y-1">
              <p className="font-semibold text-cyan-200">
                ¿Cómo se usan estas URLs?
              </p>
              <p>
                Estas imágenes se mostrarán debajo del contenido como <strong>galería</strong>.
              </p>
              <p>
                Si no agregas ninguna, la publicación solo mostrará la portada.
              </p>
            </div>
          </div>
        </div>

        {state?.error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {state.error}
          </div>
        ) : null}

        <div className="flex items-center justify-end">
          <SubmitButton mode={mode} />
        </div>
      </form>

      <section className="rounded-2xl border border-cyan-400/20 bg-blue-950/30 p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold uppercase tracking-wide text-white">
            Vista previa
          </h2>
          <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
            {tipo}
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-blue-700/20 bg-slate-950/60">
          <div className="relative h-52 w-full bg-slate-900 sm:h-64">
            {imagenPortada ? (
              <Image
                src={imagenPortada}
                alt={titulo || "Vista previa de portada"}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-blue-200/60">
                Sin imagen de portada
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>

          <div className="space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-3 text-xs text-blue-100/70">
              <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 uppercase tracking-wider">
                {tipo}
              </span>
              {fechaPreview ? <span>{fechaPreview}</span> : null}
              {autor ? <span>Por {autor}</span> : null}
              {estado ? (
                <span className="capitalize text-cyan-200">{estado}</span>
              ) : null}
            </div>

            <h3 className="text-2xl font-black uppercase tracking-wide text-white">
              {titulo || "Título de la publicación"}
            </h3>

            <p className="whitespace-pre-line text-sm leading-7 text-blue-50/85 sm:text-base">
              {descripcion || "Aquí se verá el contenido o resumen de la publicación."}
            </p>

            {url ? (
              <div>
                <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                  Tiene URL relacionada
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">
              Vista previa de galería
            </h3>
            <span className="text-xs text-blue-200/70">
              {galeriaPreview.length} imagen{galeriaPreview.length === 1 ? "" : "es"}
            </span>
          </div>

          {galeriaPreview.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galeriaPreview.map((img, index) => (
                <div
                  key={`${img}-${index}`}
                  className="overflow-hidden rounded-2xl border border-blue-700/20 bg-slate-950/60"
                >
                  <div className="relative h-40 w-full">
                    <Image
                      src={img}
                      alt={`Galería ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-blue-700/30 bg-slate-950/40 px-4 py-6 text-center text-sm text-blue-200/60">
              Aún no hay imágenes de galería.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}