"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const IMAGES = [
  "https://res.cloudinary.com/dfd1byvwn/image/upload/v1783392250/ANBP-1_r1n9vh.png",
  "https://res.cloudinary.com/dfd1byvwn/image/upload/v1783392302/ANBP-2_urtybf.png",
  "https://res.cloudinary.com/dfd1byvwn/image/upload/v1783392690/ANBP-3_wvtmmq.jpg",
];

export default function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? IMAGES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === IMAGES.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <section className="group relative h-[340px] bg-gradient-to-br from-blue-900 to-black rounded-2xl flex items-center justify-center mb-8 shadow-lg overflow-hidden">
      
      {/* Contenedor de Imágenes */}
      {IMAGES.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-60" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt={`Banner Beatbox Chile ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}

      {/* Contenido de Texto */}
      <div className="z-10 text-center pointer-events-none px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg tracking-tight mb-3 uppercase">
          asociación nacional de beatbox profesional
        </h1>
        <p className="text-lg text-blue-100 font-medium drop-shadow-sm">
          Comunidad, torneos, cultura y pasión por el beatbox.
        </p>
      </div>

      {/* Botón Izquierdo */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none"
        aria-label="Imagen anterior"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Botón Derecho */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none"
        aria-label="Siguiente imagen"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white w-4" : "bg-white/50"
            }`}
            aria-label={`Ir a la imagen ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}