# Cambios implementados para Ley 21.719

Fecha: 2026-08-22
Scope: Implementacion de cumplimiento sin modificar funcionalidades existentes.

## 1. Objetivo
Dejar implementado un baseline de cumplimiento Ley 21.719 en dos planos:
- Plano documental exigible y auditable.
- Plano tecnico minimo para canal de derechos y portabilidad.

## 2. Archivos creados

### 2.1 Estado y gobernanza
- [.compliance/state.json](.compliance/state.json)
- [.compliance/RESUMEN.md](.compliance/RESUMEN.md)
- [.compliance/INSTRUCTIVO.md](.compliance/INSTRUCTIVO.md)
- [.compliance/CAMBIOS-CUMPLIMIENTO-21719.md](.compliance/CAMBIOS-CUMPLIMIENTO-21719.md)

### 2.2 Documentos del pack Ley 21.719
- [.compliance/docs/21719-rat.md](.compliance/docs/21719-rat.md)
- [.compliance/docs/21719-politica-privacidad.md](.compliance/docs/21719-politica-privacidad.md)
- [.compliance/docs/21719-consentimiento.md](.compliance/docs/21719-consentimiento.md)
- [.compliance/docs/21719-canal-derechos.md](.compliance/docs/21719-canal-derechos.md)
- [.compliance/docs/21719-dpa.md](.compliance/docs/21719-dpa.md)
- [.compliance/docs/21719-anexo-transferencias.md](.compliance/docs/21719-anexo-transferencias.md)
- [.compliance/docs/21719-plan-respuesta-brechas.md](.compliance/docs/21719-plan-respuesta-brechas.md)
- [.compliance/docs/21719-registro-vulneraciones.md](.compliance/docs/21719-registro-vulneraciones.md)
- [.compliance/docs/21719-eipd.md](.compliance/docs/21719-eipd.md)

### 2.3 Implementacion tecnica aislada
- [app/api/privacy/rights/route.ts](app/api/privacy/rights/route.ts)
- [app/api/privacy/export/route.ts](app/api/privacy/export/route.ts)

### 2.4 MFA privilegiado
- [lib/mfa.ts](lib/mfa.ts)
- [lib/mfa-edge.ts](lib/mfa-edge.ts)
- [app/api/auth/mfa/setup/route.ts](app/api/auth/mfa/setup/route.ts)
- [app/api/auth/mfa/confirm/route.ts](app/api/auth/mfa/confirm/route.ts)
- [app/api/auth/mfa/challenge/route.ts](app/api/auth/mfa/challenge/route.ts)
- [app/auth/mfa/setup/page.tsx](app/auth/mfa/setup/page.tsx)
- [app/auth/mfa/challenge/page.tsx](app/auth/mfa/challenge/page.tsx)
- [components/login/MfaClient.tsx](components/login/MfaClient.tsx)
- [prisma/migrations/20260822021324_add_privileged_mfa/migration.sql](prisma/migrations/20260822021324_add_privileged_mfa/migration.sql)
- [.compliance/docs/21719-mfa-operacion.md](.compliance/docs/21719-mfa-operacion.md)

### 2.5 Retencion tecnica automatizada
- [lib/data-retention.ts](lib/data-retention.ts)
- [app/api/internal/data-retention/route.ts](app/api/internal/data-retention/route.ts)
- [prisma/migrations/20260822022124_add_data_retention_audit/migration.sql](prisma/migrations/20260822022124_add_data_retention_audit/migration.sql)
- [vercel.json](vercel.json)
- [.compliance/docs/21719-retencion-y-purga.md](.compliance/docs/21719-retencion-y-purga.md)

### 2.6 Consentimiento versionado en registro por credenciales
- [lib/privacy.ts](lib/privacy.ts)
- [app/auth/register/page.tsx](app/auth/register/page.tsx)
- [app/api/auth/register/route.ts](app/api/auth/register/route.ts)
- [prisma/schema.prisma](prisma/schema.prisma) (pendiente de la migracion final de privacidad)

### 2.7 Flujo estructurado de derechos y auditoria
- [app/api/privacy/rights/route.ts](app/api/privacy/rights/route.ts)
- [app/api/privacy/export/route.ts](app/api/privacy/export/route.ts)
- [app/api/admin/privacy/requests/route.ts](app/api/admin/privacy/requests/route.ts)
- [app/api/admin/privacy/requests/[id]/route.ts](app/api/admin/privacy/requests/[id]/route.ts)
- [prisma/schema.prisma](prisma/schema.prisma)

### 2.8 Migracion final de privacidad
- [prisma/migrations/20260822032009_add_privacy_governance/migration.sql](prisma/migrations/20260822032009_add_privacy_governance/migration.sql)

## 2.4 Refuerzo de trazabilidad (fase siguiente)
- Se agrego metadata de auditoria en solicitudes de derechos: timestamp, IP y user-agent.
- Se agrego registro de evento por cada exportacion de datos personales (portabilidad).
- La evidencia de trazabilidad queda persistida en los registros existentes de la aplicacion.

## 3. Que hace cada cambio

1. Estado versionado de cumplimiento
- state.json define controles, evidencia, remediacion y score del marco 21.719.
- RESUMEN.md deja postura ejecutiva y brechas pendientes.

2. Paquete documental legal-operativo
- RAT: inventario de actividades y datos tratados.
- Politica: transparencia y deber de informacion.
- Consentimiento: textos de captura y revocacion.
- Canal de derechos: procedimiento y plazos.
- DPA y anexo: base contractual con encargados/transferencias.
- Brechas y registro: respuesta operativa e historial obligatorio.
- EIPD: evaluacion de alto riesgo y criterio de aplicabilidad.

3. Canal tecnico de derechos
- rights endpoint recibe solicitudes de titulares (con o sin sesion) y crea ticket trazable.
- export endpoint entrega datos personales del titular autenticado en JSON.
- rights endpoint ahora registra metadata tecnica minima para auditoria.
- export endpoint ahora registra evento de portabilidad para cadena de custodia.

4. MFA TOTP para roles privilegiados
- Solo los roles admin y judge son redirigidos a setup/challenge al acceder a rutas privilegiadas.
- El secreto TOTP se cifra con AES-256-GCM; no se guarda en texto plano.
- Los diez codigos de recuperacion se almacenan como hashes bcrypt y se consumen en un unico uso.
- El desafio se limita a cinco intentos por usuario/IP cada cinco minutos.
- La cookie de verificacion es HTTP-only, firmada y expira en ocho horas.
- La confirmacion del enrolamiento emite la cookie de inmediato para evitar una redireccion circular causada por el estado previo del JWT durante la sesion actual.

5. Retencion tecnica automatizada
- La purga elimina solo datos tecnicos cuyo fin ya termino: tokens de reset vencidos, enrolamientos MFA abandonados y recovery codes usados.
- Un endpoint interno protegido por CRON_SECRET ejecuta la tarea diariamente mediante Vercel Cron.
- Cada ejecucion queda persistida en DataRetentionRun con resultado o error.
- No se automatizo la eliminacion de compras, perfiles ni historial competitivo sin una causal legal de retencion validada.

6. Consentimiento versionado
- El registro por credenciales exige la aceptacion explicita, no premarcada, del aviso de privacidad.
- El consentimiento para comunicaciones comerciales es opcional e independiente.
- La evidencia se crea atomica y conjuntamente con la cuenta, con categoria, version, hash SHA-256, timestamp, metodo, IP y user-agent cuando estan disponibles.
- El titular puede revocar comunicaciones comerciales desde su perfil; la revocacion no afecta los datos necesarios para la cuenta y queda auditada.
- Las cuentas nuevas mediante Google OAuth requieren consentimiento previo respaldado por una cookie HTTP-only firmada y de diez minutos; el callback no crea la cuenta si la evidencia no es valida.
- Esta implementacion requiere la futura migracion aditiva `add_privacy_governance`; no debe desplegarse sola contra una base que aun no tenga `PrivacyConsent`.

7. Solicitudes de derechos y auditoria estructurada
- El endpoint de derechos ya no reutiliza `Sugerencia` ni `Mensaje`: persiste solicitudes en `PrivacyRequest` con tipo, estado, titular, detalle, evidencia tecnica y fechas de vencimiento.
- Las solicitudes sin sesion requieren verificacion de identidad antes de pasar a ejecucion; los cierres requieren resolucion o motivo de rechazo.
- Una API administrativa protegida lista y actualiza solicitudes, y cada actualizacion genera una entrada append-only de auditoria.
- Los eventos de exportacion, MFA y retencion tambien se registran sin secretos, codigos TOTP ni contenido de datos exportados.
- Estas rutas dependen de `PrivacyRequest` y `AuditLog`; estan validadas en local y se activaran en produccion al desplegar conjuntamente la migracion final de privacidad.

8. Migracion final de privacidad
- La migracion `20260822032009_add_privacy_governance` crea solo `PrivacyConsent`, `PrivacyRequest`, `AuditLog`, enums, indices y llaves foraneas con `ON DELETE SET NULL`.
- Fue aplicada y validada en la base local. No contiene `DROP TABLE`, `DROP COLUMN`, conversiones destructivas ni reseteos.
- En produccion debe aplicarse exclusivamente con `npx prisma migrate deploy`, despues de respaldo y antes de desplegar el commit que usa estas tablas.

## 4. Garantia de no regresion funcional
No se editaron flujos de compras, wildcards, admin o judge.
El registro por credenciales se amplio de forma aditiva con dos casillas de privacidad: una obligatoria para el aviso y una opcional para comunicaciones comerciales. El servidor conserva las validaciones de registro existentes y rechaza la creacion sin la aceptacion obligatoria.

## 5. Evidencia de validacion tecnica
- Sin errores en archivos nuevos:
  - [app/api/privacy/rights/route.ts](app/api/privacy/rights/route.ts)
  - [app/api/privacy/export/route.ts](app/api/privacy/export/route.ts)

## 5.1 Matriz de evidencia legal-tecnica
- Art. 14 ter (canal de derechos): [app/api/privacy/rights/route.ts](app/api/privacy/rights/route.ts)
- Portabilidad (respuesta estructurada): [app/api/privacy/export/route.ts](app/api/privacy/export/route.ts)
- Trazabilidad de solicitudes: [app/api/privacy/rights/route.ts](app/api/privacy/rights/route.ts)
- Registro operativo y plazos: [.compliance/INSTRUCTIVO.md](.compliance/INSTRUCTIVO.md)

## 5.2 Validacion de la fase MFA y retencion
- `npx prisma migrate dev --name add_privileged_mfa`: migracion aplicada correctamente.
- `npx prisma migrate dev --name add_data_retention_audit`: migracion aplicada correctamente.
- `npx prisma generate`: ejecutado despues de cada migracion para sincronizar Prisma Client.
- `npx tsc --noEmit`: no reporta errores en los archivos de privacidad, MFA, middleware ni retencion agregados por esta implementacion.
- El repositorio mantiene errores preexistentes, fuera de este alcance, en rutas administrativas de publicaciones/compras/eventos/usuarios y en `components/home/MissionVisionValues.tsx`.
- `npx prisma generate`: ejecutado despues de incorporar los modelos de privacidad, sin crear ni aplicar migraciones.
- Sin errores de tipos en [lib/privacy.ts](lib/privacy.ts), [app/api/auth/register/route.ts](app/api/auth/register/route.ts) y [app/auth/register/page.tsx](app/auth/register/page.tsx). El formulario conserva tres avisos Tailwind preexistentes que recomiendan la sintaxis `bg-linear-to-*`.

## 6. Pendientes para cumplimiento integral
- Configurar `MFA_ENCRYPTION_KEY` y `MFA_SESSION_SECRET` en todos los entornos y enrolar las cuentas admin/judge.
- Configurar `CRON_SECRET` en Vercel y revisar la primera ejecucion de DataRetentionRun.
- Implementar seudonimizacion en reporteria/datasets secundarios.
- Formalizar firma contractual DPA y mecanismos de transferencia por proveedor.
- Completar datos corporativos faltantes en documentos ([COMPLETAR ...]).
- Publicar la politica de privacidad definitiva con los datos corporativos completos.
- Definir responsable que verifica identidad, comunica prorrogas/resoluciones y ejecuta operaciones de rectificacion, supresion, bloqueo u oposicion caso a caso.
- Definir plazo de retencion y control de acceso para `AuditLog`.
- Respaldar la base productiva, configurar variables de entorno y aplicar las cuatro migraciones pendientes mediante el procedimiento de despliegue.

## 7. Como auditar rapido
1. Revisar estado en [.compliance/state.json](.compliance/state.json).
2. Revisar documentos en [.compliance/docs](.compliance/docs).
3. Probar canal de derechos:
- POST y GET en [app/api/privacy/rights/route.ts](app/api/privacy/rights/route.ts)
- GET de portabilidad en [app/api/privacy/export/route.ts](app/api/privacy/export/route.ts)
4. Verificar trazabilidad:
- Confirmar que cada solicitud de derechos queda con metadata (requestedAt, ip, userAgent).
- Confirmar que cada exportacion genera evento [PRIVACY_EXPORT] PORTABILIDAD.
5. Revisar cierre ejecutivo en [.compliance/RESUMEN.md](.compliance/RESUMEN.md).

---
DISCLAIMER: Este documento no constituye asesoria legal. Es una bitacora tecnica de implementacion de cumplimiento basada en Ley 21.719.
