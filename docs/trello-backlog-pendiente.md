# Trello — Backlog pendiente del proyecto

Fecha: 2026-09-01 (revisado el mismo día: se separan los ítems de venta de entradas)
Para: cualquier desarrollador del equipo (no requiere haber estado en las sesiones anteriores)
Fuente: `ARCHITECTURE.md` §11 (Deuda técnica y riesgos) y §15 (Recomendaciones priorizadas), más los hallazgos de la revisión del 2026-09-01.

Cada tarjeta es independiente y copiable tal cual al tablero. Incluye qué hacer, por qué importa, dónde tocar y cómo verificar. Los números entre paréntesis (§11.x) apuntan a la sección de `ARCHITECTURE.md` con el detalle técnico completo — léela antes de empezar cualquiera de estas.

> ⚠️ **Nota sobre venta de entradas:** el módulo de compra/venta de entradas (Mercado Pago, `TicketType`, `Compra`, flujo legado de compra) **no se está usando actualmente y no está decidido si se va a usar**. Por eso no hay tarjetas activas sobre ese módulo en este documento — están todas juntas en la sección "Fuera de alcance por ahora" al final, solo como referencia para cuando se retome esa decisión.

---

## 🔴 Alta prioridad (bugs activos y seguridad)

### 1. Corregir `ensureAdminApi()` con resultado ignorado en rutas de sugerencias
- **Qué pasa:** en `api/admin/sugerencias/{route,[id],export}` se escribe `await ensureAdminApi();` sin `if (guard) return guard;`. La función devuelve la respuesta de error en vez de lanzarla, por lo que ese `await` no bloquea nada. Hoy queda cubierto por `middleware.ts`, pero es una sola capa de defensa.
- **Qué hacer:** alinear esas rutas con el patrón correcto que ya usa `api/admin/eventos` (capturar el resultado y retornarlo si corresponde).
- **Nota:** el mismo bug existe también en `api/admin/compras/*`, pero esas rutas quedan fuera de alcance por ahora (ver nota al inicio del documento).
- **Verificar:** llamar esas rutas sin sesión de admin y confirmar que responden 401/403, no 200.
- **Detalle técnico:** §11 Seguridad, punto 2

### 2. `approveWildcard` no crea la inscripción pese a informar que sí
- **Qué pasa:** el flujo de aprobación de wildcard (§9.1 de `ARCHITECTURE.md`) le dice al usuario que quedó inscrito, pero no crea el registro de `Inscripcion`.
- **Qué hacer:** revisar `approveWildcard` (server action del flujo de wildcards) y hacer que cree la inscripción real dentro de la misma transacción de aprobación.
- **Verificar:** aprobar un wildcard de prueba y confirmar que aparece en la tabla `Inscripcion`, no solo el mensaje de éxito.
- **Detalle técnico:** §11 Calidad, punto 9; flujo completo en §9.1

---

## 🟠 Prioridad media

### 3. Decidir el futuro de `/api/admin/eventos`, `/api/admin/usuarios`, `/api/admin/wildcards`
- **Qué pasa:** parecen código huérfano — nada en el frontend las llama (la UI real usa las Server Actions de `app/admin/*/actions.ts`). Además ya fallan `npx tsc --noEmit` porque referencian columnas que no existen en el schema actual (`lugar`, `ciudad`, `direccion` en `Evento`; `nombres`/`apellidoPaterno`/`apellidoMaterno` sueltos en `User` en vez de vía `profile`).
- **Qué hacer:** confirmar primero que de verdad nadie las llama (ni un cliente externo, ni un script, ni Postman guardado por alguien del equipo). Si están muertas: borrarlas. Si se necesitan: migrarlas al schema actual.
- **Detalle técnico:** §11.20

### 4. Mostrar el mensaje real de validación en publicaciones
- **Qué pasa:** `app/admin/publicaciones/actions.ts` (líneas 95 y 144) usa `e.errors[0]?.message` sobre un `z.ZodError`, pero esta versión de Zod solo tiene `.issues`, no `.errors`. El usuario nunca ve el mensaje específico del campo inválido, siempre cae al mensaje genérico.
- **Qué hacer:** cambiar `.errors` por `.issues` en ambos lugares.
- **Verificar:** provocar un error de validación al crear/editar una publicación (ej. dejar el título vacío) y confirmar que el mensaje ahora es específico, no el genérico.
- **Detalle técnico:** §11.22

### 5. Rate limiting en endpoints sensibles
- **Qué pasa:** `/api/password/forgot`, `/api/auth/register` y el envío de sugerencias no tienen límite de intentos.
- **Qué hacer:** agregar rate limiting (por IP y/o por email) en esos tres endpoints.
- **Detalle técnico:** §11 Seguridad, punto 5

### 6. Pruebas unitarias de la lógica pura de brackets y puntajes
- **Qué pasa:** cero pruebas automatizadas en todo el proyecto. `getSeedingOrder`, el conteo de votos y el cálculo de `totalScore` de las batallas son funciones puras, fáciles de testear y de alto impacto si fallan.
- **Qué hacer:** agregar Jest o Vitest y empezar por esas tres funciones.
- **Detalle técnico:** §11 Calidad, punto 8

---

## 🟡 Prioridad baja (mantenibilidad y limpieza)

### 7. Dividir `app/admin/eventos/actions.ts` (713 líneas, 11 responsabilidades)
- Mezcla eventos, tickets, jueces, ranking, clasificación, categorías e inscritos en un solo archivo. Separar por dominio.
- **Ojo:** este archivo incluye lógica de tickets (venta de entradas). Al dividirlo, mover esa parte tal cual a su propio archivo sin modificarla — no es el momento de tocar esa funcionalidad (ver nota al inicio del documento).
- Detalle técnico: §11 Calidad, punto 11

### 8. Unificar el modelo `Puntaje` con `Score`
- `Puntaje` está semi-abandonado y solapado con `Score`. Decidir si migrar los datos que falten o eliminarlo directamente.
- Detalle técnico: §11 Calidad, punto 16

### 9. Agregar CI básico (typecheck + lint + build) en GitHub Actions
- Hoy toda validación es manual porque no hay carpeta `.github/`. Un workflow simple que corra `npx tsc --noEmit`, `npm run lint` y `npm run build` en cada PR evitaría que se sigan acumulando regresiones silenciosas (recordar que `next build` no falla por errores de tipo ni de lint, ver §11.7).
- Detalle técnico: §15, fila "Agregar CI"

### 10. Extraer constantes de negocio a configuración
- Strings como `"Campeonato Nacional"` o `"SOLO"` están hardcodeados en la lógica en vez de vivir en una configuración central. Reduce el acoplamiento a los datos semilla.
- Detalle técnico: §15, última fila

### 11. Renombrar `/api/Sugerencias` a minúscula
- Es la única ruta con mayúscula inicial, rompe la convención kebab/minúscula del resto. Ojo: hay que actualizar también el o los `fetch()` que la llaman.
- Detalle técnico: §11 Calidad, punto 13

### 12. Cachear roles en el JWT en vez de consultar la BD en cada callback
- El callback `jwt` de NextAuth consulta la base de datos en cada llamada (§7.1). Funciona bien pero es costoso a escala. Alternativa: cachear roles en el token y refrescar solo ante cambios explícitos (ej. al cambiar el rol de un usuario).
- Detalle técnico: §11 Rendimiento, punto 17

### 13. Medir el impacto de `Mascota.tsx` (40 KB) en el bundle
- Se monta en el root layout, o sea en todas las páginas del sitio. Vale la pena medir cuánto pesa en el bundle de cliente y si conviene cargarlo de forma diferida (`next/dynamic`).
- Detalle técnico: §11 Rendimiento, punto 18

### 14. Revisar el cálculo del podio (`getTop3`)
- Hoy promedia los scores de `FINAL` y `TERCER_LUGAR` para determinar el podio, en vez de leer los `winnerId` reales de las batallas. Puede dar un podio incorrecto si el promedio no coincide con el resultado real por votos.
- Detalle técnico: §11 Rendimiento, punto 19

### 15. Barrido de indentación NBSP (U+00A0) en el repo
- Se detectaron espacios NBSP en vez de espacios normales en partes de `SugerenciasTable.tsx`, `app/api/wildcard/route.ts`, `SugerenciaDetailDrawer.tsx`, `BracketMatch.tsx` (probablemente hay más, no se hizo un barrido completo del repo). No rompe nada en ejecución, pero puede confundir a otros editores/herramientas y a diffs de git.
- Detalle técnico: `docs/trello-buenas-practicas-legibilidad.md`, Tarjeta D

---

## 🚫 Fuera de alcance por ahora — Venta de entradas / Compras

El módulo de venta de entradas (compras, `TicketType`, Mercado Pago) **no se usa actualmente y no está decidido si se va a usar**. Estos ítems quedan documentados solo como referencia para cuando el equipo retome esa decisión — **no crear tarjetas de Trello con esto todavía**:

- Botón "eliminar compra" del admin devuelve 500 (`prisma.compraEntrada` no existe, el modelo real es `Compra`) — §11.21
- Falta validar la firma del webhook de Mercado Pago (`app/api/compra/webhook-mp/route.ts`) — §11 Seguridad, punto 1
- `ensureAdminApi()` con resultado ignorado en `api/admin/compras/{route,[id],export}` — §11 Seguridad, punto 2
- `console.log` de `tx.apiKey` y commerce code en `api/compra/crear-orden/route.ts` — §11 Seguridad, punto 3
- `idempotencyKey: 'abc'` hardcodeada en `lib/mercadopago.ts` — §11 Seguridad, punto 4
- `capacity` de `TicketType` nunca se valida (riesgo de sobreventa) — §11 Seguridad, punto 6
- `CompraDetailDrawer.tsx` lee campos que no existen en la respuesta real de `getCompraById()` — §11.12
- Dos flujos de compra coexistiendo; el legado (`/api/compra-entradas`) crea compras sin cobrar — §11 Calidad, punto 10

## No incluido a propósito

- **Reactivar `ignoreBuildErrors`/`--no-lint` en el build** (§11.7, fila 🔴 de §15): no se incluyó como tarjeta suelta porque activar esa verificación en el build hará fallar el build actual hasta resolver los errores de `tsc` no relacionados a ventas (tarjetas 3 y 4 de arriba). Los errores de `tsc` del módulo de compras (§11.21, y los de `TicketType`/`Compra` si los hay) **no se resuelven mientras ese módulo siga fuera de alcance** — al reactivar la verificación, probablemente haya que excluir esos archivos puntualmente (`// @ts-expect-error` con comentario explicando por qué) en vez de arreglarlos.
- Los ítems ya cerrados en la pasada de legibilidad (tipado, `any`, `<img>` → `next/image`, etc.) no están acá — ver `docs/trello-buenas-practicas-legibilidad.md` para el historial de lo ya hecho.
