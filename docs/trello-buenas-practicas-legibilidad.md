# Trello — Buenas prácticas y tipado (rama chore/buenas-practicas-legibilidad)

Fecha: 2026-08-24
Rama: `chore/buenas-practicas-legibilidad`
Objetivo: tickets para el tablero, uno por tarjeta. Pasada de legibilidad/tipado en TypeScript y React sobre todo el proyecto, sin cambiar funcionalidad existente.

---

## Lista: Hecho en esta rama (código)

### Tarjeta 1 — Helper `getErrorMessage` y limpieza de `catch (e: any)`
- **Etiqueta:** Buenas prácticas / TypeScript
- **Por qué:** 22 bloques `catch (e: any) { ... e.message || e ... }` repetidos en 11 archivos. Con `strict: true` la variable de un `catch` ya es `unknown` por defecto; anotarla `any` tira ese chequeo a la basura.
- **Qué se hizo:**
  - Nuevo `lib/errors.ts` con `getErrorMessage(error: unknown, fallback?: string): string`.
  - Reemplazados los 22 `catch (e: any)` por `catch (e)` + `getErrorMessage(e, "...")`.
  - Donde el catch comparaba `e.name === 'ZodError'` o `e.code === 'P2002'`, se cambió a `instanceof z.ZodError` / `instanceof Prisma.PrismaClientKnownRequestError` (más seguro, ya no depende de que `any` deje pasar cualquier propiedad).
- **Archivos:** `lib/errors.ts` (nuevo), `app/actions/admin/battles.ts`, `app/actions/admin/inscripciones.ts`, `app/admin/eventos/actions.ts`, `app/admin/usuarios/actions.ts`, `app/admin/wildcards/actions.ts`, `app/api/auth/register/route.ts`, `app/api/compra/webhook-mp/route.ts`, `app/perfil/actions.ts`, `components/admin/eventos/EventForm.tsx`, `components/admin/sugerencias/SugerenciasTable.tsx`, `components/compra/resultado/ResultadoCliente.tsx`, `components/compra-entradas/EventosDisponibles.tsx`
- **QA:**
  - [ ] Provocar un error de validación al crear/editar un evento, usuario o wildcard: el mensaje de error que se muestra en el toast/alert es el mismo de antes
  - [ ] Registrar un email ya existente: sigue mostrando "El correo electrónico ya está en uso"
  - [ ] Asignar un ticket con nombre duplicado: sigue mostrando el mensaje de "Ya existe un tipo de entrada..."

### Tarjeta 2 — Quitar `(session as any)?.user?.roles` / `.id`
- **Etiqueta:** Buenas prácticas / TypeScript
- **Por qué:** `types/next-auth.d.ts` ya declara `roles`, `id`, `isActive`, etc. en `Session["user"]` vía augmentación de módulo. El cast a `any` en ~15 archivos era puro copy-paste innecesario, no una limitación real de tipos.
- **Qué se hizo:** `(session?.user as any)?.roles` → `session?.user?.roles` (y variantes con `.id`) en todos los lugares donde aparecía.
- **Archivos:** `lib/auth.ts`, `lib/permissions.ts`, `app/actions/admin/battles.ts`, `app/actions/admin/classification.ts`, `app/actions/judge/winner.ts`, `app/admin/eventos/actions.ts`, `app/admin/eventos/[id]/page.tsx`, `app/admin/usuarios/actions.ts`, `app/admin/usuarios/page.tsx`, `app/admin/usuarios/[id]/page.tsx`, `app/admin/wildcards/actions.ts`, `app/api/compra-entradas/route.ts`
- **QA:**
  - [ ] Login normal (credentials y Google) sigue funcionando
  - [ ] Un admin sigue pudiendo generar brackets, clasificar, editar usuarios/wildcards
  - [ ] Un usuario sin rol admin sigue recibiendo "No autorizado" donde correspondía

### Tarjeta 3 — Tipar `where`/`data` de Prisma (adiós `any` en queries)
- **Etiqueta:** Buenas prácticas / TypeScript
- **Por qué:** Varias acciones armaban el filtro de una consulta con `const where: any = {}` y lo iban rellenando condicionalmente. Con los tipos generados por Prisma (`Prisma.XWhereInput`) se obtiene autocompletado y se detectan campos mal escritos, sin cambiar la lógica.
- **Qué se hizo:** `where`/`data`/`orderBy` tipados con `Prisma.CompraWhereInput`, `Prisma.CompraOrderByWithRelationInput`, `Prisma.SugerenciaWhereInput`, `Prisma.PublicacionWhereInput`. Los filtros de fecha `{...where.createdAt, gte/lte}` (que ya no tipaban bien contra el filtro real de Prisma) se reescribieron como `{ ...(from ? {gte} : {}), ...(to ? {lte} : {}) }`, mismo resultado sin el spread de un tipo unión.
- **Archivos:** `app/admin/compras/actions.ts`, `app/admin/sugerencias/actions.ts`, `app/publicaciones/route.ts`
- **QA:**
  - [ ] Filtrar compras por texto, evento, tipo de entrada y rango de fechas: misma cantidad de resultados que antes
  - [ ] Exportar CSV de compras y de sugerencias con filtros aplicados
  - [ ] `GET /publicaciones?tipo=blog` sigue devolviendo solo publicaciones publicadas de ese tipo

### Tarjeta 4 — Tipar `prevState` de `useActionState`/`useFormState`
- **Etiqueta:** Buenas prácticas / TypeScript
- **Por qué:** Varias Server Actions usadas con `useActionState` tenían `prevState: any`, y del lado cliente el `initialState` necesitaba `as any` para poder pasarse al hook. Son dos síntomas del mismo problema: faltaba un tipo compartido para el estado del formulario.
- **Qué se hizo:** Se agregó un tipo de estado (`EventoSimpleActionState`, `UserActionState`, `EditWildcardState`, `UpdateSugerenciaState`, según el módulo) usado tanto en la action como en el `initialState` del componente cliente, replicando el patrón que ya existía en `AssignJudgeState`/`JudgeAssignmentForm.tsx`. Se quitaron los `as any` de `CompetitionCategoryForm.tsx` y `WildcardRankingTable.tsx`.
- **Archivos:** `app/admin/eventos/actions.ts`, `app/admin/usuarios/actions.ts`, `app/admin/wildcards/actions.ts`, `app/admin/sugerencias/actions.ts`, `app/perfil/actions.ts`, `components/admin/eventos/CompetitionCategoryForm.tsx`, `components/admin/eventos/WildcardRankingTable.tsx`, `components/admin/usuarios/ToggleUserActiveButton.tsx`, `components/admin/usuarios/UserEditForm.tsx`, `components/admin/wildcards/WildcardEditForm.tsx`, `components/admin/sugerencias/SugerenciaDetailDrawer.tsx`, `components/admin/sugerencias/SugerenciaDetailPopup.tsx`
- **QA:**
  - [ ] Guardar cupos por categoría en un evento
  - [ ] Marcar wildcards como clasificados desde el ranking
  - [ ] Activar/desactivar un usuario
  - [ ] Editar roles y datos de un usuario
  - [ ] Editar una wildcard (nombre artístico, notas, URL de YouTube)
  - [ ] Cambiar estado/nota privada de una sugerencia (drawer y popup)

### Tarjeta 5 — `Prisma.validator()` → `Prisma.XGetPayload<{...}>` directo
- **Etiqueta:** Buenas prácticas / TypeScript
- **Por qué:** El patrón `Prisma.validator<...>()({...})` + `Prisma.XGetPayload<typeof validator>` crea una variable de runtime que solo se usa para tipar y que ESLint marca como no usada (`no-unused-vars`). Pasar el mismo objeto `include` directo como argumento de tipo da exactamente el mismo tipo sin la variable muerta.
- **Qué se hizo:** Reescrito en `EventForm.tsx` y `UserEditForm.tsx`.
- **Archivos:** `components/admin/eventos/EventForm.tsx`, `components/admin/usuarios/UserEditForm.tsx`
- **QA:**
  - [ ] Crear y editar un evento (con y sin venue) sigue funcionando igual
  - [ ] Editar un usuario (nombres, roles, imagen) sigue funcionando igual

### Tarjeta 6 — Tipos "any" puntuales en componentes (formularios, jueces, layout)
- **Etiqueta:** Buenas prácticas / TypeScript
- **Por qué:** `any` sueltos en props, estados y callbacks donde ya existía (o era fácil derivar) un tipo real: matriz de puntajes de batallas, resultado de confirmación de pago, wildcards del perfil, prop `user` del menú móvil, batalla del bracket público, fallback de `webkitAudioContext`.
- **Qué se hizo:** Tipos explícitos derivados del uso real (`Record<number, Record<string, Record<string, number | undefined>>>` para la matriz de puntajes, `ConfirmarCompraResponse` para el resultado de pago, `Prisma.WildcardGetPayload<...>` para las wildcards del perfil, `Session["user"]` para el menú móvil, `PublicBracketBattle` — nuevo tipo exportado desde `app/actions/public-data.ts` — para el bracket). De paso se corrigieron 2 errores de tipos que esto destapó en `BattleScoreForm.tsx` (reduce con acumulador ambiguo, payload con valores posiblemente `undefined`) sin cambiar el comportamiento — `isBattleComplete` ya garantizaba que esos valores estuvieran definidos antes de enviarse.
- **Archivos:** `components/judge/dashboard/BattleScoreForm.tsx`, `components/judge/dashboard/JudgePanel.tsx`, `components/compra/resultado/ResultadoCliente.tsx`, `components/perfil/PerfilForm.tsx`, `components/layout/MobileMenu.tsx`, `components/mascota/Mascota.tsx`, `components/public/BracketMatch.tsx`, `app/actions/public-data.ts`, `app/admin/compras/page.tsx`
- **QA:**
  - [ ] Evaluar una batalla completa (2 rounds, ambos participantes) y confirmar que el envío guarda los puntajes correctos
  - [ ] Confirmar un pago Webpay y ver la pantalla de resultado con monto/ID/tarjeta
  - [ ] Ver wildcards enviadas en el perfil propio
  - [ ] Abrir el menú móvil logueado y deslogueado
  - [ ] Ver el bracket público de un evento con batallas
  - [ ] Notificación sonora de la mascota en un navegador sin `AudioContext` prefijado (no debería romper nada, solo loguear)

### Tarjeta 7 — Tipos de las filas/paginación en tablas de admin (compras y sugerencias)
- **Etiqueta:** Buenas prácticas / TypeScript
- **Por qué:** `ComprasPageWrapper`/`SugerenciasPageWrapper` y sus tablas/filtros recibían `any[]`/`any` para filas, paginación y filtros por duplicado entre página, wrapper y tabla — el mismo shape escrito (o no escrito) tres veces.
- **Qué se hizo:** Se exportaron los tipos ya existentes en `ComprasTable.tsx`/`ComprasFilters.tsx`/`SugerenciasTable.tsx`/`SugerenciasFilters.tsx` (`CompraRow`, `CompraPagination`, `CompraEventOpt`, `CompraFilterDefaults`, `SugerenciaRow`, `SugerenciaPagination`, `SugerenciaFilterDefaults`) y se reusaron en los wrappers en vez de repetir `any`. Se ajustaron a `| undefined` los campos que en la práctica pueden faltar (evento eliminado, usuario sin comuna) y se agregó un fallback "—" donde antes se habría mostrado "Invalid Date".
- **Archivos:** `components/admin/compras/ComprasPageWrapper.tsx`, `components/admin/compras/ComprasTable.tsx`, `components/admin/compras/ComprasFilters.tsx`, `components/admin/sugerencias/SugerenciasPageWrapper.tsx`, `components/admin/sugerencias/SugerenciasTable.tsx`, `components/admin/sugerencias/SugerenciasFilters.tsx`, `app/admin/compras/page.tsx`
- **QA:**
  - [ ] Tabla de compras: fecha de evento se ve bien; si una compra no tiene evento asociado, muestra "—" en vez de romper
  - [ ] Copiar email de un comprador (botón de copiar) sigue funcionando
  - [ ] Tabla de sugerencias con sugerencias anónimas (sin usuario) se sigue viendo bien
  - [ ] Filtros de ambas tablas (búsqueda, evento, estado, fechas) sin cambios de comportamiento

### Tarjeta 8 — Imports, variables y parámetros sin usar
- **Etiqueta:** Buenas prácticas / limpieza
- **Por qué:** ~25 warnings de `no-unused-vars` del linter: imports de iconos/enums nunca usados, estado de React que se escribía pero nunca se leía, parámetros de `catch` sin usar.
- **Qué se hizo:** Eliminados. Incluye un estado muerto real en `EventForm.tsx` (`const [tipo, setTipo]` se seteaba pero nunca se leía en el JSX) y en `UserEditForm.tsx`/`SugerenciasTable.tsx` (`router` sin usar).
- **Archivos:** ~20, ver `git diff --stat` de la rama para el detalle completo (imports de `@heroicons`, `RoundPhase`/`ScoreStatus`/`InscripcionSource`/`Prisma`/`User` de `@prisma/client`, `useRef`/`useRouter`, parámetros `e`/`err`/`error` de `catch`)
- **QA:** No debería haber ningún cambio de comportamiento visible; es puramente eliminación de código muerto.

### Tarjeta 9 — 3 `react-hooks/exhaustive-deps` reales
- **Etiqueta:** Buenas prácticas / React
- **Por qué:** El linter marcaba dependencias faltantes de verdad (no falsos positivos): la función que carga datos en un `useEffect` no estaba en el array de dependencias.
- **Qué se hizo:** Función cargadora envuelta en `useCallback` con sus propias dependencias (`compraId`/`sugerenciaId`/`tipo`) e incluida en el array del `useEffect` — mismo comportamiento (se sigue disparando solo cuando cambia lo que antes lo disparaba), ahora explícito para el linter. En `SingleRoundForm.tsx` el warning era distinto (ref que podría cambiar entre el montaje y el cleanup del efecto): se copió `debouncedSaveRef.current` a una variable local al inicio del efecto y se usó esa variable tanto para llamar como para cancelar, tal como sugiere el propio mensaje del warning.
- **Archivos:** `components/admin/compras/CompraDetailDrawer.tsx`, `components/admin/sugerencias/SugerenciaDetailDrawer.tsx`, `components/publicaciones/PublicacionesRow.tsx`, `components/judge/dashboard/SingleRoundForm.tsx`
- **QA:**
  - [ ] Abrir el drawer de detalle de una compra y de una sugerencia varias veces seguidas (distintos IDs): carga los datos correctos cada vez, sin loops de fetch
  - [ ] Fila de publicaciones (blog/noticia): pasar de página y volver no dispara fetches de más
  - [ ] Evaluación individual por round: el autosave (debounce) sigue funcionando y se cancela bien al desmontar/reenviar

### Tarjeta 10 — Detalles menores (comillas en JSX, `@ts-ignore`)
- **Etiqueta:** Buenas prácticas / lint
- **Por qué:** `react/no-unescaped-entities` (comillas simples sueltas en texto JSX) y `@typescript-eslint/ban-ts-comment` (`@ts-ignore` no avisa si la línea deja de tener error; `@ts-expect-error` sí).
- **Qué se hizo:** `'admin'` → `&lsquo;admin&rsquo;` en el texto de ayuda de `UserEditForm.tsx`; los 3 `// @ts-ignore` de depuración del SDK de Transbank en `crear-orden/route.ts` pasaron a `// @ts-expect-error` con un comentario explicando por qué.
- **Archivos:** `components/admin/usuarios/UserEditForm.tsx`, `app/api/compra/crear-orden/route.ts`
- **QA:** Solo texto/comentarios, sin riesgo funcional.

### Tarjeta 11 — Documentación
- **Etiqueta:** Docs
- **Qué se hizo:**
  - `ARCHITECTURE.md` §10 (Convenciones): agregada la convención de `getErrorMessage`/`instanceof` para errores y la convención de tipado (`Session["user"]` ya tipado, `Prisma.XWhereInput`/`XGetPayload` en vez de `any`/`Prisma.validator`).
  - `ARCHITECTURE.md` §11 (Deuda técnica): nota fechada en el punto 7 con el antes/después de `npm run lint`; el punto 12 (componentes duplicados) ampliado con el bug de shape encontrado en `CompraDetailDrawer.tsx`; punto nuevo (20) documentando que `/api/admin/eventos`, `/api/admin/usuarios` y `/api/admin/wildcards` parecen código huérfano y desincronizado del schema.
  - `ARCHITECTURE.md` §8.2: marcadas esas tres rutas con una nota apuntando al punto 20.
  - `CONTEXT.md` §10: nota actualizada sobre el estado de lint/tsc.
  - `README.md`: agregado `lib/errors.ts` al árbol de `Estructura del proyecto`.
  - Este archivo.
- **Archivos:** `ARCHITECTURE.md`, `CONTEXT.md`, `README.md`, `docs/trello-buenas-practicas-legibilidad.md`
- **QA:** N/A (solo documentación).

---

## Lista: Pendiente (no se hizo en esta rama a propósito)

Copiar cada una como tarjeta aparte. Son decisiones de producto/arquitectura, no de legibilidad.

### Tarjeta A — Decidir el futuro de `/api/admin/eventos`, `/api/admin/usuarios`, `/api/admin/wildcards`
- Confirmar que nada externo los llama (no solo el frontend del repo)
- Si están muertos: borrarlos. Si se necesitan: migrarlos al schema actual (`lugar`/`ciudad`/`direccion` no existen en `Evento`; `nombres`/`apellidoPaterno`/`apellidoMaterno` viven en `UserProfile`, no en `User`)
- Ver `ARCHITECTURE.md` §11.20

### Tarjeta B — Arreglar `CompraDetailDrawer.tsx`
- El componente lee campos planos (`userNombre`, `tipoEntrada`, `cantidad`, `precioUnitario`) que no existen en la respuesta real de `getCompraById()` (objeto anidado de Prisma)
- Decidir: ¿el drawer debería recibir los datos ya aplanados (como hace la tabla), o debería leer la forma anidada real? Cualquiera de las dos es un cambio de comportamiento, no de tipado
- Ver `ARCHITECTURE.md` §11.12

### Tarjeta C — `<img>` → `next/image` en publicaciones y anuncios
- `components/home/Anuncios.tsx`, `components/publicaciones/PublicacionesRow.tsx`, `app/publicaciones/[id]/page.tsx` (2 casos) usan `<img>` plano
- Migrar a `next/image` mejora LCP pero exige revisar `width`/`height`/`sizes` y el dominio remoto en `next.config.ts` — es un cambio de comportamiento visual, se dejó fuera de esta pasada

### Tarjeta D — Indentación con NBSP (U+00A0) en vez de espacios
- Detectada en partes de `SugerenciasTable.tsx`, `app/api/wildcard/route.ts`, `SugerenciaDetailDrawer.tsx`, `BracketMatch.tsx` (probablemente hay más en el repo, no se hizo un barrido completo)
- No afecta la ejecución (JS no le da significado al espacio en blanco fuera de strings), pero puede confundir a otros editores/herramientas
- Se limpió solo en las líneas ya tocadas por otro motivo en esta rama; falta un barrido dedicado si se quiere limpiar el resto

---

## Lista: Fuera de alcance a propósito
- No se tocó ninguna funcionalidad existente: mismo comportamiento antes y después (verificado con `npx tsc --noEmit` sin diferencias de errores nuevos y `npm run lint` con conteo documentado)
- No se "arreglaron" los 13 errores preexistentes de `npx tsc --noEmit` que no tienen que ver con `any` (columnas de schema, `Headers` mockeado, tipos de `framer-motion`) — son bugs o decisiones de diseño, no legibilidad
- No se tocaron los 4 warnings de `<img>` (cambio de comportamiento de carga/layout)
- No se migró `Prisma.validator()` en archivos que no estaban ya en la lista de cambios por otro motivo
- No se hizo un barrido completo de indentación NBSP en todo el repo

---

DISCLAIMER: Generado automáticamente a partir del commit `chore: pasada de legibilidad y tipado en TypeScript/React` de la rama `chore/buenas-practicas-legibilidad`. Revisar antes de mover las tarjetas a "Hecho" en el tablero real.
