# Trello — Cambios pedidos por el cliente (simplificación del sitio / ANBP)

Fecha: 2026-09-01
Origen: checklist entregado por el cliente (captura de pantalla, 14 ítems).
Estado: **solo organización — nada de esto está implementado todavía.** Cada tarjeta indica dónde tocar y qué depende de qué, para poder ir metiéndolas de a una sin romper otra cosa ni tener que rehacer trabajo.

Léelo antes de armar el tablero: hay 3 tarjetas con una pregunta abierta que conviene resolver con el cliente **antes** de empezar a programar, porque cambian el tamaño del trabajo. Están marcadas con ❓.

---

## Cómo lo ordené

- **Fase 1 — Contenido y navegación:** sacar/ocultar secciones y páginas. Bajo riesgo, cada tarjeta es independiente, no dependen unas de otras.
- **Fase 2 — Cuenta y datos personales:** tocan login, registro y qué datos se piden. Alto impacto porque cruzan todo el sitio (admin, jueces, wildcards, perfil). Conviene resolver la pregunta abierta antes de tocar código.
- **Fase 3 — Contenido nuevo:** el banner de comunidad, que no es "sacar" sino "agregar/cambiar" — necesita insumos del cliente (imagen, texto) antes de poder programarse.

---

## Fase 1 — Contenido y navegación

### Tarjeta 1 — Ocultar Ranking Nacional hasta que esté actualizado
- **Qué hacer:** ocultar el bloque `Clasificados` de la página Liga Competitiva (no borrarlo del código — es "hasta que esté actualizado", va a volver).
- **Dónde:** `components/liga-competitiva/Clasificados.tsx`, montado en `app/liga-competitiva/page.tsx`.
- **Cómo:** lo más simple y reversible es un flag simple (ej. comentar el `<Clasificados />` en la page, o un `if (false)` documentado) — no conviene borrar el componente porque se va a reactivar cuando esté al día.
- **Riesgo:** bajo. No depende de otras tarjetas.

### Tarjeta 2 — Quitar "Reglamento Oficial" y la "Rúbrica de Evaluación"
- **Qué hacer:** sacar el bloque de reglas de la página Liga Competitiva.
- **Dónde:** `components/liga-competitiva/ReglasLiga.tsx`, montado en `app/liga-competitiva/page.tsx`.
- ❓ **Pregunta abierta:** en el código actual, "Reglamento oficial" (título de la sección) y "Rúbrica de Evaluación" **son la misma sección** — el reglamento tiene 3 tarjetas: "Formatos Oficiales", "Criterios de Jueceo" (esto parece ser la rúbrica) y "Código de Conducta". El checklist las lista como dos ítems separados. Confirmar con el cliente: ¿se saca todo el bloque `ReglasLiga` completo, o solo la tarjeta de "Criterios de Jueceo" y el resto del reglamento se queda?
- **Riesgo:** bajo una vez resuelta la pregunta. No depende de otras tarjetas.

### Tarjeta 3 — Quitar Aliados Estratégicos
- **Qué hacer:** sacar el bloque de colaboradores/aliados de la página Liga Competitiva.
- **Dónde:** `components/liga-competitiva/Colaboradores.tsx`, montado en `app/liga-competitiva/page.tsx`.
- **Riesgo:** bajo. No depende de otras tarjetas.

### Tarjeta 4 — Quitar Liga Terapéutica
- **Qué hacer:** sacar la página completa y su entrada de menú.
- **Dónde:** `app/liga-terapeutica/page.tsx` (página), `components/Header.tsx` (submenú "Ligas" → "Liga Terapéutica"), revisar también `components/layout/MobileMenu.tsx` (menú mobile, probablemente replica el mismo árbol de navegación).
- **Decidir:** ¿se borra la página (404 si alguien tiene el link guardado) o se deja pero sin acceso desde el menú? Recomendado: si nadie más la referencia, borrarla — un link roto guardado por un usuario es menos grave que mantener código muerto.
- **Riesgo:** bajo. No depende de otras tarjetas.

### Tarjeta 5 — Sacar "Quiénes Somos" (sin redirigir)
- **Qué hacer:** sacar la página y su entrada de menú. **Confirmado con el cliente: sin redirección**, se saca directo (a diferencia de Blog y Noticias, que si redirige — ver Tarjeta 6).
- **Dónde:** `app/quienes-somos/page.tsx` (página), `components/Header.tsx` línea del `navItems` (`Quiénes Somos`), `components/layout/MobileMenu.tsx`.
- **Riesgo:** bajo. No depende de otras tarjetas.

### Tarjeta 6 — Sacar Blog y Noticias (redirigir a ANBP)
- **Qué hacer:** sacar las secciones de Blog y Noticias del sitio y redirigir a la página de blog/noticias de ANBP.
- **Dónde (varios puntos, es la tarjeta con más superficie de esta fase):**
  - `app/page.tsx` — filas `<PublicacionesRow title="Blog" tipo="blog" />` y `<PublicacionesRow title="Noticias" tipo="noticia" />` en el home.
  - `components/home/NoticiasList.tsx` — otro bloque de noticias en el home, separado del anterior.
  - `app/publicaciones/[id]/page.tsx` — página pública de detalle de una publicación.
  - `app/admin/publicaciones/**` — el panel admin donde se cargan blog/noticias. Si ya no se van a mostrar públicamente, decidir si el panel admin se saca también o se deja (por si ANBP igual quiere que alguien cargue contenido ahí a futuro).
- ❓ **Pregunta abierta:** ¿la redirección es a nivel de sitio completo (ej. un solo link "Blog y Noticias" en el menú que apunta afuera) o hay que redirigir cada URL individual de publicación (`/publicaciones/[id]`) por si Google ya indexó alguna? Afecta si esto es un cambio de una tarde o si hay que armar redirects 301 caso por caso.
- **Riesgo:** medio, por la cantidad de lugares que tocar. No depende de otras tarjetas, pero conviene hacerla completa de una vez (si se saca del home pero se deja la página de detalle viva, queda un cabo suelto).

### Tarjeta 7 — Sacar Misión, Visión y Valores
- **Qué hacer:** sacar el bloque del home.
- **Dónde:** `components/home/MissionVisionValues.tsx`, montado en `app/page.tsx`.
- **Nota:** este componente ya tiene 3 errores de `tsc` preexistentes y documentados (tipos de `framer-motion`, ver `ARCHITECTURE.md` §11.7) — al sacarlo del home, esos 3 errores probablemente desaparecen solos como efecto secundario, no hace falta arreglarlos aparte.
- **Riesgo:** bajo. No depende de otras tarjetas.

### Tarjeta 8 — Actualizar "Síguenos" del footer
- **Qué hacer:** cambiar el texto de esa tarjeta del footer para agregar "Página administrada por: @anbp.chile en Instagram", manteniendo (o no, confirmar) el link a Instagram de Beatbox Chile.
- **Dónde:** `components/Footer.tsx`, bloque "Síguenos" (~línea 71-93).
- **Decidir:** ¿la cuenta de Instagram que enlaza el botón sigue siendo `@beatbox.chile` con el texto aclaratorio de @anbp.chile al lado, o el link mismo cambia a la cuenta de ANBP?
- **Riesgo:** muy bajo, es texto. No depende de otras tarjetas.

---

## Fase 2 — Cuenta y datos personales (alto impacto, resolver la pregunta antes de programar)

### Tarjeta 9 — ❓ Definir el alcance real de "Sin login" / "Sacar Socio" / "Sin datos personales"
- **Antes que nada:** esta no es una tarjeta de desarrollo, es una tarjeta de **decisión** — hay que resolverla con el cliente antes de que cualquiera de las tarjetas 10, 11 o 12 se pueda estimar en serio.
- **Por qué es grande:** hoy el mismo sistema de login (NextAuth) lo usan los visitantes que se hacen "Socio" (botón `Ser Socio` → `/auth/register`), el panel admin, el panel de jueces, y el flujo de postulación a wildcard. Sacar "el login" puede significar cosas muy distintas en tamaño:
  - **Opción A (chica):** sacar el registro/login público para visitantes — el botón "Ser Socio", la sección "Socio activo" del menú de usuario — pero admin y jueces se lo siguen manejando por dentro (con o sin botón visible en el header).
  - **Opción B (grande):** eliminar todo el sistema de autenticación, incluido cómo entran hoy los admins y los jueces — implica rediseñar cómo se gestionan eventos, jueceo y wildcards sin cuentas de usuario.
- **Qué hacer:** llevarle estas dos opciones al cliente tal cual están redactadas y que elija una (o describa una tercera). Con la respuesta, las tarjetas 10, 11 y 12 se vuelven a redactar con alcance concreto.
- **Relacionado:** "sin datos personales, solo artísticos" probablemente define qué le queda al formulario de postulación a wildcard (¿nombre artístico sí, RUT/dirección no?) — mismo tipo de pregunta, mejor resolverla junto con esta.

### Tarjeta 10 — Sacar "Socio" (pendiente de alcance, ver Tarjeta 9)
- **Qué se sabe hoy:** "Socio" aparece en `components/home/AuthButtons.tsx` — el botón "Ser Socio" (va a `/auth/register`) y la etiqueta "Socio activo" que se muestra cuando hay sesión iniciada.
- **Qué falta:** definir según la Tarjeta 9 si esto es solo un cambio de copy/UI (sacar el botón y la palabra "Socio") o si implica sacar el flujo de registro completo.
- **Detalle técnico de referencia:** `app/auth/register/page.tsx`, `app/api/auth/register/route.ts`.

### Tarjeta 11 — Sin login (pendiente de alcance, ver Tarjeta 9)
- **Qué se sabe hoy:** el login vive en `app/auth/login/page.tsx`, gestionado por NextAuth (`lib/auth.ts`). Se usa desde el header (`components/Header.tsx`, `components/home/AuthButtons.tsx`) y protege `/admin`, `/judge`, `/perfil`, `/wildcard`.
- **Qué falta:** definir según la Tarjeta 9 el alcance real antes de tocar nada acá — es la tarjeta más grande de todo este documento si termina siendo la Opción B.

### Tarjeta 12 — Sin datos personales, solo artísticos (pendiente de alcance, ver Tarjeta 9)
- **Qué se sabe hoy:** hoy se piden datos personales en el registro (`app/auth/register/page.tsx`) y en el perfil (`app/perfil/page.tsx`, `components/perfil/PerfilForm.tsx`) — nombres, apellidos, y según el modelo `UserProfile` en `prisma/schema.prisma`, probablemente más.
- **Qué falta:** definir con el cliente qué datos "artísticos" sí se necesitan (¿nombre de batalla, categoría, red social?) y cuáles personales se sacan. Esto además cruza con el trabajo de cumplimiento de la Ley 21.719 ya hecho en el proyecto (`docs/trello-ley-21719-cierre-funcional.md`, `.compliance/`) — si se dejan de pedir datos personales, hay que revisar si esa documentación de cumplimiento necesita actualizarse también (menos datos = menos superficie que proteger, pero el RAT y las políticas de privacidad quedarían desactualizados si no se tocan).

---

## Fase 3 — Contenido nuevo

### Tarjeta 13 — Banner de la comunidad
- **Qué se sabe hoy:** el home ya tiene un banner (`components/home/Banner.tsx`) con un carrusel de 3 imágenes, y esas imágenes ya son de ANBP (los nombres de archivo en Cloudinary son `ANBP-1`, `ANBP-2`, `ANBP-3`). No es obvio si "banner de la comunidad" es este mismo banner con contenido nuevo, o un banner adicional en otro lugar del sitio.
- **Qué falta (esto no es un bloqueo de decisión como la Tarjeta 9, es simplemente que faltan insumos):**
  - Confirmar si reemplaza el banner ANBP actual o se agrega aparte.
  - Conseguir del cliente: la imagen (o imágenes) y el texto/link que debe llevar el banner.
- **Dónde:** `components/home/Banner.tsx`.
- **Riesgo:** bajo en código, depende de que el cliente entregue el material.

---

## Resumen para armar el tablero

| # | Tarjeta | Fase | Riesgo | ¿Depende de una pregunta abierta? |
|---|---|---|---|---|
| 1 | Ocultar Ranking Nacional | 1 | Bajo | No |
| 2 | Quitar Reglamento Oficial / Rúbrica | 1 | Bajo | ❓ Sí — Tarjeta 2 |
| 3 | Quitar Aliados Estratégicos | 1 | Bajo | No |
| 4 | Quitar Liga Terapéutica | 1 | Bajo | No |
| 5 | Sacar Quiénes Somos (sin redirigir) | 1 | Bajo | No — ya resuelto |
| 6 | Sacar Blog y Noticias (redirigir a ANBP) | 1 | Medio | ❓ Sí — alcance de la redirección |
| 7 | Sacar Misión, Visión y Valores | 1 | Bajo | No |
| 8 | Actualizar "Síguenos" del footer | 1 | Muy bajo | No |
| 9 | Definir alcance de login/Socio/datos | 2 | — (es la decisión) | ❓ Es la pregunta madre |
| 10 | Sacar "Socio" | 2 | Depende de #9 | Sí |
| 11 | Sin login | 2 | Depende de #9 | Sí |
| 12 | Sin datos personales | 2 | Depende de #9 | Sí |
| 13 | Banner de la comunidad | 3 | Bajo (falta insumo) | No, falta material |

**Sugerencia de orden de trabajo:** arrancar por la Fase 1 (tarjetas 1, 3, 4, 5, 7, 8 — no tienen preguntas abiertas, se pueden meter ya). En paralelo, resolver con el cliente las preguntas de las tarjetas 2, 6 y 9. Recién con la respuesta de la 9, dimensionar y repartir las tarjetas 10, 11 y 12.
