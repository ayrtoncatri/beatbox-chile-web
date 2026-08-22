# Politica tecnica de retencion y purga - Beatbox Chile

Fecha: 2026-08-22
Version: 1.0

## Auditoria
Cada ejecucion de retencion conserva su resultado operativo en `DataRetentionRun` y registra en `AuditLog` un evento de exito o falla, incluyendo solo los conteos de registros purgados o el mensaje tecnico de error. La tabla `AuditLog` se habilitara con la migracion final de privacidad.

## Objetivo
Aplicar minimizacion de datos mediante una purga diaria, trazable y protegida, de datos tecnicos cuyo ciclo de vida ya termino.

## Politicas implementadas
| Dato | Regla | Accion | Fundamento operativo |
|---|---|---|---|
| Token de recuperacion de contrasena | Vencido | Eliminacion definitiva | El token expira en una hora y no tiene finalidad posterior. |
| Enrolamiento MFA no confirmado | Mas de 24 horas | Eliminar secreto TOTP cifrado y recovery codes asociados | Evita conservar un segundo factor que nunca fue activado. |
| Recovery code MFA usado | Mas de 30 dias desde el uso | Eliminacion definitiva | El codigo ya no es reutilizable ni necesario para autenticacion. |
| Compras, resultados, inscripciones e historial competitivo | No automatizado | Retener hasta definir causal/plazo legal | No se eliminan sin matriz legal validada para no afectar obligaciones contables, transparencia competitiva o trazabilidad. |
| Perfil, sugerencias y mensajes | No automatizado | Resolver por solicitud de derechos | La supresion requiere decision fundada y tratamiento por caso mientras no exista politica corporativa aprobada. |

## Ejecucion automatica
- Ruta: `POST /api/internal/data-retention`.
- Autorizacion: `Authorization: Bearer <CRON_SECRET>`.
- Programacion Vercel: todos los dias a las 04:00 UTC mediante `vercel.json`.
- Registro: cada corrida crea y actualiza una fila de `DataRetentionRun` con estado, fechas, resultado o error.

## Operacion y alerta
1. Configurar `CRON_SECRET` en Vercel y en el entorno que ejecute el cron.
2. Verificar despues del primer despliegue que exista una ejecucion `COMPLETED` en `DataRetentionRun`.
3. Investigar cada ejecucion `FAILED`; un cron que falla deja datos vencidos acumulados.
4. Revisar trimestralmente las politicas y ampliar la matriz solo con fundamento legal confirmado.

## Limitaciones conocidas
- Esta automatizacion no purga datos sujetos a potencial obligacion legal o historica.
- Los backups no se reescriben: la eliminacion debe propagarse conforme al ciclo de rotacion del proveedor de base de datos.
- Antes de automatizar supresion de compras o perfiles se debe completar la matriz de retencion corporativa y las causales legales correspondientes.

## Evidencia tecnica
- Job: [lib/data-retention.ts](lib/data-retention.ts)
- Endpoint: [app/api/internal/data-retention/route.ts](app/api/internal/data-retention/route.ts)
- Bitacora: `DataRetentionRun`
- Migracion: `prisma/migrations/20260822022124_add_data_retention_audit/migration.sql`
- Cron: [vercel.json](vercel.json)

---
DISCLAIMER: Este documento no constituye asesoria legal. Es una politica tecnica de minimizacion de datos basada en Ley 21.719 y requiere completar las causales de retencion que dependen de otras normas.
