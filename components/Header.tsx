import Link from "next/link";
import Image from "next/image";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Historial competitivo", href: "/historial-competitivo" },
  { label: "Estadísticas", href: "/estadisticas" },
  { label: "Wildcard", href: "/wildcard" },
  { label: "Quiénes Somos", href: "/quienes-somos" },
  { label: "Liga competitiva", href: "/liga-competitiva" },
  { label: "Liga Terapéutica", href: "/liga-terapeutica" }
];

export default function Header() {
  return (
    <header className="w-full bg-neutral-950 bg-opacity-90 py-3 shadow-md">
      <nav className="max-w-4xl mx-auto px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Image
            src="/ISOTIPO-DEGRADADO.png"
            alt="Logo Beatbox Chile"
            width={50}
            height={50}
            className="rounded-full border-2 border-blue-700 shadow"
            priority
          />
          <span className="text-xl text-blue-100 font-extrabold tracking-tight">Beatbox Chile</span>
        </div>
        <ul className="flex gap-6 justify-center items-center">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-blue-100 font-semibold hover:text-blue-400 transition"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
