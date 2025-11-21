'use client';

import Link from 'next/link';
import { FaInstagram } from 'react-icons/fa';
import Image from 'next/image';

/**
 * Componente de barra de ecualizador animada
 * Representa una sola barra del visualizador.
 */
const SoundBar = ({ height, delay }: { height: string; delay: string }) => (
  <div
    className={`w-1.5 ${height} bg-gradient-to-t from-blue-600 to-blue-400 rounded-full`}
    style={{
      animation: `pulse-beat 1.2s infinite ease-in-out ${delay}`,
      // Definimos la animación en el 'style' para que Tailwind no la purgue
      // (En una app real, esto iría en global.css)
    }}
  />
);

export default function Footer() {
  return (
    <>
      {/* Definición de la animación (requerido para que funcione) */}
      <style>{`
        @keyframes pulse-beat {
          0%, 100% { transform: scaleY(0.1); opacity: 0.3; }
          50% { transform: scaleY(1.0); opacity: 1; }
        }
      `}</style>

      {/* --- EL FOOTER --- */}
      <footer className="w-full text-white mt-24 
        bg-gradient-to-t from-black via-blue-950 to-blue-950 
        border-t border-blue-700/50 pt-16 pb-12">
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {/* --- Sección Superior: Logo y Links --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 items-center justify-center">
            
            {/* Columna 1: Marca */}
            <div className="md:col-span-1 flex flex-col items-center">
              <Link href="/" className="inline-block">
                
                {/* --- 2. Aquí está el componente Image --- */}
                <Image
                  // El 'src' es la ruta RELATIVA a la carpeta 'public'
                  src="https://res.cloudinary.com/dfd1byvwn/image/upload/v1763744966/ISOTIPO_aql89l.webp" 
                  alt="Logo Beatbox Chile"
                  // Debes definir el tamaño real de tu logo (o el tamaño que quieres que renderice)
                  width={250} // Ejemplo: 250px de ancho
                  height={80} // Ejemplo: 80px de alto
                  priority // <-- (Opcional) Añade 'priority' si el logo está en el header para precargarlo
                  className="h-auto" // (Opcional) 'h-auto' mantiene el aspect ratio si solo defines 'width'
                />

              </Link>
              <p className="text-blue-300/80 mt-3 text-lg">
                Beatbox Chile.
              </p>
              <p className="text-blue-300/80 mt-3 text-lg">
                Comunidad, cultura y competencia.
              </p>
            </div>

            {/* Columna 2: Navegación (Enlaces de ejemplo) */}
            <div className="md:col-span-1 flex flex-col items-center justify-center">
              <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Explora
              </h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/eventos" className="text-base text-white hover:text-blue-300 transition-colors">Eventos</Link></li>
                <li><Link href="/estadisticas" className="text-base text-white hover:text-blue-300 transition-colors">Rankings</Link></li>
                <li><Link href="/historial-competitivo" className="text-base text-white hover:text-blue-300 transition-colors">Historial</Link></li>
              </ul>
            </div>

            {/* Columna 3: Social */}
            <div className="md:col-span-1 flex flex-col items-center justify-center">
              <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Síguenos
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link 
                    href="https://www.instagram.com/beatbox.chile?igsh=MXZqYXRmYmNic2ZidQ=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-base text-white hover:text-blue-300 transition-colors"
                  >
                    <FaInstagram className="w-5 h-5" />
                    Instagram
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* --- Sección Media: El Ecualizador (El "Woooow") --- */}
          <div className="w-full flex justify-center items-baseline gap-1.5 h-20 my-12">
            <SoundBar height="h-4" delay="0s" />
            <SoundBar height="h-10" delay="-0.1s" />
            <SoundBar height="h-16" delay="-0.2s" />
            <SoundBar height="h-8" delay="-0.3s" />
            <SoundBar height="h-12" delay="-0.4s" />
            <SoundBar height="h-6" delay="-0.5s" />
            <SoundBar height="h-14" delay="-0.6s" />
            <SoundBar height="h-8" delay="-0.7s" />
            <SoundBar height="h-16" delay="-0.8s" />
            <SoundBar height="h-10" delay="-0.9s" />
            <SoundBar height="h-4" delay="-1.0s" />
            <SoundBar height="h-8" delay="-0.5s" />
            <SoundBar height="h-14" delay="-0.6s" />
            <SoundBar height="h-6" delay="-0.7s" />
            <SoundBar height="h-12" delay="-0.4s" />
          </div>

          {/* --- Sección Inferior: Copyright --- */}
          <div className="border-t border-blue-700/30 pt-8 text-center">
            <p className="text-xs text-blue-400/60">
              © {new Date().getFullYear()} BEATBOX CHILE. Ecosistema digital construido por dronerdev y alexanderdev.
            </p>
          </div>

        </div>
      </footer>
    </>
  );
}