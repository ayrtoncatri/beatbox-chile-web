# Checklist de despliegue a produccion - Ley 21.719

Estado: listo para ejecutar en el entorno productivo. No aplica cambios destructivos de esquema.

## 0. Precondiciones

- [ ] Acceso a Vercel (o hosting) y a la base PostgreSQL de produccion.
- [ ] Ventana de mantenimiento acordada (recomendado < 15 min).
- [ ] Commit de compliance desplegable identificado en git.

## 1. Respaldo

- [ ] Crear snapshot/backup de la BD productiva (proveedor: Neon/Supabase/RDS/otro).
- [ ] Verificar que el backup es restaurable (al menos listar objetos o restaurar en staging).
- [ ] Anotar fecha/hora y ubicacion del backup.

## 2. Variables de entorno (produccion)

Generar secretos (no reutilizar los de desarrollo):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Configurar en el hosting:

- [ ] `MFA_ENCRYPTION_KEY` (32 bytes en base64 o hex, segun `lib/mfa.ts`)
- [ ] `MFA_SESSION_SECRET`
- [ ] `CRON_SECRET` (Bearer para `/api/internal/data-retention`)
- [ ] Confirmar `NEXTAUTH_SECRET`, `DATABASE_URL`, `RESEND_API_KEY`, pasarelas de pago

## 3. Migraciones

Orden obligatorio:

1. Respaldo OK
2. Desplegar codigo que incluye las migraciones (o aplicar migraciones justo antes del traffic)
3. Ejecutar:

```bash
npx prisma migrate deploy
```

Migraciones de compliance esperadas:

- `20260822021324_add_privileged_mfa`
- `20260822022124_add_data_retention_audit`
- `20260822032009_add_privacy_governance`
- `20260822180000_add_processing_block`
- `20260823153000_add_cookies_and_parental_consent` (cookies + tutor NNA)

En local (2026-08-23) `prisma migrate deploy` aplico la de cookies contra `localhost:5432/beatbox`. Produccion sigue pendiente.

- [ ] `prisma migrate status` sin migraciones pendientes
- [ ] Smoke: login, registro, admin, compra de prueba

## 4. MFA privilegiado

- [ ] Un admin entra a `/admin` y completa enrolamiento TOTP
- [ ] Verificar challenge en nuevo login
- [ ] Guardar recovery codes fuera de linea
- [ ] Repetir para cada cuenta `admin` y `judge` activa
- [ ] Probar `npm run mfa:reset` solo en staging si se necesita recuperacion

## 5. Retencion diaria

- [ ] Confirmar cron en `vercel.json`: `0 4 * * *` → `/api/internal/data-retention`
- [ ] Disparar una corrida manual con `Authorization: Bearer $CRON_SECRET`
- [ ] Verificar fila `DataRetentionRun` con `status=COMPLETED`
- [ ] Verificar evento `DATA_RETENTION_COMPLETED` en `AuditLog`

## 6. Canal de privacidad

- [ ] Abrir `/privacidad` y `/privacidad/derechos`
- [ ] Crear solicitud autenticada y sin sesion
- [ ] Completar una solicitud desde `/admin/privacidad`
- [ ] Descargar export desde `/api/privacy/export`
- [ ] Confirmar correo de acuse (si `RESEND_API_KEY` esta activo)

## 7. Cierre

- [ ] Actualizar `.compliance/state.json` tras la corrida operativa
- [ ] Archivar evidencia (screenshots o IDs de tickets/AuditLog) en carpeta interna

---
DISCLAIMER: Este documento no constituye asesoria legal. Es un runbook tecnico de despliegue para controles de Ley 21.719.
