import Image from 'next/image';
import Link from 'next/link';
import { FaInstagram } from 'react-icons/fa';

const waveHeights = [
  8, 10, 14, 20, 12, 18, 30, 52, 30, 20, 26, 18, 14, 22, 34, 20, 14, 28,
  44, 30, 20, 34, 52, 26, 16, 12, 18, 10, 8,
];
const wavePattern = [...waveHeights, ...waveHeights.slice(4, -2).reverse()];

const navigation = [
  { label: 'Eventos', href: '/eventos' },
  { label: 'Rankings', href: '/estadisticas' },
  { label: 'Historial', href: '/historial-competitivo' },
  { label: 'Privacidad', href: '/privacidad' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-cyan-300/15 bg-[#03050a] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_30%,rgba(34,211,238,0.14),transparent_34%),radial-gradient(circle_at_100%_24%,rgba(232,121,249,0.14),transparent_35%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.06)_0,rgba(255,255,255,0.06)_1px,transparent_1px,transparent_7px)]" />

        <div className="relative mx-auto max-w-[1500px] px-3 pt-5 sm:px-6 sm:pt-8 lg:px-8">
          <div className="rounded-[28px] bg-linear-to-r from-cyan-300/80 via-violet-400/45 to-fuchsia-400/80 p-px shadow-[0_0_32px_rgba(34,211,238,0.12),0_0_40px_rgba(232,121,249,0.1)] sm:rounded-[36px]">
            <div className="relative overflow-hidden rounded-[27px] bg-[#070a10]/95 px-5 py-10 sm:rounded-[35px] sm:px-10 sm:py-12 lg:px-16 lg:py-14">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(34,211,238,0.04),transparent_35%,rgba(232,121,249,0.05))]" />

              <div className="relative grid gap-10 text-center md:grid-cols-[1.15fr_0.7fr_1.15fr] md:items-center md:gap-8 lg:gap-16">
                <div className="flex flex-col items-center">
                  <Link
                    href="/"
                    aria-label="Ir al inicio de Beatbox Chile"
                    className="group rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
                  >
                    <div className="relative">
                      <div className="absolute -inset-4 rounded-full bg-linear-to-br from-cyan-400/20 to-fuchsia-500/20 blur-2xl transition-opacity group-hover:opacity-100" />
                      <Image
                        src="https://res.cloudinary.com/dfd1byvwn/image/upload/v1763744966/ISOTIPO_aql89l.webp"
                        alt="Logo Beatbox Chile"
                        width={150}
                        height={150}
                        className="relative h-28 w-28 rounded-full border border-white/15 object-cover drop-shadow-[0_0_16px_rgba(34,211,238,0.45)] transition-transform duration-300 group-hover:scale-[1.03] sm:h-32 sm:w-32"
                      />
                    </div>
                  </Link>
                  <h2 className="mt-5 text-4xl leading-none text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                    Beatbox Chile.
                  </h2>
                  <p className="mt-2 text-sm font-bold tracking-wide text-fuchsia-100/90 sm:text-base">
                    Comunidad, cultura y competencia.
                  </p>
                </div>

                <nav aria-label="Navegación del pie de página">
                  <ul className="flex flex-col items-center gap-2">
                    {navigation.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="inline-block px-3 py-1 font-heading text-4xl font-bold uppercase italic leading-none tracking-wide text-white drop-shadow-[2px_2px_0_rgba(232,121,249,0.45)] transition hover:text-cyan-200 hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.65)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 lg:text-5xl"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="flex justify-center">
                  <div className="group relative w-full max-w-[260px] rounded-2xl bg-linear-to-br from-cyan-300/70 via-white/10 to-fuchsia-400/70 p-px shadow-[0_0_24px_rgba(34,211,238,0.12),0_0_28px_rgba(232,121,249,0.12)]">
                    <div className="relative overflow-hidden rounded-[15px] bg-[#0b0d15]/95 px-6 py-7">
                      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-fuchsia-500/15 blur-2xl" />
                      <p className="font-heading text-xl font-bold uppercase tracking-wider text-white">
                        Síguenos
                      </p>
                      <Link
                        href="https://www.instagram.com/beatbox.chile?igsh=MXZqYXRmYmNic2ZidQ=="
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Seguir a Beatbox Chile en Instagram"
                        className="mt-5 inline-flex min-h-14 items-center gap-3 rounded-xl border border-fuchsia-300/35 bg-black/30 px-5 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_0_20px_rgba(232,121,249,0.18)] transition hover:border-cyan-300/70 hover:text-cyan-100 hover:shadow-[0_0_26px_rgba(34,211,238,0.3)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fuchsia-300"
                      >
                        <FaInstagram
                          aria-hidden="true"
                          className="h-8 w-8 text-fuchsia-300 drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]"
                        />
                        Instagram
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="relative mt-12 flex h-20 w-full items-center justify-center gap-[3px] sm:mt-14 sm:gap-1"
              >
                <span className="h-px w-6 shrink-0 bg-linear-to-r from-transparent to-cyan-300/80 sm:w-12" />
                {wavePattern.map((height, index) => (
                  <span
                    key={`${height}-${index}`}
                    className="footer-wave-bar min-w-px max-w-1.5 flex-1 rounded-full bg-cyan-300 shadow-[0_0_7px_rgba(34,211,238,0.9)]"
                    style={{
                      height,
                      animation: `footer-wave 1.5s ease-in-out ${index * -0.055}s infinite`,
                    }}
                  />
                ))}
                <span className="h-px w-6 shrink-0 bg-linear-to-l from-transparent to-cyan-300/80 sm:w-12" />
              </div>
            </div>
          </div>

          <div className="space-y-1 py-4 text-center sm:py-5">
            <p className="text-[10px] leading-5 font-medium tracking-wide text-white/55 sm:text-xs">
              © {new Date().getFullYear()} BEATBOX CHILE. Ecosistema digital construido por dronerdev y alexanderdev.
            </p>
            <p className="text-[10px] text-white/45 sm:text-xs">
              <Link href="/privacidad" className="underline-offset-2 hover:text-cyan-200 hover:underline">
                Politica de privacidad
              </Link>
              {" · "}
              <Link href="/privacidad/derechos" className="underline-offset-2 hover:text-cyan-200 hover:underline">
                Ejercer derechos
              </Link>
            </p>
          </div>
        </div>
    </footer>
  );
}