# Snapshot de cumplimiento - Ley 21.719

Fecha de corrida: 2026-08-22T01:44:12Z
Commit evaluado: 440df54

## Resultado ejecutivo

Postura actual frente a Ley 21.719: cumplimiento tecnico-documental avanzado, aun no total.

Score actual: 0.609 (60.9%).

Desglose:
- Controles requeridos: 23
- Cumple: 9
- Parcial: 10
- Falla: 1
- No verificable por codigo: 3

## Cambios implementados en esta corrida

1. Documentacion completa del pack 21.719 en [.compliance/docs](.compliance/docs):
- [.compliance/docs/21719-rat.md](.compliance/docs/21719-rat.md)
- [.compliance/docs/21719-politica-privacidad.md](.compliance/docs/21719-politica-privacidad.md)
- [.compliance/docs/21719-consentimiento.md](.compliance/docs/21719-consentimiento.md)
- [.compliance/docs/21719-canal-derechos.md](.compliance/docs/21719-canal-derechos.md)
- [.compliance/docs/21719-dpa.md](.compliance/docs/21719-dpa.md)
- [.compliance/docs/21719-anexo-transferencias.md](.compliance/docs/21719-anexo-transferencias.md)
- [.compliance/docs/21719-plan-respuesta-brechas.md](.compliance/docs/21719-plan-respuesta-brechas.md)
- [.compliance/docs/21719-registro-vulneraciones.md](.compliance/docs/21719-registro-vulneraciones.md)
- [.compliance/docs/21719-eipd.md](.compliance/docs/21719-eipd.md)

2. Instructivo operativo de situaciones en [.compliance/INSTRUCTIVO.md](.compliance/INSTRUCTIVO.md).

3. Canal tecnico de derechos implementado sin tocar funcionalidades existentes:
- Endpoint de solicitudes: [ app/api/privacy/rights/route.ts ](app/api/privacy/rights/route.ts)
- Endpoint de portabilidad/exportacion: [ app/api/privacy/export/route.ts ](app/api/privacy/export/route.ts)
- Refuerzo de trazabilidad: metadata tecnica en solicitudes (requestedAt, ip, userAgent) y registro de cada exportacion.

4. Actualizacion del estado versionado en [.compliance/state.json](.compliance/state.json).

5. MFA TOTP para roles privilegiados:
- Migracion aplicada: `20260822021324_add_privileged_mfa`.
- Enrolamiento, confirmacion y desafio bajo `app/api/auth/mfa`.
- Proteccion de `/admin`, `/api/admin`, `/judge` y `/api/judge` mediante `middleware.ts`.
- Runbook de despliegue y recuperacion en [.compliance/docs/21719-mfa-operacion.md](.compliance/docs/21719-mfa-operacion.md).

6. Retencion y minimizacion de datos tecnicos:
- Purga diaria en Vercel de tokens vencidos, enrolamientos MFA abandonados y recovery codes usados.
- Ejecuciones registradas en `DataRetentionRun` mediante la migracion `20260822022124_add_data_retention_audit`.
- Politica y limites documentados en [.compliance/docs/21719-retencion-y-purga.md](.compliance/docs/21719-retencion-y-purga.md).

## Brechas pendientes para declarar cumplimiento integral

1. Configurar variables MFA y enrolar cuentas privilegiadas; el codigo esta implementado pero la habilitacion depende de esa operacion.
2. Configurar `CRON_SECRET` en Vercel y verificar la primera corrida diaria de retencion.
3. Seudonimizacion en datasets secundarios/reporteria (control data-pseudonym).
4. Cierre contractual real de DPA y transferencias por proveedor (actualmente documentado, no formalizado).
5. Evidencia operativa externa no verificable por codigo: responsable designado y politica de backups.

## Evidencia tecnica clave ya existente en el proyecto

- Hash de contrasenas con bcrypt en [lib/auth.ts](lib/auth.ts#L43), [app/api/auth/register/route.ts](app/api/auth/register/route.ts#L43), [app/api/password/reset/route.ts](app/api/password/reset/route.ts#L58).
- Secretos en entorno en [lib/transbank.ts](lib/transbank.ts#L27) y [lib/mercadopago.ts](lib/mercadopago.ts#L5).
- Control de acceso admin en [middleware.ts](middleware.ts#L31) y [lib/permissions.ts](lib/permissions.ts#L34).

## Nota de alcance

Esta implementacion prioriza cumplimiento legal sin modificar flujos funcionales ya existentes. Se agregaron componentes de compliance de manera aislada y documental.

---

DISCLAIMER: Este material no constituye asesoria legal. Es un borrador tecnico basado en normativa chilena para apoyar el cumplimiento; la responsabilidad legal y la validacion final corresponden al titular del tratamiento y, de ser necesario, a asesoria juridica especializada.
