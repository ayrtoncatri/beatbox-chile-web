import { createHash, createHmac } from "crypto";

/**
 * Seudonimizacion para datasets secundarios / reporteria (Art. 14 quinquies).
 * HMAC estable por entorno; no reversible sin la llave.
 */

function getPseudonymSecret(): string {
  return (
    process.env.PRIVACY_PSEUDONYM_SECRET
    || process.env.NEXTAUTH_SECRET
    || "beatbox-dev-pseudonym-fallback"
  );
}

export function pseudonymizeValue(value: string | null | undefined, salt = "default"): string {
  if (!value) return "";
  return createHmac("sha256", getPseudonymSecret())
    .update(`${salt}:${value}`)
    .digest("hex")
    .slice(0, 16);
}

export function maskEmail(email: string | null | undefined): string {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!local || !domain) return pseudonymizeValue(email, "email");
  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
}

export function maskName(name: string | null | undefined): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return parts.map((p) => (p.length <= 1 ? "*" : `${p[0]}***`)).join(" ");
}

/** Para CSV/reporteria admin: reemplaza PII por seudonimos estables. */
export function pseudonymizeForReport<T extends Record<string, unknown>>(
  row: T,
  fields: { email?: string[]; name?: string[]; freeText?: string[] } = {},
): T {
  const next = { ...row };
  for (const key of fields.email ?? []) {
    if (typeof next[key] === "string") {
      (next as Record<string, unknown>)[key] = pseudonymizeValue(next[key] as string, "email");
    }
  }
  for (const key of fields.name ?? []) {
    if (typeof next[key] === "string") {
      (next as Record<string, unknown>)[key] = pseudonymizeValue(next[key] as string, "name");
    }
  }
  for (const key of fields.freeText ?? []) {
    if (typeof next[key] === "string") {
      (next as Record<string, unknown>)[key] = createHash("sha256")
        .update(next[key] as string)
        .digest("hex")
        .slice(0, 12);
    }
  }
  return next;
}
