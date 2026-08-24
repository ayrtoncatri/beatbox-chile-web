/**
 * Utilidades para manejar errores tipados como `unknown` (el tipo que TS le da
 * a la variable de un `catch` en modo estricto). Antes del proyecto se
 * anotaban como `catch (e: any)` y se accedía a `e.message` directamente;
 * eso funcionaba pero perdía cualquier chequeo de tipos. Esta función
 * centraliza el patrón repetido en varias acciones y rutas.
 */
export function getErrorMessage(error: unknown, fallback = "Ha ocurrido un error inesperado"): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}
