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
  const user = await prisma.user.findUnique({
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
              nombre: true, // Para saber a qué evento pertenece
              wildcardDeadline: true // ¡Esta es la fecha que necesitamos!
            }
          }
        },
        orderBy: { createdAt: "desc" } 
      }
    },
  });

  if (!user) {
    return <div className="text-center mt-10 text-red-400">Usuario no encontrado.</div>;
  }

  // Adaptar datos para el formulario
  const perfil = user.profile;
  const region = perfil?.comuna?.region?.name ?? "";
  const comuna = perfil?.comuna?.name ?? "";
  const edad = perfil?.birthDate ? calcularEdad(perfil.birthDate) : "";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-blue-950 to-neutral-900">
      <PerfilForm
        user={{
          email: user.email,
          image: user.image,
          nombres: perfil?.nombres ?? "",
          apellidoPaterno: perfil?.apellidoPaterno ?? "",
          apellidoMaterno: perfil?.apellidoMaterno ?? "",
          region,
          comuna,
          edad,
          wildcards: user.wildcards,
          comunaId: perfil?.comunaId ?? undefined,
        }}
      />
    </main>
  );
}

// Utilidad para calcular edad desde birthDate
function calcularEdad(birthDate: Date) {
  const birth = new Date(birthDate);
  const today = new Date();
  let edad = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    edad--;
  }
  return edad;
}