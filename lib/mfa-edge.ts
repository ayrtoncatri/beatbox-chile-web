const MFA_COOKIE_NAME = "bbx-mfa";

function getSigningSecret(): string | undefined {
  return process.env.MFA_SESSION_SECRET || process.env.NEXTAUTH_SECRET;
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sign(value: string): Promise<string | undefined> {
  const secret = getSigningSecret();
  if (!secret) return undefined;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64Url(new Uint8Array(signature));
}

function equal(left: string, right: string): boolean {
  if (left.length !== right.length) return false;

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export async function hasValidMfaSession(value: string | undefined, userId: string): Promise<boolean> {
  if (!value) return false;

  const [cookieUserId, expiresAtValue, signature] = value.split(".");
  if (!cookieUserId || !expiresAtValue || !signature || cookieUserId !== userId) return false;
  if (Number(expiresAtValue) <= Date.now()) return false;

  const expected = await sign(`${cookieUserId}.${expiresAtValue}`);
  return !!expected && equal(expected, signature);
}

export const mfaCookieName = MFA_COOKIE_NAME;
