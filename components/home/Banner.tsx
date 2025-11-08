import Image from "next/image";

export default function Banner() {
  return (
    <section className="relative h-[340px] bg-gradient-to-br from-blue-900 to-black rounded-2xl flex items-center justify-center mb-8 shadow-lg overflow-hidden">
      {/* Imagen de fondo superpuesta (usa la imagen que subiste o cualquier link temporal) */}
      <Image
        src="/new-banner-bbx.webp" // Usa la imagen dummy o reemplaza por "/banner.jpg"
        alt="Banner Beatbox Chile"
        fill
        className="object-cover opacity-60"
        priority
      />
      <div className="z-10 text-center">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg tracking-tight mb-3">
          Beatbox Chile
        </h1>
        <p className="text-lg text-blue-100 font-medium drop-shadow-sm">
          Comunidad, torneos, cultura y pasión por el beatbox.
        </p>
      </div>
    </section>
  );
}
