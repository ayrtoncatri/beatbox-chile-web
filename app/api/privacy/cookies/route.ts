import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import {
  COOKIE_CONSENT_NAME,
  COOKIE_CONSENT_VERSION,
  cookieHeaderValue,
  necessaryOnlyConsent,
  readCookieConsentFromHeader,
  thirdPartyConsent,
} from "@/lib/cookie-consent";
import { prisma } from "@/lib/prisma";
import { getRequestMetadata } from "@/lib/privacy";

const bodySchema = z.object({
  thirdParty: z.boolean(),
});

function consentResponse(thirdParty: boolean, extra?: Record<string, unknown>) {
  const state = thirdParty ? thirdPartyConsent() : necessaryOnlyConsent();
  const response = NextResponse.json({
    ok: true,
    version: COOKIE_CONSENT_VERSION,
    thirdParty: state.thirdParty,
    ...extra,
  });
  response.headers.set("Set-Cookie", cookieHeaderValue(state));
  return response;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const browser = readCookieConsentFromHeader(req.headers.get("cookie"));

  if (session?.user?.id) {
    const latest = await prisma.privacyConsent.findFirst({
      where: {
        userId: session.user.id,
        category: "COOKIES",
      },
      orderBy: { givenAt: "desc" },
      select: { revokedAt: true },
    });

    if (latest) {
      return NextResponse.json({
        version: COOKIE_CONSENT_VERSION,
        thirdParty: latest.revokedAt == null,
        source: "account",
      });
    }
  }

  return NextResponse.json({
    version: COOKIE_CONSENT_VERSION,
    thirdParty: browser?.thirdParty === true,
    source: browser ? "browser" : "default",
  });
}

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Solicitud invalida" }, { status: 400 });
  }

  const { thirdParty } = parsed.data;
  const session = await getServerSession(authOptions);
  const meta = getRequestMetadata(req);

  if (session?.user?.id) {
    await prisma.$transaction(async (tx) => {
      if (!thirdParty) {
        await tx.privacyConsent.updateMany({
          where: {
            userId: session.user.id,
            category: "COOKIES",
            revokedAt: null,
          },
          data: { revokedAt: new Date() },
        });
      } else {
        const active = await tx.privacyConsent.findFirst({
          where: {
            userId: session.user.id,
            category: "COOKIES",
            revokedAt: null,
          },
          select: { id: true },
        });
        if (!active) {
          await tx.privacyConsent.create({
            data: {
              userId: session.user.id,
              email: session.user.email ?? null,
              category: "COOKIES",
              policyVersion: COOKIE_CONSENT_VERSION,
              policyHash: COOKIE_CONSENT_NAME,
              method: "cookie_banner",
              givenAt: new Date(),
              ...meta,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          actorUserId: session.user.id,
          action: thirdParty ? "COOKIE_CONSENT_GRANTED" : "COOKIE_CONSENT_REVOKED",
          resourceType: "PrivacyConsent",
          resourceId: session.user.id,
          outcome: "SUCCESS",
          metadata: { thirdParty, version: COOKIE_CONSENT_VERSION },
          ...meta,
        },
      });
    });
  }

  return consentResponse(thirdParty);
}
