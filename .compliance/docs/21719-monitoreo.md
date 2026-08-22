# Monitoreo baseline de seguridad / deteccion

Fecha: 2026-08-22
Referencia skill: `compliance-cl/references/build/monitoreo.md`

## Objetivo

Deteccion periodica (no SOC 24/7) de secretos filtrados y eventos sensibles en AuditLog.

## 1. Secret scanning

- Activar **GitHub secret scanning + push protection** en el repo (Settings > Code security).
- Complemento en CI: workflow [`.github/workflows/gitleaks.yml`](../../.github/workflows/gitleaks.yml).

## 2. Alertas sobre AuditLog

Eventos a vigilar:

- `PRIVACY_EXPORT` / `PRIVACY_ACCESS` (volumen anomalo)
- `PRIVACY_ERASURE`
- `PRIVACY_BLOCK`
- MFA desactivado / reset
- `DATA_RETENTION_FAILED`

Canal de alerta propuesto: correo del responsable de datos o Slack del equipo.

## 3. HIBP (opcional)

- Pwned Passwords (k-anonymity) gratis para chequeos de password.
- Monitoreo de dominio: plan de pago en haveibeenpwned.com — verificar precio vigente.

## 4. Limite honesto

Esto no reemplaza DLP ni vigilancia en vivo. Cubre primera linea barata alineada a `inc-brechas`.

## Checklist de activacion

- [ ] Secret scanning / push protection en GitHub
- [ ] Workflow Gitleaks verde en CI
- [ ] Regla de alerta sobre fallas de retencion y exports masivos
- [ ] Contacto de alerta = responsable de datos

---
DISCLAIMER: Documento tecnico; no constituye asesoria legal.
