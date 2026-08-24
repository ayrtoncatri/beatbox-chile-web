import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PerfilForm from "@/components/perfil/PerfilForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return <div className="text-center mt-10 text-red-400">Debes iniciar sesión para ver tu perfil.</div>;
  }

  // 1. Cargamos todo en paralelo: Usuario, Regiones y Comunas
  const [user, regiones, comunas] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: {
          include: {
            comuna: { include: { region: true } }
          }
        },
        wildcards: {
          include: {
            evento: {
              select: {
                nombre: true,
                wildcardDeadline: true 
              }
            }
          },
          orderBy: { createdAt: "desc" } 
        },
        privacyConsents: {
          where: {
            category: "MARKETING",
            revokedAt: null,
          },
          select: { id: true },
        },
      },
    }),
    prisma.region.findMany({ orderBy: { id: "asc" } }), // Necesario para el Select
    prisma.comuna.findMany({ orderBy: { name: "asc" } }) // Necesario para el Select
  ]);

  if (!user) {
    return <div className="text-center mt-10 text-red-400">Usuario no encontrado.</div>;
  }

  const perfil = user.profile;
  // Nota: Pasamos birthDate como string ISO para el input type="date"
  const birthDateISO = perfil?.birthDate ? new Date(perfil.birthDate).toISOString().split('T')[0] : ""; 

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-blue-950 to-neutral-900 py-10">
      <PerfilForm
        user={{
          email: user.email,
          image: user.image,
          nombres: perfil?.nombres ?? "",
          apellidoPaterno: perfil?.apellidoPaterno ?? "",
          apellidoMaterno: perfil?.apellidoMaterno ?? "",
          // Datos para visualización actual
          regionName: perfil?.comuna?.region?.name ?? "", 
          comunaName: perfil?.comuna?.name ?? "",
          // Datos para edición (IDs)
          comunaId: perfil?.comunaId ?? undefined,
          regionId: perfil?.comuna?.regionId ?? undefined, // Importante para pre-seleccionar
          birthDate: birthDateISO,
          parentalGuardianName: perfil?.parentalGuardianName ?? "",
          parentalConsentAt: perfil?.parentalConsentAt?.toISOString() ?? null,
          marketingConsentActive: user.privacyConsents.length > 0,
          
          wildcards: user.wildcards,
        }}
        // 2. Pasamos los catálogos al componente cliente
        regiones={regiones}
        comunas={comunas}
      />
    </main>
  );
}