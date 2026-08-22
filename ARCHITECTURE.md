# Beatbox Chile — Documentación de Arquitectura y Handoff

> **Propósito de este documento:** entregar, en un solo archivo, todo el contexto necesario para que un desarrollador nuevo (o un agente de IA) entienda el proyecto y pueda hacer cambios con seguridad sin tener que leer todo el código primero.
>
> **Alcance:** revisión de arquitectura realizada sobre el estado actual del repositorio (rama `home/actualizacion-secciones`, último commit `440df54`). Todo lo afirmado aquí está verificado contra el código fuente; cuando algo es una inferencia o una advertencia, está marcado explícitamente.
>
> **Documento relacionado:** `CONTEXT.md` (visión general previa) y `README.md` (guía de instalación). Este archivo los complementa: profundiza en decisiones de diseño, invariantes del dominio, deuda técnica y recetas de cambio.

---

## 1. Resumen ejecutivo

**Beatbox Chile** es una plataforma web full-stack que digitaliza la operación de la comunidad chilena de beatbox. No es un sitio informativo: es un **sistema de gestión de competencias** con un sitio público encima.

El sistema resuelve cuatro problemas de negocio:

1. **Convocatoria y filtro de participantes** — los beatboxers postulan a un evento subiendo un video de YouTube (*wildcard*); un jurado los evalúa y un administrador define quiénes clasifican.
2. **Operación de la competencia** — generación de llaves (brackets) con *seeding* por puntaje, evaluación en vivo por jueces con rúbricas por criterio, y avance automático de ganadores por el árbol del torneo.
3. **Venta de entradas** — pasarelas de pago chilenas reales (Webpay Plus de Transbank y Mercado Pago) con confirmación idempotente.
4. **Comunidad y contenido** — blog/noticias, historial competitivo público, estadísticas, buzón de ideas y páginas institucionales.

**Perfiles de usuario:** visitante anónimo, usuario registrado (`user`), competidor (`participant`), juez (`judge`) y administrador (`admin`).

**Estado de madurez:** producto funcional y desplegable, con los flujos principales completos. Existe deuda técnica relevante y no hay suite de pruebas automatizadas ni CI (ver §11).

**Origen:** proyecto académico–profesional (las carpetas `Fase 1/`, `Fase 2/` y `Fase 3/` contienen evidencias de la asignatura APT122 y **no son parte del código de la aplicación**; pueden ignorarse por completo en cualquier tarea de desarrollo).

---

## 2. Stack tecnológico (versiones reales de `package.json`)

| Capa | Tecnología | Versión | Notas de uso |
|---|---|---|---|
| Framework | Next.js (App Router) | `15.4.10` | Dev con `--turbopack`. Server Components por defecto. |
| Runtime UI | React | `19.1.2` | Usa `useActionState` / Server Actions de React 19. |
| Lenguaje | TypeScript | `5.9.3` | `strict: true`… pero los errores de build están silenciados (§11). |
| Estilos | Tailwind CSS | `v4` | Vía `@tailwindcss/postcss`. Configuración *CSS-first* en `app/globals.css` (`@theme inline`), **no hay `tailwind.config.js`**. |
| ORM | Prisma | `7.5.0` | Con **driver adapter** `@prisma/adapter-pg` sobre `pg` `8.20.0`. |
| Base de datos | PostgreSQL | 16 (Docker en dev) | Producción: Postgres serverless (Neon/Vercel). |
| Autenticación | NextAuth.js (Auth.js v4) | `4.24.11` | Estrategia JWT. Providers: Credentials + Google. |
| Hash de claves | bcrypt | `6.0.0` | |
| Validación | Zod | `4.1.11` | Usado en Server Actions y schemas de dominio. |
| Formularios | React Hook Form | `7.62.0` | Con `@hookform/resolvers`. |
| Pagos | `transbank-sdk` `6.1.0` / `mercadopago` `2.9.0` | | Webpay Plus y Checkout Pro. |
| Email | Resend | `6.5.2` | Solo recuperación de contraseña, por ahora. |
| Gráficos | Chart.js + react-chartjs-2 | `4.5.0` / `5.3.0` | Estadísticas e historial. |
| Diagramas | `reactflow` | `11.11.4` | Visualización de brackets. |
| Animación | Framer Motion | `12.23.12` | |
| UI / iconos | Heroicons, Lucide, React Icons, `react-hot-toast`, `canvas-confetti`, `react-lite-youtube-embed` | | |
| Utilidades | lodash, `csv-stringify`, `tailwind-merge` | | `csv-stringify` para exportaciones admin. |
| Deploy | Vercel | | `build` corre `prisma generate && next build --no-lint`. |

**Nota importante sobre el adaptador de Prisma:** `lib/prisma.ts` instancia un `Pool` de `pg` y lo envuelve en `PrismaPg`. Esto es deliberado para entornos serverless con *connection pooling*. Cualquier cambio ahí impacta directamente en producción.

---

## 3. Puesta en marcha (local)

**Requisitos:** Node.js ≥ 18.18 (recomendado LTS 20+), Docker Desktop, npm.

```bash
# 1. Dependencias (postinstall ejecuta `prisma generate` automáticamente)
npm ci

# 2. Base de datos local
docker compose up -d          # Postgres 16 en localhost:5432 (beatbox/beatbox/beatbox)
docker compose ps             # debe verse "healthy"

# 3. Prisma
npx prisma generate
npx prisma migrate dev        # aplica prisma/migrations
npx prisma db seed            # roles, tipos de evento, categorías y criterios

# 4. Servidor
npm run dev                   # http://localhost:3000

# Opcional
npx prisma studio
```

> ⚠️ **El seed no es opcional.** Sin él la aplicación queda en un estado inconsistente: el login con Google falla (`lib/auth.ts` aborta si no existe el rol `user`), el envío de wildcards falla (busca `Categoria` por nombre) y el módulo de jueces no tiene criterios para puntuar.

### Variables de entorno

Todas se leen desde `.env` en la raíz (ignorado por Git).

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Cadena de conexión PostgreSQL. |
| `NEXTAUTH_URL` | Sí | URL base de la app. **También se usa para construir el link del email de reseteo** (`lib/email.ts`). |
| `NEXTAUTH_SECRET` | Sí | Firma de JWT. Lo usa `lib/auth.ts` y `middleware.ts`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Sí (si se usa Google) | OAuth. |
| `WEBPAY_PLUS_COMMERCE_CODE` / `WEBPAY_PLUS_API_KEY` | Sí | **`lib/transbank.ts` lanza excepción en tiempo de import si faltan** — la app no arranca. |
| `WEBPAY_RETURN_URL` | No | Default: `http://localhost:3000/compra/resultado`. |
| `FORCE_WEBPAY_INTEGRATION` | No | `"true"` fuerza el ambiente de Integración de Transbank aunque `NODE_ENV=production`. |
| `MERCADOPAGO_ACCESS_TOKEN` | Sí | **`lib/mercadopago.ts` también lanza excepción en import si falta.** |
| `APP_URL` | Sí (para MP) | Base para `back_urls` y `notification_url` de Mercado Pago. |
| `NEXT_PUBLIC_APP_URL` | — | Expuesta al cliente. |
| `RESEND_API_KEY` | Sí (para recuperar clave) | |

> Consecuencia de diseño: `lib/transbank.ts` y `lib/mercadopago.ts` validan credenciales **a nivel de módulo**, no dentro de las funciones. Un `.env` incompleto tumba el arranque completo, no solo el flujo de pago.

---

## 4. Arquitectura

### 4.1 Patrón general

Monolito full-stack sobre el App Router de Next.js. No hay backend separado: el mismo despliegue sirve HTML, ejecuta la lógica de negocio y habla con la base de datos.

```
                          Navegador
                              │
                    ┌─────────┴──────────┐
                    │  Next.js App Router │
                    └─────────┬──────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
   Server Component     Server Action          Route Handler
   (lectura, RSC)       ('use server')         (app/api/**/route.ts)
   getX() directo       mutaciones desde       APIs REST, webhooks
   a Prisma             formularios            y llamadas fetch
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                       lib/prisma.ts  (singleton + adapter pg)
                              │
                        PostgreSQL
```

### 4.2 Las tres formas de mutar datos (y cuándo se usa cada una)

Este es el punto de confusión más frecuente del repositorio. Conviven **tres mecanismos** para escribir en la base de datos:

| Mecanismo | Dónde vive | Se usa para | Ejemplo |
|---|---|---|---|
| **Server Actions** | `app/actions/**`, `app/*/actions.ts` | Formularios del panel admin, juez y perfil. Firma `(prevState, formData) => State`, consumida con `useActionState`. Revalidan con `revalidatePath`. | `app/admin/eventos/actions.ts` |
| **Route Handlers REST** | `app/api/**/route.ts` | Consumo vía `fetch` desde componentes cliente, exportaciones CSV, y **endpoints externos (webhooks de pago, NextAuth)**. | `app/api/wildcard/route.ts` |
| **Lectura directa en RSC** | Páginas `page.tsx` y `app/actions/public-data.ts` | Todo el *data fetching* de solo lectura. | `app/page.tsx`, `app/judge/dashboard/page.tsx` |

**Regla práctica para cambios nuevos:** si la mutación nace de un formulario dentro de la app, usa Server Action. Si la llama un tercero (pasarela de pago) o necesita ser una API pública, usa Route Handler. Para leer, hazlo directo en el Server Component.

### 4.3 Convención de estado de Server Actions

Casi todas las actions comparten esta forma (útil replicarla al agregar nuevas):

```ts
'use server';
interface ActionState { error?: string; success?: string; log?: string[] }

export async function miAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  // 1. Seguridad: getServerSession → verificar roles
  // 2. Validación: zod .safeParse sobre formData
  // 3. Reglas de negocio (deadlines, cupos, estados previos)
  // 4. Escritura (prisma.$transaction si toca varias tablas)
  // 5. revalidatePath(...) de todas las vistas afectadas
  // 6. return { success } | { error }
}
```

Las actions de procesos largos (`generateBrackets`, `runCnClassification`) además devuelven `log: string[]`, que la UI muestra como consola de auditoría del proceso. Es un patrón deliberado y vale la pena mantenerlo en operaciones masivas.

---

## 5. Estructura de directorios

```
beatbox-chile-web/
├── app/
│   ├── layout.tsx                 # Root layout: AuthProvider + ToastProvider + Header/Footer + Mascota
│   ├── page.tsx                   # Home (RSC, lee publicaciones directo con Prisma)
│   ├── globals.css                # Tailwind v4 CSS-first: @theme inline, fuentes Teko/Manrope, utilidades "glow"
│   │
│   ├── actions/                   # Server Actions transversales
│   │   ├── public-data.ts         # ⭐ Capa de lectura pública (ver §5.1)
│   │   ├── admin/battles.ts       # generateBrackets — árbol del torneo
│   │   ├── admin/classification.ts# runCnClassification — clasificación al Campeonato Nacional
│   │   ├── admin/inscripciones.ts # registerParticipantForLeague, getRegistrationFormData
│   │   └── judge/winner.ts        # declareBattleWinner — cierre de batalla y avance
│   │
│   ├── admin/                     # Panel admin (protegido por layout + middleware)
│   │   ├── layout.tsx             # await ensureAdminPage()  ← guarda de servidor
│   │   ├── page.tsx               # Dashboard con gráficos
│   │   ├── eventos/actions.ts     # ⭐ 713 líneas: el archivo más denso del proyecto
│   │   ├── usuarios/ wildcards/ publicaciones/ sugerencias/ compras/
│   │   ├── inscripciones/         # Inscripción manual de competidores
│   │   └── clasificacion/         # Ejecución del proceso de clasificación al CN
│   │
│   ├── judge/                     # Panel de jueces
│   │   ├── layout.tsx             # ⚠️ solo UI, NO valida rol
│   │   ├── dashboard/page.tsx     # Valida rol 'judge' consultando UserRole
│   │   └── actions.ts             # submitScore, submitBulkScores
│   │
│   ├── api/                       # Route Handlers (ver §8.2)
│   ├── auth/                      # login, register, forgot-password, reset-password
│   ├── eventos/[id]/{bracket,wildcards}/
│   ├── historial-competitivo/{eventos,competidores}/[id]/
│   ├── compra-entradas/, compra/resultado/, compra/resultado-mp/
│   ├── estadisticas/, liga-competitiva/, liga-terapeutica/, quienes-somos/, publicaciones/, perfil/, tienda/, wildcard/
│
├── components/                    # Espejo de la estructura de app/ (~90 componentes)
│   ├── Header.tsx, Footer.tsx, AuthProvider.tsx, ToastProvider.tsx
│   ├── mascota/Mascota.tsx        # 40 KB — componente decorativo global, el más pesado del repo
│   ├── admin/, judge/, public/, home/, compra-entradas/, estadisticas/, historial-competitivo/, ...
│
├── lib/
│   ├── prisma.ts                  # Singleton PrismaClient + PrismaPg(Pool)
│   ├── auth.ts                    # authOptions de NextAuth (callbacks jwt/session/signIn)
│   ├── permissions.ts             # ensureAdminPage / ensureAdminApi / checkAdmin
│   ├── transbank.ts, mercadopago.ts, email.ts, tokens.ts
│   ├── cl-geo.ts, cl-geo-static.ts# Regiones y comunas de Chile (18 KB de datos estáticos)
│   └── schemas/judging.ts         # Zod: submitScoreSchema
│
├── prisma/
│   ├── schema.prisma              # ⭐ Fuente de verdad del dominio
│   ├── migrations/20260329225123_init/
│   ├── seed.cts                   # Roles, tipos de evento, categorías y rúbricas
│   └── scripts/backfill-battle-votes.cts
│
├── types/next-auth.d.ts           # Augmentación de Session/User/JWT
├── middleware.ts                  # Guarda de borde para /admin y /api/admin
├── next.config.ts, tsconfig.json, eslint.config.mjs, postcss.config.mjs
├── docker-compose.yml             # Postgres 16 local (ignorado por Git)
└── Fase 1/  Fase 2/  Fase 3/      # ❌ Evidencias académicas — NO es código
```

### 5.1 `app/actions/public-data.ts` — la capa de lectura pública

Archivo clave (565 líneas). Centraliza **todas** las consultas de las vistas públicas de competencia y expone tipos derivados (`Awaited<ReturnType<typeof ...>>`) que los componentes consumen. Funciones principales:

`getPublicEventsList`, `getPublicCompetitorsList`, `getEventStats`, `getCompetitorStats`, `getJudgeStats`, `getEventDetails`, `getPublicWildcardsForEvent`, `getCompetitorHistory`, `aggregateHistoryForTable`, `getPublicEventBracket`, `checkEventHasBattles`.

> **Convención a respetar:** cualquier lectura pública nueva relacionada con eventos, competidores o brackets debe agregarse aquí, no dispersarse en las páginas. Los tipos se exportan desde este mismo archivo para que los componentes no redefinan formas de datos.

---

## 6. Modelo de datos

Fuente de verdad: `prisma/schema.prisma`. Provider: `postgresql`. IDs: `cuid()` en casi todo, salvo `Region`/`Comuna` que usan `Int` (códigos oficiales) y `UserProfile`/`UserRole` que usan claves compuestas o del propio usuario.

### 6.1 Mapa de dominios

```
CATÁLOGOS         UBICACIÓN            IDENTIDAD
Role              Region               User ──1:1── UserProfile
EventType         └─ Comuna            └──N:M── Role (vía UserRole)
Categoria            └─ Address        └─── PasswordResetToken
└─ Criterio             └─ Venue

                        EVENTOS
                        Evento ── EventType, Venue
                        ├── CompetitionCategory (cupos de wildcard por categoría)
                        ├── TicketType ── CompraItem ── Compra
                        ├── Wildcard ──(1:0..1)── Inscripcion
                        ├── Inscripcion   ⭐ fuente de verdad de "quién compite"
                        ├── JudgeAssignment (juez × evento × categoría × fase)
                        ├── Battle (árbol: nextBattle / prevBattles)
                        ├── Score ── ScoreDetail (uno por Criterio)
                        └── Puntaje (ranking legado por evento)

CONTENIDO
Publicacion (blog | noticia)     Sugerencia     Mensaje
```

### 6.2 Entidades y su razón de ser

**Identidad y acceso**

- `User` — cuenta base. `password` es opcional (los usuarios de Google no tienen). `isActive` es un *soft-ban*: bloquea el login en ambos providers.
- `UserProfile` — datos personales separados de la cuenta (nombres, apellidos, fecha de nacimiento, comuna). PK = `userId`.
- `Role` / `UserRole` — roles como filas, no como enum. Valores del seed: `admin`, `judge`, `user`, `participant`.
- `PasswordResetToken` — guarda **solo el hash SHA-256** del token; el token en claro viaja únicamente en el email.

**Competencia**

- `Evento` — `isPublished` controla visibilidad pública; `isTicketed` habilita venta; `wildcardDeadline` es la fecha de cierre de postulaciones (si es `null`, el evento **no acepta wildcards**).
- `Categoria` — `SOLO`, `LOOPSTATION`, `TAG_TEAM` (creadas en el seed). **Varias partes del código las buscan por `name`, no por id** — renombrarlas rompe funcionalidad.
- `Criterio` — rúbrica por categoría, con `maxScore` propio. Ej. SOLO: Originalidad 40, Musicalidad 20, Técnica 20, Performance 20, Bonus 5 (total 105).
- `CompetitionCategory` — tabla puente evento↔categoría que además define `wildcardSlots` (cupos disponibles).
- `Wildcard` — postulación con video de YouTube. Único por `(userId, eventoId, categoriaId)`. Estados `PENDING` → `APPROVED`/`REJECTED`, más el flag independiente `isClassified`.
- `Inscripcion` — **fuente de verdad de quién compite**. Única por `(userId, eventoId, categoriaId)`. Guarda `source` (de dónde vino el cupo) y `nombreArtistico` como *snapshot* histórico. `wildcardId` es `@unique`: un wildcard genera como máximo una inscripción.
- `JudgeAssignment` — habilita a un juez a puntuar una `(evento, categoría, fase)` concreta. Sin esta fila, `submitScore` rechaza el envío.
- `Score` / `ScoreDetail` — un `Score` es la evaluación de **un juez a un participante en una fase y round**; sus `ScoreDetail` son los puntos por criterio. `totalScore` se calcula en el servidor sumando los detalles (nunca se confía en el cliente). `status`: `DRAFT` (autoguardado) o `SUBMITTED` (cuenta para rankings).
- `Battle` — enfrentamiento en fase eliminatoria. Participantes **opcionales** (una batalla de cuartos existe vacía hasta que se resuelvan los octavos). `nextBattleId` encadena el árbol; `winnerVotes`/`loserVotes` son votos de jueces, no puntos.
- `Puntaje` — tabla legada de puntos por usuario/evento. Coexiste con `Score` y prácticamente no se usa en los flujos nuevos.

**Ventas**

- `TicketType` — tipo de entrada por evento (`@@unique([eventId, name])`), precio entero en CLP.
- `Compra` / `CompraItem` — orden y sus líneas. `unitPrice` y `subtotal` se congelan al momento de la compra (correcto: sobreviven a cambios de precio).

**Contenido**

- `Publicacion` — blog y noticias con `imagenes String[]` (array nativo de Postgres, no tabla aparte).
- `Sugerencia` — buzón de ideas con flujo de gestión (`estado`, `notaPrivada`).
- `Mensaje` — contacto simple, sin flujo de gestión.

### 6.3 Enums

| Enum | Valores |
|---|---|
| `WildcardStatus` | `PENDING`, `APPROVED`, `REJECTED` |
| `RoundPhase` | `WILDCARD`, `PRELIMINAR`, `OCTAVOS`, `CUARTOS`, `SEMIFINAL`, `TERCER_LUGAR`, `FINAL` |
| `ScoreStatus` | `DRAFT`, `SUBMITTED` |
| `InscripcionSource` | `WILDCARD`, `LIGA_ADMIN`, `CN_ADMIN`, `CN_HISTORICO_TOP3`, `LIGA_PRESENCIAL_TOP3`, `LIGA_ONLINE_TOP3` |
| `PaymentStatus` | `pendiente`, `pagada`, `fallida`, `reembolsada` |
| `PublicationType` | `blog`, `noticia` |
| `PublicationStatus` | `borrador`, `publicado`, `archivado` |
| `SuggestionStatus` | `nuevo`, `en_progreso`, `resuelta`, `descartada` |

> Nota de estilo: los enums de negocio "nuevo" están en MAYÚSCULAS y en inglés; los antiguos en minúsculas y español. Es inconsistente pero **cambiarlo requiere migración de datos** — no lo toques sin plan.

### 6.4 Invariantes del dominio (respetar al programar)

1. Un usuario no puede tener dos wildcards para la misma `(evento, categoría)`.
2. Un usuario no puede tener dos inscripciones para la misma `(evento, categoría)`.
3. Un wildcard genera como máximo una inscripción (`wildcardId @unique`).
4. Un juez emite un único `Score` por `(evento, categoría, fase, participante, roundNumber)` — por eso `submitScore` usa `upsert`, no `create`.
5. Solo los `Score` con `status = SUBMITTED` cuentan para rankings, seeding y declaración de ganadores.
6. `Categoria` y `EventType` se referencian por nombre en varios puntos críticos (`classification.ts`, `api/wildcard`, `getWildcardRanking`). Los nombres del seed son parte del contrato.

---

## 7. Autenticación y autorización

### 7.1 Sesión

Configurada en `lib/auth.ts`:

- Estrategia **JWT** (sin tabla de sesiones), `maxAge = 8h` y `updateAge = 8h` — expiración fija deliberada, **sin renovación deslizante**. A las 8 horas el usuario vuelve a autenticarse, siempre.
- Página de login personalizada: `/auth/login`.

**Providers**

- *Credentials*: busca el usuario con `profile` y `roles`, rechaza si no existe, si no tiene password (cuenta de Google) o si `isActive === false`, y compara con `bcrypt.compare`.
- *Google*: en el callback `signIn`, si el email no existe crea `User` + `UserProfile` + rol `user`. Incluye heurística para partir `user.name` en nombres/apellido paterno/materno según cantidad de palabras. **Si el rol `user` no existe en la BD, el login falla** (retorna `false`).

**Callback `jwt` — comportamiento crítico:** consulta la base de datos **en cada invocación**, no solo en el login. Ventaja: los cambios de rol y el `isActive` se reflejan de inmediato. Costo: una consulta a Postgres por request autenticado. Si aparecen problemas de latencia o de límite de conexiones, este es el primer lugar donde mirar.

El token se hidrata con `sub`, `isActive`, `image`, `nombres`, `apellidoPaterno`, `apellidoMaterno` y `roles: string[]`. El callback `session` los copia a `session.user`. Los tipos están declarados en `types/next-auth.d.ts`.

### 7.2 Autorización — tres capas

| Capa | Archivo | Cubre | Comportamiento |
|---|---|---|---|
| **Borde** | `middleware.ts` | `matcher: ["/admin/:path*", "/api/admin/:path*"]` | Lee el JWT con `getToken`. Sin token → redirect a login (o 401 en API). Sin rol `admin` → redirect a `/` (o 403). |
| **Servidor (páginas)** | `lib/permissions.ts` → `ensureAdminPage()` | `app/admin/layout.tsx` y actions de compras/sugerencias | `redirect()` si no cumple. |
| **Servidor (API/actions)** | `ensureAdminApi()` / `checkAdmin()` | Route handlers de `/api/admin/*` y actions de usuarios | `ensureAdminApi` **devuelve** un `NextResponse` de error o `null`; `checkAdmin` **lanza** excepción. |

Muchas Server Actions (`battles.ts`, `classification.ts`, `wildcards/actions.ts`) hacen la verificación inline: `getServerSession` + `roles.includes('admin')`. Funciona, pero duplica lógica.

**Panel de jueces:** no está cubierto por el middleware. `app/judge/layout.tsx` solo aporta estilos; la validación de rol ocurre en `app/judge/dashboard/page.tsx` (consulta `UserRole` con `name: 'judge'` y renderiza "Acceso Denegado"). La autorización real y no evitable está en las actions: `submitScore` exige un `JudgeAssignment` para esa `(evento, categoría, fase)`, y `declareBattleWinner` exige el rol `judge`.

> ⚠️ Consecuencia práctica: **un `admin` que no tenga además el rol `judge` no puede declarar ganadores.** Es una decisión de diseño no documentada en el código; considérala al asignar roles en producción.

### 7.3 Recuperación de contraseña

`lib/tokens.ts` genera 32 bytes aleatorios en hex; se guarda el **SHA-256** en `PasswordResetToken` y se envía el token en claro por Resend (`lib/email.ts`), con expiración de 1 hora. `POST /api/password/forgot` y `POST /api/password/reset` implementan el ciclo.

---

## 8. Mapa de rutas

### 8.1 Páginas

**Públicas**

| Ruta | Contenido |
|---|---|
| `/` | Home: banner/carrusel, anuncios, blog, noticias, misión-visión-valores, historia |
| `/eventos`, `/eventos/[id]` | Listado y detalle de eventos |
| `/eventos/[id]/bracket` | Llave del torneo en vivo (público) |
| `/eventos/[id]/wildcards` | Videos de wildcards del evento |
| `/wildcard` | Envío de audición (requiere sesión) |
| `/compra-entradas` | Selección de evento y compra |
| `/compra/resultado`, `/compra/resultado-mp` | Retorno de Webpay / Mercado Pago |
| `/estadisticas` | Estadísticas de competidores, eventos y jueces |
| `/historial-competitivo` (+ `/eventos/[id]`, `/competidores/[userId]`) | Historial competitivo con gráficos de evolución |
| `/liga-competitiva`, `/liga-terapeutica` | Información de ligas |
| `/quienes-somos` | Directiva, equipo, contacto, buzón de ideas |
| `/publicaciones/[id]` | Detalle de blog/noticia |
| `/perfil` | Perfil del usuario autenticado |
| `/tienda` | Placeholder |
| `/auth/{login,register,forgot-password,reset-password}` | Autenticación |

**Admin** (`/admin/*`, rol `admin`): dashboard, `eventos` (+ `nuevo`, `[id]`), `usuarios`, `wildcards`, `publicaciones`, `sugerencias`, `compras`, `inscripciones`, `clasificacion`.

**Juez**: `/judge/dashboard`.

### 8.2 API (Route Handlers)

| Endpoint | Métodos | Protección | Nota |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | — | `runtime = "nodejs"` |
| `/api/auth/register` | POST | Pública | Registro con bcrypt |
| `/api/password/forgot`, `/api/password/reset` | POST | Pública | |
| `/api/wildcard` | GET, POST, PUT | Sesión | Valida regex de YouTube, deadline y duplicados |
| `/api/eventos`, `/api/eventos/[id]` | GET | Pública | Solo eventos publicados |
| `/api/publicaciones` | GET | Pública | |
| `/api/Sugerencias` | POST, GET | Mixta | ⚠️ Ruta con **S mayúscula** — inconsistente |
| `/api/cl/regiones`, `/api/cl/comunas/[codigo]` | GET | Pública | Datos geográficos |
| `/api/user/update` | POST | Sesión | |
| `/api/compra-entradas` | POST | Sesión | ⚠️ Flujo **legado** (§9.4) |
| `/api/compra/crear-orden` | POST | Sesión | Crea `Compra` y devuelve URL de la pasarela |
| `/api/compra/confirmar` | POST | Sesión | Commit de Webpay |
| `/api/compra/webhook-mp` | POST | **Pública** | Webhook de Mercado Pago |
| `/api/admin/eventos[/id]` | GET, POST, PATCH, DELETE | `guard` correcto | |
| `/api/admin/usuarios[/id]` | GET, PATCH | `guard` correcto | |
| `/api/admin/publicaciones[/id]` | GET, POST, PATCH, DELETE | `guard` correcto | |
| `/api/admin/wildcards[/id]` | GET, PATCH | `guard` correcto | |
| `/api/admin/compras[/id]`, `/export` | GET, DELETE | ⚠️ guard ignorado (§11) | Export CSV |
| `/api/admin/sugerencias[/id]`, `/export` | GET, PATCH, DELETE | ⚠️ guard ignorado (§11) | Export CSV |

### 8.3 Server Actions

| Archivo | Funciones exportadas |
|---|---|
| `app/admin/eventos/actions.ts` | `createEvent`, `editEvent`, `toggleEventStatus`, `deleteEvent`, `createTicketType`, `deleteTicketType`, `assignJudgeAction`, `getWildcardRanking`, `classifyWildcardsAction`, `upsertCompetitionCategoryAction`, `getInscritosForEvent` |
| `app/admin/usuarios/actions.ts` | `editUser`, `toggleUserActive` |
| `app/admin/wildcards/actions.ts` | `editWildcard`, `approveWildcard`, `rejectWildcard` |
| `app/admin/publicaciones/actions.ts` | `createPublicacion`, `editPublicacion`, `deletePublicacion` |
| `app/admin/sugerencias/actions.ts` | `getSugerenciaById`, `updateSugerencia`, `deleteSugerencia`, `exportSugerenciasToCSV` |
| `app/admin/compras/actions.ts` | `getCompras`, `getCompraById`, `deleteCompra`, `exportComprasToCSV` |
| `app/actions/admin/battles.ts` | `generateBrackets` |
| `app/actions/admin/classification.ts` | `runCnClassification` |
| `app/actions/admin/inscripciones.ts` | `registerParticipantForLeague`, `getRegistrationFormData` |
| `app/actions/judge/winner.ts` | `declareBattleWinner` |
| `app/judge/actions.ts` | `submitScore`, `submitBulkScores` |
| `app/perfil/actions.ts` | `updatePerfil` |

---

## 9. Flujos de negocio críticos

### 9.1 Wildcard: postulación → clasificación

```
Usuario                     Admin                        Sistema
  │                           │                             │
  ├─ POST /api/wildcard ──────┼──> valida: regex YouTube, evento existe,
  │                           │    wildcardDeadline no vencida, categoría válida,
  │                           │    no duplicado (userId+eventoId+categoriaId)
  │                           │    → Wildcard { status: PENDING }
  │                           │
  ├─ PUT /api/wildcard  ──────┼──> editable solo si status=PENDING y deadline vigente
  │                           │
  │                     approveWildcard ──> status=APPROVED, reviewedAt, reviewedById
  │                     rejectWildcard  ──> status=REJECTED
  │                           │
  │                     [jueces evalúan fase WILDCARD → Score]
  │                           │
  │                     getWildcardRanking ──> promedio de totalScore por participante,
  │                           │                orden descendente, rank 1..n
  │                           │
  │                     classifyWildcardsAction ──> marca isClassified = true
```

> ⚠️ **Discrepancia real detectada:** `approveWildcard` retorna el mensaje *"Wildcard aprobado. El participante ha sido inscrito"*, pero el código **solo actualiza el `Wildcard`; no crea la `Inscripcion`**. El comentario `// 2. Iniciar la transacción de Prisma (CRUCIAL)` quedó huérfano. Hoy las inscripciones se crean manualmente vía `registerParticipantForLeague`. Si tu tarea es "arreglar que aprobar un wildcard inscriba al participante", el punto exacto es el `prisma.wildcard.update` de `app/admin/wildcards/actions.ts:95`, envolviendo ese `update` y un `inscripcion.create({ source: WILDCARD, wildcardId })` en un `prisma.$transaction`.

### 9.2 Generación de brackets (`generateBrackets`)

1. Verifica rol `admin` y valida con Zod `{ eventoId, categoriaId, phase, participantCount }`.
2. Obtiene el ranking con `score.groupBy` sobre la fase **`PRELIMINAR`** con `status = SUBMITTED`, sumando `totalScore` (`_sum`) en orden descendente. Falla si hay menos clasificados que `participantCount`.
3. Calcula el emparejamiento con `getSeedingOrder(size)`, un algoritmo recursivo estándar de *seeding* (1 vs 16, 8 vs 9, …) que garantiza que los mejores no se crucen antes de tiempo.
4. En una **transacción**: borra los brackets existentes de esas fases, crea las rondas desde la fase inicial hasta la `FINAL` encadenadas por `nextBattleId`, asigna participantes **solo en la fase inicial** (las siguientes quedan con participantes `null`) y crea la batalla de `TERCER_LUGAR` vacía.

**Límite conocido:** `PHASE_SIZE_MAP` cubre hasta `OCTAVOS` (16 participantes). Para 32 hay que agregar un valor `DIECISEISAVOS` al enum `RoundPhase` (migración) y al mapa.

### 9.3 Evaluación y cierre de batalla

**`submitScore`** (`app/judge/actions.ts`):

1. Valida el payload con `submitScoreSchema` (Zod).
2. Autentica y exige un `JudgeAssignment` para `(judgeId, eventoId, categoriaId, phase)`.
3. Si la fase no es `WILDCARD` ni `PRELIMINAR`, exige `battleId`.
4. Valida cada criterio contra `maxScore` de la BD y **calcula `totalScore` en el servidor**.
5. `upsert` sobre la clave única, reemplazando los `ScoreDetail` (`deleteMany` + `create`).
6. `revalidatePath('/judge/dashboard')`.

`submitBulkScores` hace lo mismo para un arreglo (envío masivo desde el panel).

**`declareBattleWinner`** (`app/actions/judge/winner.ts`):

1. Exige rol `judge`.
2. Exige que la batalla tenga **ambos** participantes.
3. **Quórum:** cuenta jueces distintos con `Score` `SUBMITTED` en esa batalla; falla si `votantes < asignados` **y** `votantes < 3`.
4. **Conteo por voto, no por puntos:** para cada juez suma el `totalScore` de A y de B (a través de todos los rounds) y otorga un voto al mayor. Gana quien tenga más votos. Empate → error pidiendo réplica (desempate manual).
5. En transacción: guarda `winnerId`, `winnerVotes`, `loserVotes`; mueve al ganador a `nextBattle` (posición A si `orderInRound` es impar, B si es par); y si la fase era `SEMIFINAL`, mueve al perdedor a la batalla de `TERCER_LUGAR`.

> El nombre mostrado del ganador sale de `Inscripcion.nombreArtistico`, con *fallback* al nombre real del `UserProfile`.

### 9.4 Compra de entradas

Existen **dos flujos paralelos**; conocer la diferencia evita tocar el equivocado:

**A) Flujo vigente — con pasarela**

```
Cliente → POST /api/compra/crear-orden { eventoId, items[], paymentMethod }
          ├─ valida sesión
          ├─ ⭐ relee los precios desde TicketType en BD (nunca confía en el cliente)
          ├─ crea Compra{status: pendiente} + CompraItem[]
          ├─ WEBPAY:      tx.create(compraId, userId, total, returnUrl) → url + token_ws
          └─ MERCADOPAGO: mpPreference.create({ external_reference: compraId, back_urls,
                          notification_url }) → init_point
                     ↓
          Usuario paga en la pasarela
                     ↓
  WEBPAY: /compra/resultado → POST /api/compra/confirmar { token_ws }
          ├─ tx.commit(token_ws)
          ├─ idempotencia: si ya está 'pagada', responde OK sin reprocesar
          ├─ ⭐ compara compra.total contra el monto de Webpay; si no coincide → tx.refund + 'fallida'
          └─ AUTHORIZED && response_code===0 → 'pagada'; si no → 'fallida'

  MERCADO PAGO: POST /api/compra/webhook-mp (llamado por MP)
          ├─ payment.get(paymentId) → external_reference = compraId
          ├─ idempotencia: ignora si ya está 'pagada' o 'fallida'
          └─ approved → 'pagada' | rejected/cancelled/refunded → 'fallida' | pending → sin cambio
```

**B) Flujo legado — `POST /api/compra-entradas`**

Crea una `Compra` **sin pasar por ninguna pasarela**, con tipos de entrada limitados a `"General"` y `"VIP"` y un mapa de precios hardcodeado (`{ General: 8000, VIP: 15000 }`) que ni siquiera se usa (toma el precio real del `TicketType`). Es un remanente de la versión "compra simulada". **Al trabajar en pagos, usa el flujo A.**

**Puntos ciegos de seguridad conocidos** (ver §11): el webhook de MP no valida la firma `x-signature`, y `capacity` de `TicketType` nunca se verifica (se puede sobrevender).

### 9.5 Clasificación al Campeonato Nacional (`runCnClassification`)

Automatiza los cupos directos: toma el Top 3 del CN del año anterior, de la Liga Presencial y de la Liga Online del año en curso, y crea las `Inscripcion` correspondientes con su `source`. El Top 3 se calcula con `score.groupBy` promediando `totalScore` de las fases `FINAL` y `TERCER_LUGAR` con `status = SUBMITTED`.

**Acoplamiento a datos:** depende de los nombres literales `"Campeonato Nacional"`, `"Liga Presencial"`, `"Liga Online"` (constantes en `classification.ts`) y de la categoría `"SOLO"`. Si en el panel admin se crea un tipo de evento con otro nombre, el proceso simplemente no encuentra nada y reporta advertencias en su `log`.

---

## 10. Convenciones de código

**Idioma.** El dominio está en español (`Evento`, `Compra`, `Inscripcion`, `Sugerencia`) y la infraestructura en inglés (`Score`, `Battle`, `JudgeAssignment`, `TicketType`). Es una mezcla consciente; al agregar código, sigue el idioma del módulo que estás tocando en vez de imponer uno.

**Imports.** Alias `@/*` apuntando a la raíz (`tsconfig.json`). Siempre `@/lib/prisma`, nunca rutas relativas largas.

**Componentes.** Server Components por defecto; `'use client'` solo cuando hay estado, efectos o eventos. Los formularios interactivos viven en `components/` y las páginas en `app/` hacen el *fetching* y se los pasan como props.

**Estilos.** Tailwind v4 sin archivo de configuración: los tokens se definen en `app/globals.css` con `@theme inline`. Fuentes `Teko` (títulos) y `Manrope` (cuerpo), y utilidades de *glow* neón (`--text-shadow-lime/red/blue`). La estética general es oscura con degradados azul/negro.

**Validación.** Zod en el servidor, siempre con `safeParse` y devolviendo `error.issues[0].message`. `z.coerce.number()` para campos numéricos de `FormData`.

**Revalidación.** Toda mutación llama a `revalidatePath` de **todas** las vistas afectadas (admin + pública). Es fácil olvidar la vista pública: revísalo al agregar mutaciones.

**Transacciones.** `prisma.$transaction` para operaciones multi-tabla (generación de brackets, cierre de batalla). Úsalo siempre que un fallo parcial deje datos inconsistentes.

**Errores.** Las actions devuelven `{ error }` en vez de lanzar (salvo `checkAdmin`). Los errores se registran con `console.error` — no hay servicio de observabilidad configurado.

**Feedback al usuario.** `react-hot-toast` vía `ToastProvider` global; `canvas-confetti` en momentos de celebración (revelación de ganador).

---

## 11. Deuda técnica y riesgos

Ordenados por impacto. Cada punto está verificado en el código.

### Seguridad

1. **Webhook de Mercado Pago sin validación de firma.** `app/api/compra/webhook-mp/route.ts` es un endpoint público que marca compras como pagadas. No valida el header `x-signature`/`x-request-id`. Mitigante parcial: consulta el pago a MP con `payment.get()` antes de actuar, así que un atacante necesitaría un `paymentId` aprobado real; aun así, debe implementarse la validación HMAC.
2. **`ensureAdminApi()` con resultado ignorado.** En `api/admin/compras/{route,[id],export}` y `api/admin/sugerencias/{route,[id],export}` se escribe `await ensureAdminApi();` sin `if (guard) return guard;`. La función devuelve la respuesta de error en vez de lanzarla, por lo que **la guarda no bloquea nada**. Hoy queda cubierto por `middleware.ts`, pero es una protección de una sola capa y frágil. *Arreglo trivial:* alinear con el patrón de `api/admin/eventos`.
3. **Secretos en logs.** `api/compra/crear-orden/route.ts` imprime `tx.apiKey` y el commerce code en consola con `console.log`. Debe eliminarse antes de operar en producción.
4. **`idempotencyKey: 'abc'` hardcodeado** en `lib/mercadopago.ts`. Debe ser único por transacción.
5. **Sin *rate limiting*** en `/api/password/forgot`, `/api/auth/register` ni en el envío de sugerencias.
6. **`capacity` de `TicketType` nunca se valida.** El propio código lo admite: `// (Aquí podrías añadir lógica de validación de 'capacity' luego)`. Se puede sobrevender un evento.

### Calidad y mantenibilidad

7. **Verificación de tipos desactivada en build.** `next.config.ts` tiene `typescript: { ignoreBuildErrors: true }` y `package.json` compila con `next build --no-lint`. `strict: true` en `tsconfig.json` queda anulado en la práctica: **el build no atrapa errores de tipo**. Riesgo alto para un agente de IA que asuma que "compila = correcto". *Recomendación:* correr `npx tsc --noEmit` manualmente antes de dar por cerrado cualquier cambio.
8. **Cero pruebas automatizadas y cero CI.** No hay Jest/Vitest/Playwright ni carpeta `.github/`. Toda validación es manual. Los flujos de brackets, votación y pagos son candidatos evidentes a pruebas unitarias (`getSeedingOrder` y el conteo de votos son funciones puras fáciles de testear).
9. **`approveWildcard` no crea la inscripción** pese a informar que sí (§9.1).
10. **Dos flujos de compra coexistiendo** (§9.4). El legado debería eliminarse o marcarse como deprecado.
11. **`app/admin/eventos/actions.ts` con 713 líneas** y 11 responsabilidades distintas (eventos, tickets, jueces, ranking, clasificación, categorías, inscritos). Es el principal candidato a división por dominio.
12. **Componentes duplicados:** `CompraDetailDrawer`/`CompraDetailPopup` y `SugerenciaDetailDrawer`/`SugerenciaDetailPopup` conviven; conviene verificar cuál está en uso antes de modificar.
13. **`/api/Sugerencias` con mayúscula inicial**, rompiendo la convención kebab/minúscula del resto de las rutas.
14. **`prisma/dev.db`** (SQLite de 73 KB) permanece en el repo aunque el datasource es PostgreSQL. Residuo de una etapa anterior.
15. **Una sola migración** (`20260329225123_init`) tras un `reset migrations from scratch`. No hay historial incremental: la BD de producción debe estar alineada con ese punto de partida.
16. **Modelo `Puntaje` semi-abandonado**, solapado con `Score`. Decidir si migrar o eliminar.

### Rendimiento

17. **Consulta a BD en cada llamada del callback `jwt`** (§7.1). Correcto funcionalmente, costoso a escala. Alternativa: cachear roles en el token y refrescar solo ante cambios explícitos.
18. **`components/mascota/Mascota.tsx` (40 KB)** se monta en el root layout, o sea en todas las páginas. Vale la pena medir su impacto en el bundle del cliente.
19. **`getTop3` promedia scores de `FINAL` y `TERCER_LUGAR`** para determinar el podio, en vez de leer los `winnerId` de las batallas. Es una aproximación que puede dar podios incorrectos si el puntaje promedio no coincide con el resultado por votos.

---

## 12. Recetas: cómo hacer los cambios más habituales

**Agregar un campo a una entidad**
1. Editar `prisma/schema.prisma` → `npx prisma migrate dev --name descripcion_del_cambio` → `npx prisma generate`.
2. Actualizar el schema Zod correspondiente y el formulario (`components/admin/...`).
3. Actualizar la Server Action que persiste (leer del `FormData`).
4. Actualizar los `select`/`include` de lectura (probablemente en `app/actions/public-data.ts`).
5. `npx tsc --noEmit` (el build no lo hará por ti).

**Agregar una página pública**
1. Crear `app/mi-ruta/page.tsx` como Server Component; exportar `metadata`.
2. Poner las consultas en `app/actions/public-data.ts` y exportar el tipo derivado.
3. Componentes interactivos en `components/mi-ruta/` con `'use client'`.
4. Agregar el enlace en `components/Header.tsx` y `components/layout/MobileMenu.tsx`.

**Agregar una sección al panel admin**
1. `app/admin/mi-seccion/page.tsx` — el `layout.tsx` ya aplica `ensureAdminPage()`.
2. `app/admin/mi-seccion/actions.ts` con `'use server'` siguiendo el patrón de §4.3 (seguridad → Zod → reglas → escritura → `revalidatePath`).
3. Formulario con `useActionState` en `components/admin/mi-seccion/`.
4. Entrada de navegación en `components/admin/home/SidebarNav.tsx` y `MobileSidebar.tsx`.

**Agregar un criterio de evaluación o una categoría**
- Vía `prisma/seed.cts` con `upsert` (no crear directo en BD). Recordar: `Criterio` es único por `(name, categoriaId)`. Los nombres de `Categoria` son parte del contrato del código (§6.4).

**Modificar la lógica del torneo**
- Emparejamiento y creación del árbol: `app/actions/admin/battles.ts`.
- Cierre de batalla, votación y avance: `app/actions/judge/winner.ts`.
- Puntuación: `app/judge/actions.ts` + `lib/schemas/judging.ts`.
- Vista pública del bracket: `getPublicEventBracket` en `public-data.ts` y `components/public/EventBracket.tsx`.

**Tocar pagos**
- Creación de orden: `app/api/compra/crear-orden/route.ts` (aquí vive la regla de oro: *los precios se releen de la BD*).
- Confirmación Webpay: `app/api/compra/confirmar/route.ts`. Webhook MP: `app/api/compra/webhook-mp/route.ts`.
- Configuración de SDKs: `lib/transbank.ts`, `lib/mercadopago.ts`.
- Para pruebas locales: `FORCE_WEBPAY_INTEGRATION=true` y credenciales de integración de Transbank.

---

## 13. Glosario de dominio

| Término | Significado en este sistema |
|---|---|
| **Wildcard** | Audición en video (YouTube) con la que un beatboxer postula a un evento. También es una `RoundPhase`. |
| **Inscripción** | Registro formal de que alguien compite en un evento y categoría. Fuente de verdad de participación. |
| **Categoría** | Modalidad de competencia: `SOLO`, `LOOPSTATION`, `TAG_TEAM`. |
| **Criterio** | Ítem de la rúbrica de evaluación, con puntaje máximo propio. |
| **Fase (`RoundPhase`)** | Etapa: `WILDCARD` → `PRELIMINAR` → `OCTAVOS` → `CUARTOS` → `SEMIFINAL` → `FINAL` (+ `TERCER_LUGAR`). |
| **Score** | Evaluación de un juez a un participante en una fase y round. |
| **Battle** | Enfrentamiento 1v1 en fase eliminatoria. |
| **Seeding** | Ordenamiento de participantes por puntaje preliminar para armar los cruces. |
| **Bracket / Llave** | Árbol del torneo formado por `Battle` encadenadas con `nextBattleId`. |
| **Réplica** | Round de desempate cuando los votos de los jueces quedan empatados (hoy se resuelve manualmente). |
| **Liga Presencial / Liga Online / Campeonato Nacional (CN)** | Tipos de evento del circuito. El Top 3 de cada uno da cupo directo al CN. |
| **Liga Terapéutica** | Rama comunitaria/social, sin competencia. |

---

## 14. Instrucciones para agentes de IA que trabajen en este repo

1. **No confíes en el build como red de seguridad.** `ignoreBuildErrors: true` y `--no-lint` significan que un `next build` exitoso no garantiza nada. Ejecuta `npx tsc --noEmit` para validar tipos.
2. **`prisma/schema.prisma` es la fuente de verdad del dominio.** Léelo antes de cualquier cambio que toque datos.
3. **Nunca cambies precios ni montos basándote en datos del cliente.** El patrón correcto está en `crear-orden` (releer de `TicketType`); replícalo.
4. **No renombres `Categoria.name` ni `EventType.name`** sin revisar `classification.ts`, `api/wildcard/route.ts` y `getWildcardRanking` — se referencian por texto literal.
5. **Cada mutación necesita `revalidatePath`**, incluida la vista pública afectada, no solo la de admin.
6. **Ignora `Fase 1/`, `Fase 2/` y `Fase 3/`.** Son entregables académicos (`.docx`, `.pptx`, `.xlsx`), no código.
7. **Migraciones:** usa siempre `npx prisma migrate dev --name ...`. Nunca edites la BD a mano ni el SQL de una migración ya aplicada.
8. **Antes de dar por cerrada una tarea de negocio**, verifica que no estés replicando alguno de los problemas de §11 (guardas ignoradas, validación ausente, flujo legado).

---

## 15. Recomendaciones priorizadas (visión de arquitecto)

| Prioridad | Acción | Por qué |
|---|---|---|
| 🔴 Alta | Validar la firma del webhook de Mercado Pago | Endpoint público que marca compras como pagadas |
| 🔴 Alta | Corregir las 6 rutas con `ensureAdminApi()` ignorado | Defensa en profundidad; hoy dependen solo del middleware |
| 🔴 Alta | Eliminar los `console.log` de credenciales en `crear-orden` | Filtración de secretos en logs de Vercel |
| 🔴 Alta | Reactivar la verificación de tipos en el build | Sin ella, cualquier refactor es a ciegas |
| 🟠 Media | Cerrar el flujo wildcard → inscripción (con transacción) | Hoy el sistema dice que inscribe y no lo hace |
| 🟠 Media | Validar `capacity` al crear la orden | Evita sobreventa de entradas |
| 🟠 Media | Pruebas unitarias de `getSeedingOrder`, conteo de votos y cálculo de `totalScore` | Funciones puras, alto impacto, costo bajo |
| 🟠 Media | Eliminar el flujo legado `/api/compra-entradas` | Elimina una ruta que crea compras sin cobrar |
| 🟡 Baja | Dividir `app/admin/eventos/actions.ts` por dominio | Mantenibilidad |
| 🟡 Baja | Unificar `Puntaje` con `Score` | Elimina ambigüedad del modelo |
| 🟡 Baja | Agregar CI (typecheck + lint + build) en GitHub Actions | Automatiza los controles anteriores |
| 🟡 Baja | Extraer las constantes de negocio (`"Campeonato Nacional"`, `"SOLO"`) a configuración | Reduce acoplamiento a datos semilla |

---

*Documento generado a partir de una revisión de arquitectura del código fuente. Última verificación: commit `440df54`, rama `home/actualizacion-secciones`.*
