import { createHash, createHmac, timingSafeEqual } from "crypto";

export const PRIVACY_NOTICE_VERSION = "2026-08-22";

const PRIVACY_NOTICE_TEXT =
  "Tus datos personales seran tratados por Beatbox Chile para gestionar tu cuenta. " +
  "Puedes ejercer tus derechos de acceso, rectificacion, supresion, oposicion, portabilidad y bloqueo por el canal de privacidad.";

export const PRIVACY_NOTICE_HASH = createHash("sha256")
  .update(PRIVACY_NOTICE_TEXT, "utf8")
  .digest("hex");

const GOOGLE_OAUTH_CONSENT_TTL_SECONDS = 10 * 60;

type GoogleOAuthConsent = {
  expiresAt: number;
  ip: string | null;
  marketingConsent: boolean;
  userAgent: string | null;
};

export const googleOAuthConsentCookie = {
  name: "beatbox_google_privacy_consent",
  maxAge: GOOGLE_OAUTH_CONSENT_TTL_SECONDS,
};

function getConsentSigningSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET es obligatorio para el consentimiento OAuth");
  return secret;
}

function signConsentPayload(payload: string): string {
  return createHmac("sha256", getConsentSigningSecret()).update(payload).digest("base64url");
}

export function createGoogleOAuthConsentToken(
  consent: Omit<GoogleOAuthConsent, "expiresAt">,
): string {
  const payload = Buffer.from(JSON.stringify({
    ...consent,
    expiresAt: Math.floor(Date.now() / 1000) + GOOGLE_OAUTH_CONSENT_TTL_SECONDS,
  })).toString("base64url");

  return `${payload}.${signConsentPayload(payload)}`;
}

export function verifyGoogleOAuthConsentToken(value: string | undefined): GoogleOAuthConsent | null {
  if (!value) return null;

  const [payload, signature, ...extraParts] = value.split(".");
  if (!payload || !signature || extraParts.length > 0) return null;

  const expectedSignature = signConsentPayload(payload);
  const receivedSignature = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);
  if (
    receivedSignature.length !== expectedSignatureBuffer.length
    || !timingSafeEqual(receivedSignature, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const consent = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as GoogleOAuthConsent;
    if (
      typeof consent.expiresAt !== "number"
      || consent.expiresAt < Math.floor(Date.now() / 1000)
      || typeof consent.marketingConsent !== "boolean"
      || (consent.ip !== null && typeof consent.ip !== "string")
      || (consent.userAgent !== null && typeof consent.userAgent !== "string")
    ) {
      return null;
    }
    return consent;
  } catch {
    return null;
  }
}

export function getHeaderMetadata(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");

  return {
    ip: forwardedFor?.split(",")[0]?.trim() ?? headers.get("x-real-ip"),
    userAgent: headers.get("user-agent"),
  };
}

export function getRequestMetadata(request: Request) {
  return getHeaderMetadata(request.headers);
}
