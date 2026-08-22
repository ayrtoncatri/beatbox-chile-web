import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createGoogleOAuthConsentToken,
  getRequestMetadata,
  googleOAuthConsentCookie,
} from "@/lib/privacy";

const consentSchema = z.object({
  privacyNoticeAccepted: z.literal(true),
  marketingConsent: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  const parsed = consentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Debes aceptar el aviso de privacidad para continuar con Google." },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: googleOAuthConsentCookie.name,
    value: createGoogleOAuthConsentToken({
      marketingConsent: parsed.data.marketingConsent,
      ...getRequestMetadata(req),
    }),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: googleOAuthConsentCookie.maxAge,
  });

  return response;
}

export const runtime = "nodejs";
