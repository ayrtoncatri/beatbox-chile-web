# Politica tecnica de retencion y purga - Beatbox Chile

Fecha: 2026-08-22
Version: 1.1

## Auditoria
Cada ejecucion de retencion conserva su resultado operativo en `DataRetentionRun` y registra en `AuditLog` un evento de exito o falla, incluyendo solo los conteos de registros purgados o el mensaje tecnico de error.

## Objetivo
Aplicar minimizacion de datos mediante una purga diaria, trazable y protegida.

## Politicas implementadas
| Dato | Regla | Accion | Fundamento operativo |
|---|---|---|---|
| Token de recuperacion de contrasena | Vencido | Eliminacion definitiva | El token expira en una hora y no tiene finalidad posterior. |
| Enrolamiento MFA no confirmado | Mas de 24 horas | Eliminar secreto TOTP cifrado y recovery codes asociados | Evita conservar un segundo factor que nunca fue activado. |
| Recovery code MFA usado | Mas de 30 dias desde el uso | Eliminacion definitiva | El codigo ya no es reutilizable ni necesario para autenticacion. |
| Mensajes huerfanos (sin userId) | Mas de 365 dias | Anonimizacion de PII | Minimización; no hay cuenta vinculada. |
| Sugerencias resuelta/descartada | Mas de 730 dias sin actualizacion | Anonimizacion de PII del mensaje | Fin de atencion cumplido. |
| AuditLog | Mas de 730 dias | Eliminacion | Retencion operativa de evidencia; renovar si fiscalizacion exige mas. |
| Compras, resultados, inscripciones e historial competitivo | No automatizado | Retener | Obligacion tributaria/contable y transparencia competitiva. Supresion de titular = anonimizar PII de cuenta, conservar filas contables. |
| Perfil y cuenta | Por solicitud de derechos | Anonimizacion via `/admin/privacidad` (FULFILL SUPRESION) | Mapa PII en `lib/privacy/data-map.ts`. |

## Citas de retencion tributaria (verificar contra fuente oficial)
- Codigo Tributario art. 17 inc. 2 y art. 200 — [verificar contra fuente oficial descargada via FUENTES.md de compliance-cl]
- No se auto-borran compras/pagos.

## Ejecucion automatica
- Ruta: `POST /api/internal/data-retention`.
- Autorizacion: `Authorization: Bearer <CRON_SECRET>`.
- Programacion Vercel: todos los dias a las 04:00 UTC mediante `vercel.json`.
- Registro: cada corrida crea y actualiza una fila de `DataRetentionRun`.

## Operacion y alerta
1. Configurar `CRON_SECRET` en Vercel.
2. Verificar primera ejecucion `COMPLETED` en `DataRetentionRun`.
3. Investigar cada `FAILED`.
4. Revisar trimestralmente las politicas.

## Limitaciones conocidas
- Los backups no se reescriben: la anonimizacion se propaga al rotar snapshots.
- `?raw=1` en exports admin desactiva seudonimizacion (solo uso justificado por el responsable).

## Evidencia tecnica
- Job: [lib/data-retention.ts](../../lib/data-retention.ts)
- Mapa PII: [lib/privacy/data-map.ts](../../lib/privacy/data-map.ts)
- Endpoint: [app/api/internal/data-retention/route.ts](../../app/api/internal/data-retention/route.ts)
- Cron: [vercel.json](../../vercel.json)

---
DISCLAIMER: Este documento no constituye asesoria legal.
