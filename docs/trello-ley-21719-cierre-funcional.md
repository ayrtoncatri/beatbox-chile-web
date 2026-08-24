# Trello — Cierre funcional Ley 21.719 (rama feat/ley-21719-cookies-nna-arco)

Fecha: 2026-08-23  
Rama: `feat/ley-21719-cookies-nna-arco`  
Objetivo: tickets para el tablero, uno por tarjeta. No incluye el rediseño UI (sigue en stash de `main`).

---

## Lista: Hecho en esta rama (codigo)

### Tarjeta 1 — Politica y banner de cookies
- **Etiqueta:** Ley 21.719 / Privacidad
- **Por que:** Las cookies/embeds que identifican son dato personal. YouTube transfiere IP a Google. No hay ley especial de cookies en Chile; aplica Art. 12 y 14 ter.
- **Que se hizo:**
  - Pagina `/privacidad/cookies`
  - Banner no modal (opt-in YouTube, default solo necesarias)
  - Link en footer + "Gestionar cookies"
  - API `GET/POST /api/privacy/cookies`
  - Embed publico con facade: no carga YouTube hasta autorizar
  - Jueces/admin no se bloquean
- **Archivos:** `lib/cookie-consent.ts`, `lib/cookies-policy.ts`, `components/privacy/CookieConsent*`, `components/privacy/ConsentYouTubeEmbed.tsx`, `app/privacidad/cookies/page.tsx`, `app/api/privacy/cookies/route.ts`, `app/layout.tsx`, `components/Footer.tsx`, `components/wildcards/ListaWildcards.tsx`, `components/public/WildcardVideoCard.tsx`
- **QA:**
  - [ ] Entrar de incognito: banner visible, wildcards publicas sin iframe de YouTube
  - [ ] "Solo necesarias": se puede navegar; videos siguen bloqueados
  - [ ] "Aceptar YouTube": se carga el facade lite / youtube-nocookie
  - [ ] Footer → Gestionar cookies reabre el banner
  - [ ] `/admin` y `/judge` no muestran el banner
  - [ ] Login, compra y registro siguen iguales

### Tarjeta 2 — Menores de 14 anos (Art. 16 quater)
- **Etiqueta:** Ley 21.719 / NNA
- **Por que:** `birthDate` se guardaba sin autorizacion parental.
- **Que se hizo:**
  - Si la fecha implica <14, el perfil exige nombre del cuidador + casilla de autorizacion
  - Se persiste evidencia (`parentalGuardianName`, `parentalConsentAt`, `PrivacyConsent` method `parental_guardian`)
  - Aviso en registro (no se agrego fecha de nacimiento al alta: minimizacion)
  - Politica: seccion 11 NNA
- **Archivos:** `lib/privacy/age.ts`, `lib/privacy/parental.ts`, `components/perfil/PerfilForm.tsx`, `app/perfil/actions.ts`, `app/api/user/update/route.ts`, `app/auth/register/page.tsx`, migracion `20260823153000_add_cookies_and_parental_consent`
- **QA:**
  - [ ] Perfil con fecha de adulto: guarda como antes, sin bloque extra
  - [ ] Fecha de un niño: no deja guardar sin nombre + check
  - [ ] Con autorizacion: guarda y no rompe el resto del perfil
  - [ ] Registro sigue creando cuenta igual

### Tarjeta 3 — ARCO: mapa PII, export, oposicion y supresion
- **Etiqueta:** Ley 21.719 / Derechos
- **Por que:** El mapa no cubria inscripciones/scores/battles; la oposicion solo apagaba marketing.
- **Que se hizo:**
  - Mapa PII ampliado (Inscripcion, Puntaje, Score, Battle, notas wildcard, tutor)
  - Export/supresion cubren esos campos (anonimizan PII, conservan historial estructural)
  - Formulario de derechos: alcance MARKETING / COOKIES / NON_ESSENTIAL
- **Archivos:** `lib/privacy/data-map.ts`, `lib/privacy/fulfill-request.ts`, `components/privacy/PrivacyRightsForm.tsx`
- **QA:**
  - [ ] Solicitar oposicion cookies y FULFILL: deja de cargar YouTube en sesion
  - [ ] Oposicion marketing: igual que antes
  - [ ] Export autenticado incluye inscripciones y puntajes
  - [ ] Supresion anonimiza nombre artistico de inscripcion y no borra compras

### Tarjeta 4 — Cabeceras de privacidad
- **Etiqueta:** Seguridad
- **Que se hizo:** `Referrer-Policy`, `X-Content-Type-Options`, `Permissions-Policy` (camara/micro/geo desactivados) en `next.config.ts`
- **QA:**
  - [ ] DevTools → Network → documento HTML trae esos headers
  - [ ] Compra y OAuth Google siguen funcionando

### Tarjeta 5 — Documentacion de cumplimiento
- **Etiqueta:** Docs
- **Que se hizo:** RAT v1.2, consentimiento (seccion cookies), canal de derechos, `.compliance/docs/21719-cookies.md`, briefing PPT ya existente, este archivo Trello
- **QA:**
  - [ ] Revisar textos publicos `/privacidad` y `/privacidad/cookies`

---

## Lista: Pendiente organizacional (no es codigo)

Copiar cada una como tarjeta aparte. El software no puede cerrarlas.

### Tarjeta A — Identidad del responsable (P0)
- Completar razon social, RUT, domicilio, representante legal, correo `privacidad@…`
- Publicar politica sin `[COMPLETAR]` (bump de version)
- Firmar acta `.compliance/docs/21719-acta-responsable.md`

### Tarjeta B — Go-live produccion (P0)
- Seguir `.compliance/docs/21719-despliegue-produccion.md`
- Backup BD + `prisma migrate deploy` (incluye esta migracion nueva)
- Env: `MFA_ENCRYPTION_KEY`, `MFA_SESSION_SECRET`, `CRON_SECRET`
- Enrolar MFA admin/juez
- Primera corrida de retencion

### Tarjeta C — DPA y transferencias (P1)
- Firmar DPA Vercel, BD, Resend, Google, Transbank, Mercado Pago, Cloudinary
- Cerrar pais/mecanismo (clausulas modelo Min. Economia si aplica)
- Archivar PDF fuera de git
- Checklist: `.compliance/docs/21719-checklist-dpa-transferencias.md`

### Tarjeta D — Backups con restore (P1)
- Proveedor BD, RPO/RTO, fecha de ultima prueba de restore en `.compliance/docs/21719-backups.md`

### Tarjeta E — Operacion del canal de derechos (P1)
- Nombrar titular + suplente de `/admin/privacidad`
- Entrenar verificacion de identidad y plazo 30 dias
- Simulacro de brecha 60 min (Art. 14 sexies)

### Tarjeta F — Liga terapeutica (P2, no digitalizar salud)
- Prohibido capturar datos de salud en la web o WhatsApp del equipo sin EIPD y consentimiento expreso Art. 16 / 16 bis

### Tarjeta G — MPI voluntario (P3)
- Decidir si se adopta Modelo de Prevencion de Infracciones (atenuante Arts. 49-53)

---

## Lista: Fuera de alcance a proposito
- No se toco el rediseño UI (stash en `main`)
- No se inventaron RUT ni razon social
- No se borra historial competitivo ni compras (causal tributaria)
- No se copio el plazo GDPR de 72 h
- Jueces siguen viendo YouTube sin el banner publico

---

DISCLAIMER: Material operativo, no asesoria legal.
