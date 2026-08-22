import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const MFA_COOKIE_NAME = "bbx-mfa";
const MFA_SESSION_SECONDS = 8 * 60 * 60;

function getEncryptionKey(): Buffer {
  const value = process.env.MFA_ENCRYPTION_KEY;
  if (!value) {
    throw new Error("MFA_ENCRYPTION_KEY no esta configurada");
  }

  const key = Buffer.from(value, "base64");
  if (key.length !== 32) {
    throw new Error("MFA_ENCRYPTION_KEY debe contener 32 bytes codificados en base64");
  }

  return key;
}

function getSigningSecret(): string {
  const secret = process.env.MFA_SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("MFA_SESSION_SECRET o NEXTAUTH_SECRET debe estar configurada");
  }

  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSigningSecret()).update(value).digest("base64url");
}

export function encryptMfaSecret(value: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptMfaSecret(value: string): string {
  const [ivValue, tagValue, encryptedValue] = value.split(".");
  if (!ivValue || !tagValue || !encryptedValue) {
    throw new Error("Secreto MFA cifrado invalido");
  }

  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function generateRecoveryCodes(count = 10): string[] {
  return Array.from({ length: count }, () => randomBytes(5).toString("hex").toUpperCase());
}

export function createMfaSessionValue(userId: string): { value: string; expiresAt: Date } {
  const expiresAt = new Date(Date.now() + MFA_SESSION_SECONDS * 1000);
  const payload = `${userId}.${expiresAt.getTime()}`;
  return { value: `${payload}.${sign(payload)}`, expiresAt };
}

export function verifyMfaSessionValue(value: string | undefined, userId: string): boolean {
  if (!value) return false;

  const [cookieUserId, expiresAtValue, signature] = value.split(".");
  if (!cookieUserId || !expiresAtValue || !signature || cookieUserId !== userId) return false;

  const payload = `${cookieUserId}.${expiresAtValue}`;
  const expectedSignature = sign(payload);
  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return false;

  return Number(expiresAtValue) > Date.now();
}

export const mfaCookie = {
  name: MFA_COOKIE_NAME,
  maxAge: MFA_SESSION_SECONDS,
};
