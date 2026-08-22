import { createHash, createHmac, timingSafeEqual } from "crypto";

export const PRIVACY_NOTICE_VERSION = "2026-08-22";

export const PRIVACY_NOTICE_TEXT =
  "Tus datos personales seran tratados por Beatbox Chile para gestionar tu cuenta. " +
  "Puedes ejercer tus derechos de acceso, rectificacion, supresion, oposicion, portabilidad y bloqueo por el canal de privacidad.";

export const PRIVACY_NOTICE_HASH = createHash("sha256")
  .update(PRIVACY_NOTICE_TEXT, "utf8")
  .digest("hex");

/** Contenido publico de /privacidad (alineado a .compliance/docs/21719-politica-privacidad.md). */
export const PRIVACY_POLICY_SECTIONS = [
  {
    title: "1. Responsable del tratamiento",
    paragraphs: [
      "Beatbox Chile ([COMPLETAR razon social], RUT [COMPLETAR], domicilio [COMPLETAR]).",
      "Contacto de privacidad: privacidad@[COMPLETAR dominio] (correo temporal hasta formalizar datos corporativos).",
    ],
  },
  {
    title: "2. Datos que tratamos",
    paragraphs: [
      "Identificacion y cuenta: email, hash de contrasena, imagen de perfil.",
      "Perfil: nombres, apellidos, comuna, fecha de nacimiento (si se informa).",
      "Operacion competitiva: nombre artistico, enlaces de wildcard, evaluaciones y resultados.",
      "Compras: ordenes, items, montos y estado de pago.",
      "Contacto y comunidad: sugerencias y mensajes.",
      "No solicitamos de forma ordinaria datos sensibles. Si se requieren, pediremos consentimiento expreso.",
    ],
  },
  {
    title: "3. Finalidad y base de licitud",
    paragraphs: [
      "Cuenta y autenticacion: ejecucion de contrato / medidas precontractuales.",
      "Eventos, wildcards y evaluaciones: ejecucion de contrato e interes legitimo operativo.",
      "Compras y pagos: ejecucion de contrato y obligacion legal tributaria/contable.",
      "Recuperacion de contrasena: ejecucion de contrato e interes legitimo de seguridad.",
      "Contacto/sugerencias: consentimiento e interes legitimo de atencion.",
      "Derechos de titulares: obligacion legal (Ley 21.719).",
    ],
  },
  {
    title: "4. Encargados y transferencias",
    paragraphs: [
      "Podemos compartir datos con encargados: autenticacion (Google OAuth), correo (Resend), pasarelas (Transbank, Mercado Pago) e infraestructura (Vercel/BD).",
      "Si hay transferencia internacional, se usaran mecanismos validos bajo Ley 21.719 (p. ej. clausulas contractuales modelo).",
    ],
  },
  {
    title: "5. Conservacion",
    paragraphs: [
      "Conservamos los datos el tiempo necesario para las finalidades o el plazo legal. Luego se eliminan o anonimizan.",
      "Los comprobantes de compra se retienen segun obligacion tributaria; la PII de cuenta puede anonimizarse sin borrar el registro contable.",
    ],
  },
  {
    title: "6. Derechos",
    paragraphs: [
      "Puedes ejercer acceso, rectificacion, supresion, oposicion, portabilidad y bloqueo, y revocar consentimientos.",
      "Canal: /privacidad/derechos y correo de privacidad. Plazo: 30 dias corridos, prorrogable una vez por 30 dias.",
    ],
  },
  {
    title: "7. Decisiones automatizadas",
    paragraphs: [
      "No adoptamos decisiones automatizadas con efectos juridicos o significativamente equivalentes sin intervencion humana.",
    ],
  },
  {
    title: "8. Seguridad",
    paragraphs: [
      "Medidas acordes al riesgo: control de acceso por rol, MFA en accesos privilegiados, hashing de contrasenas, cifrado de secretos MFA, auditoria y secretos en variables de entorno.",
    ],
  },
  {
    title: "9. Reclamos",
    paragraphs: [
      "Puedes reclamar ante la Agencia de Proteccion de Datos Personales de Chile.",
    ],
  },
] as const;

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
