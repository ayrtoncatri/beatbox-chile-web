"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

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
    <section className="group relative isolate min-h-[680px] overflow-hidden border-b border-cyan-200/20 sm:min-h-[760px] lg:min-h-[820px]">
      {IMAGES.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="100vw"
            className="scale-105 object-cover object-[center_18%] sm:object-center"
            priority={index === 0}
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,13,0.55)_0%,rgba(5,6,13,0.42)_40%,rgba(5,6,13,0.88)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.22),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(232,121,249,0.28),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(88,28,135,0.35),transparent_42%)]" />

      <div className="pointer-events-none absolute left-4 top-6 h-16 w-16 border-l-2 border-t-2 border-cyan-300/80 sm:left-8 sm:top-10" />
      <div className="pointer-events-none absolute right-4 top-6 h-16 w-16 border-r-2 border-t-2 border-fuchsia-300/80 sm:right-8 sm:top-10" />
      <div className="pointer-events-none absolute bottom-6 left-4 h-16 w-16 border-b-2 border-l-2 border-fuchsia-300/50 sm:bottom-10 sm:left-8" />
      <div className="pointer-events-none absolute bottom-6 right-4 h-16 w-16 border-b-2 border-r-2 border-cyan-300/50 sm:bottom-10 sm:right-8" />

      <div className="relative z-10 mx-auto flex min-h-[680px] max-w-5xl flex-col items-center justify-center px-5 py-28 text-center sm:min-h-[760px] sm:px-8 lg:min-h-[820px]">
        <p className="mb-5 inline-flex border border-cyan-300/50 bg-black/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.25)] backdrop-blur-sm">
          Asociación Nacional de Beatbox Profesional
        </p>
        <h1 className="home-title text-[4.6rem] text-white drop-shadow-[0_0_34px_rgba(34,211,238,0.45)] sm:text-8xl md:text-9xl lg:text-[8.8rem]">
          Beatbox
          <span className="block text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-white to-fuchsia-300">
            Chile
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-sm font-bold uppercase tracking-[0.22em] text-white/85 sm:text-base">
          La plataforma de competencias, cultura y comunidad para la escena beatbox nacional.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/eventos" className="home-cta gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200">
            Ver próximos eventos <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/historial-competitivo"
            className="inline-flex min-h-12 items-center border border-white/40 bg-black/35 px-5 text-sm font-black uppercase tracking-[0.13em] text-white backdrop-blur-sm transition hover:border-fuchsia-200 hover:bg-fuchsia-300/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fuchsia-200"
          >
            Hall of Fame
          </Link>
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute bottom-7 right-20 z-20 flex h-11 w-11 items-center justify-center border border-cyan-200/40 bg-black/45 text-white backdrop-blur-sm transition hover:border-cyan-200 hover:text-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 sm:bottom-9 sm:right-24"
        aria-label="Imagen anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute bottom-7 right-5 z-20 flex h-11 w-11 items-center justify-center border border-cyan-200/40 bg-black/45 text-white backdrop-blur-sm transition hover:border-cyan-200 hover:text-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 sm:bottom-9 sm:right-8"
        aria-label="Siguiente imagen"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-9 left-5 z-20 flex gap-2 sm:left-8">
        {IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 transition-all duration-300 ${
              index === currentIndex ? "w-10 bg-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.9)]" : "w-4 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Ir a la imagen ${index + 1}`}
            aria-current={index === currentIndex}
          />
        ))}
      </div>
    </section>
  );
}
