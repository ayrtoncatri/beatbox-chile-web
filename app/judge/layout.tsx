import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import JudgeTopbar from "@/components/judge/JudgeTopbar";

export const metadata = {
  title: "Panel de Juez | Beatbox Chile",
};

export default async function JudgeLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0a0f] text-white">
      {/* Capa 1: degradado urbano tipo neón */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(120% 80% at 0% 0%, rgba(124,58,237,0.15), transparent 70%),
            radial-gradient(110% 80% at 100% 0%, rgba(56,189,248,0.12), transparent 70%),
            radial-gradient(100% 80% at 50% 100%, rgba(2,132,199,0.10), transparent 80%)
          `,
        }}
      />

      {/* Capa 2: textura de muro urbano con grano sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[.10] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='linear' slope='0.6'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Contenido del panel */}
      <JudgeTopbar user={session?.user ?? null} />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
