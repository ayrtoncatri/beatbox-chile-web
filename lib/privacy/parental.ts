import type { Prisma } from "@prisma/client";

import { getHeaderMetadata, PRIVACY_NOTICE_HASH, PRIVACY_NOTICE_VERSION } from "@/lib/privacy";
import { isChildBirthDate } from "@/lib/privacy/age";

export function parentalConsentError(
  birthDateValue: string | Date | null | undefined,
  guardianName: string | null | undefined,
  accepted: boolean,
): string | null {
  if (!isChildBirthDate(birthDateValue)) return null;
  if (!accepted) {
    return "Si la fecha de nacimiento corresponde a menos de 14 anos, un padre, madre o cuidador debe autorizar el tratamiento.";
  }
  if (!guardianName?.trim()) {
    return "Indica el nombre de quien autoriza (padre, madre o cuidador).";
  }
  return null;
}

export async function persistParentalConsent(params: {
  tx: Prisma.TransactionClient;
  userId: string;
  email: string | null;
  birthDate: Date | null;
  guardianName: string | null;
  accepted: boolean;
  headers: { get(name: string): string | null };
}) {
  const { tx, userId, email, birthDate, guardianName, accepted, headers } = params;
  const child = birthDate ? isChildBirthDate(birthDate) : false;

  if (!child) {
    await tx.userProfile.update({
      where: { userId },
      data: {
        parentalGuardianName: null,
        parentalConsentAt: null,
      },
    });
    return;
  }

  await tx.userProfile.update({
    where: { userId },
    data: {
      parentalGuardianName: guardianName?.trim() || null,
      parentalConsentAt: accepted ? new Date() : null,
    },
  });

  if (accepted) {
    const existing = await tx.privacyConsent.findFirst({
      where: {
        userId,
        method: "parental_guardian",
        revokedAt: null,
      },
      select: { id: true },
    });
    if (!existing) {
      await tx.privacyConsent.create({
        data: {
          userId,
          email,
          category: "NECESSARY",
          policyVersion: PRIVACY_NOTICE_VERSION,
          policyHash: PRIVACY_NOTICE_HASH,
          method: "parental_guardian",
          givenAt: new Date(),
          ...getHeaderMetadata(headers),
        },
      });
    }
  }
}
