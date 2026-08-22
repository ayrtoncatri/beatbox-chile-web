# Medidas de seguridad tecnica - Ley 21.719

Fecha: 2026-08-22
Alcance: evidencia de controles `sec-tls`, `sec-rest`, `sec-logs`, `sec-tenant`, `sec-backups`.

## TLS / transito (`sec-tls`)

- Despliegue en **Vercel**: HTTPS terminado en el edge; HTTP redirige a HTTPS.
- Dominio de produccion debe servir solo por TLS 1.2+.
- HSTS: Vercel aplica HSTS en dominios de produccion; verificar en respuesta
  `Strict-Transport-Security` tras el go-live.
- Secrets y callbacks OAuth usan URLs `https://` en produccion (`NEXTAUTH_URL`).

## Cifrado en reposo (`sec-rest`)

- Base PostgreSQL gestionada: cifrado en reposo del proveedor (Neon/Supabase/RDS — documentar el proveedor concreto en el runbook de backups).
- Secretos MFA TOTP: AES-256-GCM a nivel de aplicacion (`lib/mfa.ts`, llave `MFA_ENCRYPTION_KEY`).
- Contrasenas: bcrypt (nunca texto plano).
- Codigos de recuperacion MFA: bcrypt, un solo uso.
- Cookies de sesion MFA: firmadas, HTTP-only.

## Logs y auditoria (`sec-logs`)

- Tabla append-oriented `AuditLog` (actor, accion, recurso, outcome, IP, user-agent, metadata, timestamp).
- Eventos cubiertos: export/acceso privacidad, cambios de estado de `PrivacyRequest`, MFA, retencion, ejecucion ARCO (bloque/supresion/rectificacion).
- Retencion de `AuditLog`: 730 dias, purga automatica en el job de retencion.
- Acceso: solo rol admin via panel `/admin/privacidad` y consultas BD controladas.
- No se registran secretos, TOTP ni contenido completo de exports.

## Segregacion multi-tenant (`sec-tenant`)

- **N/A / cumple por diseno:** Beatbox Chile opera como aplicacion **single-tenant** (una organizacion).
- No existe `organizationId` ni aislamiento multi-cliente SaaS.
- El control de acceso se basa en roles (`admin`, `judge`, `user`) y middleware privilegiado.

## Backups (`sec-backups`)

Ver [.compliance/docs/21719-backups.md](21719-backups.md).

---
DISCLAIMER: Documento tecnico de cumplimiento; no constituye asesoria legal.
