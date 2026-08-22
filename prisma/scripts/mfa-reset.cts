// prisma/scripts/mfa-reset.cts
// Usamos sintaxis CommonJS (require) debido al formato .cts
require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

/**
 * Procedimiento de recuperacion de MFA privilegiado (Ley 21.719).
 *
 * Deshabilita el segundo factor de una cuenta que perdio su aplicacion autenticadora
 * y sus codigos de recuperacion, dejando evidencia en AuditLog. Tras ejecutarlo, la
 * persona vuelve a enrolarse en su siguiente acceso a una ruta privilegiada.
 *
 * Uso: npm run mfa:reset -- persona@ejemplo.cl "verificacion telefonica 2026-08-22"
 *
 * La sesion MFA vigente de esa cuenta sigue siendo valida hasta que expire (8 horas).
 * Si el motivo del reset es una sospecha de compromiso, desactiva ademas la cuenta.
 */
async function main() {
  // Unimos el resto de los argumentos para que el motivo no se trunque a una sola
  // palabra si el shell no respeta las comillas: es la evidencia de la auditoria.
  const [email, ...reasonParts] = process.argv.slice(2);
  const reason = reasonParts.join(" ").trim();

  if (!email || !reason) {
    throw new Error(
      'Uso: npm run mfa:reset -- <email> "<motivo y verificacion de identidad>"',
    );
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, totpEnabled: true },
    });

    if (!user) {
      throw new Error(`No existe una cuenta con el correo ${email}`);
    }

    const { recoveryCodesRemoved } = await prisma.$transaction(async (transaction: any) => {
      const removed = await transaction.mfaRecoveryCode.deleteMany({
        where: { userId: user.id },
      });
      await transaction.user.update({
        where: { id: user.id },
        data: {
          totpSecretEncrypted: null,
          totpEnabled: false,
          totpConfirmedAt: null,
        },
      });
      await transaction.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "MFA_DISABLED",
          resourceType: "User",
          resourceId: user.id,
          outcome: "SUCCESS",
          metadata: { reason, performedVia: "cli" },
        },
      });

      return { recoveryCodesRemoved: removed.count };
    });

    console.log(`MFA deshabilitado para ${user.email}`);
    console.log(`Codigos de recuperacion eliminados: ${recoveryCodesRemoved}`);
    console.log("La persona debera enrolarse de nuevo al entrar a una ruta privilegiada.");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
