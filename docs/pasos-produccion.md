# Pasos de producción (tú los corres)

Local ya está listo: rama `feat/ley-21719-cookies-nna-arco`, migración de cookies aplicada en tu Postgres de `localhost`. El rediseño UI sigue en stash (`wip-ui-redesign-keep-off-compliance-branch`) y **no** va en este deploy.

No mezcles `main` con ese stash. No uses `prisma migrate dev` contra producción.

---

## 1. Subir la rama a GitHub

En PowerShell, en la carpeta del repo:

```powershell
git push -u origin feat/ley-21719-cookies-nna-arco
```

En GitHub: **Pull Request** de esa rama → `main`. Revisa que no entren `.env` ni el rediseño UI.

**Todavía no hagas merge.**

---

## 2. Backup de la base de producción

En el panel de Postgres (Neon, Vercel Postgres u otro): **Create snapshot / Backup**.

Anota fecha y hora. Sin backup, no sigas.

---

## 3. Migrar la base de producción (antes del merge)

Copia la `DATABASE_URL` de **producción** (Vercel → Settings → Environment Variables). No uses la de tu PC.

```powershell
$env:DATABASE_URL="pega-aqui-la-url-de-produccion"

npx prisma migrate status
npx prisma migrate deploy
```

Tiene que aplicar, si aún no está:

- `20260823153000_add_cookies_and_parental_consent`

Si `deploy` falla, **no hagas merge**.

---

## 4. Variables en Vercel (Production)

Confirma que existan:

- `DATABASE_URL`
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL`
- `MFA_ENCRYPTION_KEY`
- `MFA_SESSION_SECRET` (recomendado)
- `CRON_SECRET`
- claves de Transbank y Mercado Pago (si faltan, la app no arranca)

Cookies no piden una variable nueva.

---

## 5. Merge = deploy

Cuando el backup y `migrate deploy` estén OK:

1. En GitHub: **Merge** del PR a `main`.
2. Espera en Vercel el deploy **Ready**.
3. Abre el dominio de producción, no el preview.

---

## 6. Probar 5 minutos (incógnito)

- Sale el banner de cookies en la home.
- Wildcards públicas sin YouTube hasta aceptar.
- “Solo necesarias”: se navega; videos tapados.
- “Aceptar YouTube”: se ve el video.
- Footer → Gestionar cookies.
- `/privacidad` y `/privacidad/cookies` abren.
- Login, registro y checkout siguen.
- `/admin` y `/judge` sin banner.
- Perfil: adulto guarda igual; niño pide tutor.

Si se rompe: Vercel → **Instant Rollback**. La base migrada no se revierte sola; por eso el backup del paso 2.

---

## 7. Después (no bloquea el merge)

- Un admin entra a `/admin` y enrola MFA (y los jueces).
- La política sigue con `[COMPLETAR]` hasta que ANBP ponga RUT y domicilio.

Checklist largo: `.compliance/docs/21719-despliegue-produccion.md`.
