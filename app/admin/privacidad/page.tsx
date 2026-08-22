import PrivacyRequestsAdmin from "@/components/admin/privacy/PrivacyRequestsAdmin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPrivacyPage() {
  const requests = await prisma.privacyRequest.findMany({
    orderBy: { receivedAt: "asc" },
    take: 100,
    select: {
      id: true,
      email: true,
      name: true,
      type: true,
      status: true,
      detail: true,
      receivedAt: true,
      deadlineAt: true,
      extendedUntil: true,
      userId: true,
      resolution: true,
      rejectionReason: true,
    },
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-black text-white">Solicitudes de privacidad</h1>
        <p className="text-sm text-blue-200">
          Canal ARCO + portabilidad. Plazo legal 30 dias corridos (prorroga unica +30).
        </p>
      </div>
      <PrivacyRequestsAdmin
        initialRequests={requests.map((r) => ({
          ...r,
          receivedAt: r.receivedAt.toISOString(),
          deadlineAt: r.deadlineAt.toISOString(),
          extendedUntil: r.extendedUntil?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
