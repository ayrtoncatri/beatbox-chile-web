import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TicketIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

export default async function Anuncios() {
  
  // 1. BUSCAR EL EVENTO AUTOMÁTICAMENTE
  // Buscamos el evento publicado más reciente que parezca ser el "Nacional"
  const eventoNacional = await prisma.evento.findFirst({
    where: {
      isPublished: true,
      // Ajusta esto si tu Tipo se llama diferente, o busca por nombre:
      // nombre: { contains: 'Campeonato Nacional', mode: 'insensitive' }
      tipo: {
        name: 'Campeonato Nacional' 
      }
    },
    orderBy: {
      fecha: 'desc' // El más futuro/reciente
    },
    select: {
      id: true
    }
  });

  // Link externo de venta
  const TICKET_URL = "https://californiacantina.evently.cl/7a-Edicion-de-la-Final-Nacional-de-Beatbox-Chile-13-12-2025";
  
  // Link interno dinámico (si no encuentra el evento, lleva al listado general)
  const INFO_URL = eventoNacional ? `/eventos/${eventoNacional.id}` : '/eventos';

  return (
    <section className="relative my-10 w-full group">
      
      {/* --- EFECTOS DE FONDO (GLOW) --- */}
      <div className="absolute -top-4 -left-4 w-32 h-32 bg-red-600/30 rounded-full blur-3xl group-hover:bg-red-600/40 transition-all" />
      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-600/30 rounded-full blur-3xl group-hover:bg-blue-600/40 transition-all" />

      {/* --- CONTENEDOR PRINCIPAL --- */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c12] shadow-2xl">
        
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 via-transparent to-blue-900/10" />
        
        <div className="relative flex flex-col md:flex-row items-center justify-between p-6 md:p-10 gap-8">
          
          {/* 1. CONTENIDO DE TEXTO */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                Anuncio Oficial
              </span>
            </div>

            <div>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
                Campeonato <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">
                   Nacional 2025
                </span>
              </h2>
              <p className="mt-4 text-gray-300 text-sm md:text-base font-medium leading-relaxed max-w-xl">
                La batalla definitiva por el título chileno ya tiene fecha. 
                Prepárate para vivir la <span className="text-white font-bold">7ª Edición</span> con los mejores exponentes del país.
              </p>
            </div>
          </div>

          {/* 2. BOTONES DE ACCIÓN (CTA) */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            
            {/* BOTÓN DE TICKETS (EXTERNO) */}
            <a 
              href={TICKET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-xl bg-white px-8 py-4 text-black transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] text-center"
            >
              <div className="relative z-10 flex items-center justify-center gap-2 font-black uppercase tracking-wide text-sm">
                <TicketIcon className="w-5 h-5" />
                <span>Comprar Entradas</span>
              </div>
              {/* Efecto Shimmer */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-200/50 to-transparent z-0" />
            </a>

            {/* BOTÓN DE INFO (DINÁMICO INTERNO) */}
            <Link 
              href={INFO_URL}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-white transition-all hover:bg-white/10 hover:border-white/30"
            >
              <span className="font-bold uppercase tracking-wide text-sm">Más Info</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
}