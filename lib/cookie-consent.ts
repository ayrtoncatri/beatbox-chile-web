export const COOKIE_CONSENT_NAME = "beatbox_cookie_consent";
export const COOKIE_CONSENT_VERSION = "2026-08-23";
export const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type CookieConsentState = {
  version: string;
  thirdParty: boolean;
  updatedAt: string;
};

export function serializeCookieConsent(state: CookieConsentState): string {
  return encodeURIComponent(JSON.stringify(state));
}

export function parseCookieConsent(raw: string | undefined | null): CookieConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as CookieConsentState;
    if (
      parsed.version !== COOKIE_CONSENT_VERSION
      || typeof parsed.thirdParty !== "boolean"
      || typeof parsed.updatedAt !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function necessaryOnlyConsent(): CookieConsentState {
  return {
    version: COOKIE_CONSENT_VERSION,
    thirdParty: false,
    updatedAt: new Date().toISOString(),
  };
}

export function thirdPartyConsent(): CookieConsentState {
  return {
    version: COOKIE_CONSENT_VERSION,
    thirdParty: true,
    updatedAt: new Date().toISOString(),
  };
}

export function cookieHeaderValue(state: CookieConsentState): string {
  const secure = typeof window === "undefined" || window.location.protocol === "https:";
  return [
    `${COOKIE_CONSENT_NAME}=${serializeCookieConsent(state)}`,
    "Path=/",
    `Max-Age=${COOKIE_CONSENT_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}

export function readBrowserCookieConsent(): CookieConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${COOKIE_CONSENT_NAME}=`));
  return parseCookieConsent(match?.slice(COOKIE_CONSENT_NAME.length + 1));
}

export function writeBrowserCookieConsent(state: CookieConsentState): void {
  if (typeof document === "undefined") return;
  document.cookie = cookieHeaderValue(state);
}

export function readCookieConsentFromHeader(cookieHeader: string | null): CookieConsentState | null {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_CONSENT_NAME}=`));
  return parseCookieConsent(match?.slice(COOKIE_CONSENT_NAME.length + 1));
}
