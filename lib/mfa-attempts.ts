import { RateLimiterMemory } from "rate-limiter-flexible";

import { prisma } from "@/lib/prisma";
import { getRequestMetadata } from "@/lib/privacy";

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 5 * 60;

// Presupuesto compartido entre la confirmacion de enrolamiento y el desafio: ambos
// validan un TOTP de seis digitos, asi que un limite por endpoint duplicaria los
// intentos disponibles para adivinarlo.
const limiter = new RateLimiterMemory({
  points: MAX_ATTEMPTS,
  duration: WINDOW_SECONDS,
});

export function getMfaAttemptKey(userId: string, request: Request): string {
  return `${userId}:${getRequestMetadata(request).ip ?? "unknown"}`;
}

export async function consumeMfaAttempt(key: string): Promise<boolean> {
  try {
    await limiter.consume(key);
    return true;
  } catch {
    return false;
  }
}

type MfaFailure = {
  userId: string;
  action: "MFA_ENABLE_FAILED" | "MFA_CHALLENGE_FAILED";
  reason: "invalid_code" | "rate_limited";
  request: Request;
};

/**
 * Registra el intento fallido de segundo factor. La Ley 21.719 exige poder auditar
 * los accesos privilegiados, y sin los fallos no se detecta un ataque de fuerza bruta.
 */
export async function recordMfaFailure({ userId, action, reason, request }: MfaFailure): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorUserId: userId,
      action,
      resourceType: "User",
      resourceId: userId,
      outcome: "FAILURE",
      metadata: { reason },
      ...getRequestMetadata(request),
    },
  });
}
