import { randomBytes, createHash } from "crypto";

/**
 * Genera un token aleatorio y su hash SHA-256.
 * - token: Se envía al usuario por email.
 * - tokenHash: Se guarda en la base de datos.
 */
export const generateResetToken = () => {
  // 1. Generamos 32 bytes aleatorios y los convertimos a hex (64 caracteres)
  const token = randomBytes(32).toString("hex");
  
  // 2. Creamos el hash SHA-256 del token para guardar en BD
  const tokenHash = createHash("sha256").update(token).digest("hex");

  return { token, tokenHash };
};