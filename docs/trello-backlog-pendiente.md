# Trello — Backlog pendiente del proyecto

Fecha: 2026-09-01
Para: cualquier desarrollador del equipo (no requiere haber estado en las sesiones anteriores)
Fuente: `ARCHITECTURE.md` §11 (Deuda técnica y riesgos) y §15 (Recomendaciones priorizadas), más los hallazgos de la revisión del 2026-09-01.

Cada tarjeta es independiente y copiable tal cual al tablero. Incluye qué hacer, por qué importa, dónde tocar y cómo verificar. Los números entre paréntesis (§11.x) apuntan a la sección de `ARCHITECTURE.md` con el detalle técnico completo — léela antes de empezar cualquiera de estas.

---

## 🔴 Alta prioridad (bugs activos y seguridad)

### 1. Arreglar el botón "eliminar compra" del panel admin (500 hoy)
- **Qué pasa:** `app/api/admin/compras/[id]/route.ts` llama a `prisma.compraEntrada`, un modelo que no existe en el schema (el modelo real es `Compra`). `components/admin/compras/ComprasTable.tsx` sí usa este endpoint (botón "eliminar"), así que hoy ese botón devuelve error 500.
- **Qué hacer:** cambiar `prisma.compraEntrada` por `prisma.compra` en `GET` y `DELETE`. Ojo con `DELETE`: decidir si debe borrar en cascada los `CompraItem` asociados (revisar si el schema ya tiene `onDelete: Cascade` en esa relación) o si debe fallar cuando hay items.
- **Verificar:** eliminar una compra de prueba desde `/admin/compras` y confirmar que no da 500 y que no deja huérfanos en `CompraItem`.
- **Detalle técnico:** §11.21

### 2. Validar la firma del webhook de Mercado Pago
- **Qué pasa:** `app/api/compra/webhook-mp/route.ts` es un endpoint público que marca compras como pagadas y no valida el header `x-signature`/`x-request-id`. Hoy hay un mitigante parcial (se re-consulta el pago a MP antes de actuar), pero sigue siendo el endpoint más sensible del sitio.
- **Qué hacer:** implementar la validación HMAC de firma que documenta Mercado Pago para webhooks.
- **Verificar:** una request al webhook sin firma válida (o con firma alterada) debe rechazarse antes de tocar la base de datos.
- **Detalle técnico:** §11 Seguridad, punto 1

### 3. Corregir las rutas admin donde `ensureAdminApi()` no bloquea nada
- **Qué pasa:** en `api/admin/compras/{route,[id],export}` y `api/admin/sugerencias/{route,[id],export}` se escribe `await ensureAdminApi();` sin `if (guard) return guard;`. La función devuelve la respuesta de error en vez de lanzarla, así que ese `await` no bloquea la ejecución. Hoy queda cubierto por `middleware.ts`, pero es una sola capa de defensa.
- **Qué hacer:** alinear esas 6 rutas con el patrón correcto que ya usa `api/admin/eventos` (capturar el resultado y retornarlo si corresponde).
- **Verificar:** llamar esas rutas sin sesión de admin y confirmar que responden 401/403, no 200.
- **Detalle técnico:** §11 Seguridad, punto 2

### 4. Eliminar los `console.log` de credenciales
- **Qué pasa:** `app/api/compra/crear-orden/route.ts` imprime `tx.apiKey` y el commerce code en consola.
- **Qué hacer:** quitar esos `console.log` (o reemplazarlos por logging que no incluya secretos) antes de operar en producción.
- **Detalle técnico:** §11 Seguridad, punto 3

### 5. `approveWildcard` no crea la inscripción pese a informar que sí
- **Qué pasa:** el flujo de aprobación de wildcard (§9.1 de `ARCHITECTURE.md`) le dice al usuario que quedó inscrito, pero no crea el registro de `Inscripcion`.
- **Qué hacer:** revisar `approveWildcard` (server action del flujo de wildcards) y hacer que cree la inscripción real dentro de la misma transacción de aprobación.
- **Verificar:** aprobar un wildcard de prueba y confirmar que aparece en la tabla `Inscripcion`, no solo el mensaje de éxito.
- **Detalle técnico:** §11 Calidad, punto 9; flujo completo en §9.1

---

## 🟠 Prioridad media

### 6. Decidir el futuro de `/api/admin/eventos`, `/api/admin/usuarios`, `/api/admin/wildcards`
- **Qué pasa:** parecen código huérfano — nada en el frontend las llama (la UI real usa las Server Actions de `app/admin/*/actions.ts`). Además ya fallan `npx tsc --noEmit` porque referencian columnas que no existen en el schema actual (`lugar`, `ciudad`, `direccion` en `Evento`; `nombres`/`apellidoPaterno`/`apellidoMaterno` sueltos en `User` en vez de vía `profile`).
- **Qué hacer:** confirmar primero que de verdad nadie las llama (ni un cliente externo, ni un script, ni Postman guardado por alguien del equipo). Si están muertas: borrarlas. Si se necesitan: migrarlas al schema actual.
- **Detalle técnico:** §11.20

### 7. Arreglar `CompraDetailDrawer.tsx` (probablemente siempre muestra vacío)
- **Qué pasa:** el componente lee campos planos (`compra.userNombre`, `compra.tipoEntrada`, `compra.cantidad`, `compra.precioUnitario`), pero `getCompraById()` devuelve el objeto anidado real de Prisma (`user.profile.nombres`, `items[].ticketType.name`, etc.). Esos campos planos no existen en la respuesta real.
- **Qué hacer:** decidir si el drawer debe recibir los datos ya aplanados (como hace la tabla) o si debe leer la forma anidada real, y ajustar uno de los dos lados.
- **Nota:** de paso, revisar si `CompraDetailDrawer`/`CompraDetailPopup` y `SugerenciaDetailDrawer`/`SugerenciaDetailPopup` son duplicados — parece que solo uno de cada par está en uso, conviene eliminar el que no se usa.
- **Detalle técnico:** §11.12

### 8. Mostrar el mensaje real de validación en publicaciones
- **Qué pasa:** `app/admin/publicaciones/actions.ts` (líneas 95 y 144) usa `e.errors[0]?.message` sobre un `z.ZodError`, pero esta versión de Zod solo tiene `.issues`, no `.errors`. El usuario nunca ve el mensaje específico del campo inválido, siempre cae al mensaje genérico.
- **Qué hacer:** cambiar `.errors` por `.issues` en ambos lugares.
- **Verificar:** provocar un error de validación al crear/editar una publicación (ej. dejar el título vacío) y confirmar que el mensaje ahora es específico, no el genérico.
- **Detalle técnico:** §11.22

### 9. Validar `capacity` de `TicketType` al crear una orden
- **Qué pasa:** el propio código lo admite con un comentario (`// Aquí podrías añadir lógica de validación de 'capacity' luego`). Hoy se puede sobrevender un evento.
- **Qué hacer:** validar en `crear-orden` que la cantidad disponible no se exceda antes de confirmar la compra.
- **Detalle técnico:** §11 Seguridad, punto 6

### 10. `idempotencyKey` hardcodeada en Mercado Pago
- **Qué pasa:** `lib/mercadopago.ts` usa el string literal `'abc'` como idempotency key.
- **Qué hacer:** generar una key única por transacción (ej. UUID o el id de la orden).
- **Detalle técnico:** §11 Seguridad, punto 4

### 11. Rate limiting en endpoints sensibles
- **Qué pasa:** `/api/password/forgot`, `/api/auth/register` y el envío de sugerencias no tienen límite de intentos.
- **Qué hacer:** agregar rate limiting (por IP y/o por email) en esos tres endpoints.
- **Detalle técnico:** §11 Seguridad, punto 5

### 12. Eliminar el flujo de compra legado
- **Qué pasa:** conviven dos flujos de compra de entradas (§9.4 de `ARCHITECTURE.md`); el legado (`/api/compra-entradas`) crea compras sin cobrar.
- **Qué hacer:** confirmar que nada lo usa en producción y eliminarlo, o marcarlo explícitamente como deprecado si aún se necesita por alguna razón.
- **Detalle técnico:** §11 Calidad, punto 10; flujo completo en §9.4

### 13. Pruebas unitarias de la lógica pura de brackets y puntajes
- **Qué pasa:** cero pruebas automatizadas en todo el proyecto. `getSeedingOrder`, el conteo de votos y el cálculo de `totalScore` son funciones puras, fáciles de testear y de alto impacto si fallan.
- **Qué hacer:** agregar Jest o Vitest y empezar por esas tres funciones.
- **Detalle técnico:** §11 Calidad, punto 8

---

## 🟡 Prioridad baja (mantenibilidad y limpieza)

### 14. Dividir `app/admin/eventos/actions.ts` (713 líneas, 11 responsabilidades)
- Mezcla eventos, tickets, jueces, ranking, clasificación, categorías e inscritos en un solo archivo. Separar por dominio.
- Detalle técnico: §11 Calidad, punto 11

### 15. Unificar el modelo `Puntaje` con `Score`
- `Puntaje` está semi-abandonado y solapado con `Score`. Decidir si migrar los datos que falten o eliminarlo directamente.
- Detalle técnico: §11 Calidad, punto 16

### 16. Agregar CI básico (typecheck + lint + build) en GitHub Actions
- Hoy toda validación es manual porque no hay carpeta `.github/`. Un workflow simple que corra `npx tsc --noEmit`, `npm run lint` y `npm run build` en cada PR evitaría que se sigan acumulando regresiones silenciosas (recordar que `next build` no falla por errores de tipo ni de lint, ver §11.7).
- Detalle técnico: §15, fila "Agregar CI"

### 17. Extraer constantes de negocio a configuración
- Strings como `"Campeonato Nacional"` o `"SOLO"` están hardcodeados en la lógica en vez de vivir en una configuración central. Reduce el acoplamiento a los datos semilla.
- Detalle técnico: §15, última fila

### 18. Renombrar `/api/Sugerencias` a minúscula
- Es la única ruta con mayúscula inicial, rompe la convención kebab/minúscula del resto. Ojo: hay que actualizar también el o los `fetch()` que la llaman.
- Detalle técnico: §11 Calidad, punto 13

### 19. Eliminar `prisma/dev.db` del repo
- SQLite de 73 KB que quedó de una etapa anterior; el datasource real es PostgreSQL. No cumple ninguna función hoy.
- Detalle técnico: §11 Calidad, punto 14

### 20. Cachear roles en el JWT en vez de consultar la BD en cada callback
- El callback `jwt` de NextAuth consulta la base de datos en cada llamada (§7.1). Funciona bien pero es costoso a escala. Alternativa: cachear roles en el token y refrescar solo ante cambios explícitos (ej. al cambiar el rol de un usuario).
- Detalle técnico: §11 Rendimiento, punto 17

### 21. Medir el impacto de `Mascota.tsx` (40 KB) en el bundle
- Se monta en el root layout, o sea en todas las páginas del sitio. Vale la pena medir cuánto pesa en el bundle de cliente y si conviene cargarlo de forma diferida (`next/dynamic`).
- Detalle técnico: §11 Rendimiento, punto 18

### 22. Revisar el cálculo del podio (`getTop3`)
- Hoy promedia los scores de `FINAL` y `TERCER_LUGAR` para determinar el podio, en vez de leer los `winnerId` reales de las batallas. Puede dar un podio incorrecto si el promedio no coincide con el resultado real por votos.
- Detalle técnico: §11 Rendimiento, punto 19

### 23. Barrido de indentación NBSP (U+00A0) en el repo
- Se detectaron espacios NBSP en vez de espacios normales en partes de `SugerenciasTable.tsx`, `app/api/wildcard/route.ts`, `SugerenciaDetailDrawer.tsx`, `BracketMatch.tsx` (probablemente hay más, no se hizo un barrido completo del repo). No rompe nada en ejecución, pero puede confundir a otros editores/herramientas y a diffs de git.
- Detalle técnico: `docs/trello-buenas-practicas-legibilidad.md`, Tarjeta D

---

## No incluido a propósito

- **Reactivar `ignoreBuildErrors`/`--no-lint` en el build** (§11.7, fila 🔴 de §15): no se incluyó como tarjeta suelta porque activar esa verificación en el build **hará fallar el build actual** hasta que se resuelvan los 19 errores de `tsc` que hoy son preexistentes (§11.7, §11.20, §11.21, §11.22 — varios de ellos ya están arriba como tarjetas 1, 6 y 8). Conviene resolver primero esas tarjetas y recién ahí activar la verificación en build como último paso, no al revés.
- Los ítems ya cerrados en la pasada de legibilidad (tipado, `any`, `<img>` → `next/image`, etc.) no están acá — ver `docs/trello-buenas-practicas-legibilidad.md` para el historial de lo ya hecho.
