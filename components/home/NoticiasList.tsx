import Image from "next/image";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";

const noticias = [
  {
    id: 1,
    title: "Información Campeonato Nacional 2025",
    excerpt: "Detalles, fechas y sedes confirmadas para la gran final nacional en Eventos.",
    img: "nacional-2025.avif", 
    date: "13 Dic 2025",
    category: "Torneos"
  },
  // Agrego duplicados para que veas el efecto de la grilla en el ejemplo
  {
    id: 2,
    title: "Clasificados Tag Team",
    excerpt: "Conoce a las duplas que disputarán el título este año.",
    img: "clasificados-tagteam.webp", // Asegúrate de tener la imagen o usa un placeholder
    date: "10 Dic 2025",
    category: "Información"
  },
  {
    id: 3,
    title: "Clasificados Solo",
    excerpt: "La lista oficial de los 16 mejores beatboxers de Chile.",
    img: "clasificados-solo.webp",
    date: "08 Dic 2025",
    category: "Información"
  },
];

export default function NoticiasList() {
  return (
    <section className="py-8">
      {/* Encabezado: También lo limitamos al ancho máximo para que se alinee con la grilla */}
      <div className="flex items-center justify-center mb-8 max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
          Últimas <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-fuchsia-500">Noticias</span>
        </h2>
      </div>

      {/* CAMBIO CLAVE EN EL GRID:
         1. 'max-w-6xl': Limita el ancho total del bloque (aprox 1150px).
         2. 'mx-auto': Centra el bloque en la pantalla.
         3. 'justify-items-center': Asegura que las tarjetas estén centradas en sus columnas.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 justify-items-center">
        {noticias.map((n) => (
          <article 
            key={n.id} 
            // Mantenemos el max-w-[360px] para que la tarjeta individual no sea gigante
            className="flex flex-col w-full max-w-[360px] bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-blue-900/20 transition-all duration-300 group"
          >
            
            {/* Formato Vertical (Poster) */}
            <div className="relative w-full aspect-[3/4] bg-[#1a1a1a]">
              <Image
                src={`/${n.img}`}
                alt={n.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 360px"
              />
              
              {/* Badge */}
              <span className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg">
                {n.category}
              </span>
            </div>

            {/* Contenido */}
            <div className="flex flex-col p-5 border-t border-white/5 bg-[#0a0a0a] flex-1">
              <div className="flex items-center gap-2 text-xs text-blue-400 mb-2 font-medium">
                <CalendarDaysIcon className="w-4 h-4" />
                <span>{n.date}</span>
              </div>
              <h3 className="text-lg font-black text-white uppercase leading-tight mb-2 group-hover:text-blue-400 transition-colors">
                {n.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                {n.excerpt}
              </p>
            </div>

          </article>
        ))}
      </div>
    </section>
  );
}