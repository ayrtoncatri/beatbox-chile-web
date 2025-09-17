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
    include: { wildcards: true },
  });

  if (!user) {
    return <div className="text-center mt-10 text-red-400">Usuario no encontrado.</div>;
  }
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-blue-950 to-neutral-900">
      <PerfilForm user={user} />
    </main>
  );
}