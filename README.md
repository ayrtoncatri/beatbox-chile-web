<div align="center">

# Beatbox Chile

**Plataforma web para la gestión integral de la comunidad y las competencias de beatbox en Chile.**

[![Next.js](https://img.shields.io/badge/Next.js-15.4-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.5-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## Índice

- [Sobre el proyecto](#sobre-el-proyecto)
- [Funcionalidades](#funcionalidades)
- [Stack tecnológico](#stack-tecnológico)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Roles y accesos](#roles-y-accesos)
- [Pasarelas de pago](#pasarelas-de-pago)
- [Despliegue](#despliegue)
- [Documentación adicional](#documentación-adicional)
- [Convenciones de contribución](#convenciones-de-contribución)
- [Equipo](#equipo)

---

## Sobre el proyecto

Beatbox Chile no es un sitio informativo: es un **sistema de gestión de competencias** con un portal público encima. La plataforma cubre el ciclo completo de un evento de beatbox, desde la convocatoria hasta la coronación del ganador.

El sistema resuelve cuatro necesidades concretas de la comunidad:

| Necesidad | Cómo la resuelve la plataforma |
|---|---|
| **Convocar y filtrar participantes** | Postulación mediante video de YouTube (*wildcard*), evaluación por jurado con rúbrica y clasificación por ranking. |
| **Operar la competencia** | Generación automática de llaves con *seeding* por puntaje, panel de jueces en vivo y avance automático de ganadores por el árbol del torneo. |
| **Vender entradas** | Integración real con Webpay Plus (Transbank) y Mercado Pago, con confirmación idempotente y validación de montos en el servidor. |
| **Sostener la comunidad** | Blog y noticias, historial competitivo público, estadísticas, buzón de ideas y páginas institucionales. |

La aplicación es un **monolito full-stack** construido sobre el App Router de Next.js: un mismo despliegue sirve la interfaz, ejecuta la lógica de negocio en el servidor y conversa con PostgreSQL a través de Prisma.

---

## Funcionalidades

### Portal público

- **Home** con carrusel, anuncios, últimas publicaciones e historia de la escena.
- **Eventos**: listado, detalle, bracket en vivo y galería de wildcards por evento.
- **Compra de entradas** con Webpay Plus o Mercado Pago.
- **Historial competitivo**: trayectoria por competidor y por evento, con gráficos de evolución por criterio.
- **Estadísticas** de competidores, eventos y jueces.
- **Liga Competitiva** y **Liga Terapéutica** (rama comunitaria).
- **Quiénes somos**: directiva, equipo de trabajo, contacto y buzón de ideas.
- **Publicaciones**: blog y noticias.

### Cuenta de usuario

- Registro y acceso con email/contraseña (bcrypt) o Google OAuth.
- Recuperación de contraseña por email con token de un solo uso (expira en 1 hora).
- Perfil editable con datos personales y comuna (catálogo oficial de regiones y comunas de Chile).
- Envío y edición de wildcards mientras el plazo del evento siga abierto.

### Panel de administración (`/admin`)

- **Dashboard** con métricas y gráficos.
- **Eventos**: CRUD completo, tipos de entrada, categorías de competencia con cupos, asignación de jueces por fase.
- **Wildcards**: revisión, aprobación/rechazo, ranking por categoría y marcado de clasificados.
- **Inscripciones**: registro manual de competidores y proceso automático de clasificación al Campeonato Nacional (Top 3 del CN anterior y de ambas ligas).
- **Brackets**: generación del árbol del torneo con emparejamiento por *seeding*.
- **Usuarios**: gestión de datos, roles y activación/desactivación de cuentas.
- **Publicaciones**, **sugerencias** y **compras**, con exportación a CSV.

### Panel de jueces (`/judge`)

- Vista de asignaciones por evento, categoría y fase.
- Evaluación por criterios con rúbrica cargada desde la base de datos, autoguardado en estado `DRAFT` y envío definitivo (`SUBMITTED`).
- Puntuación de batallas por rounds y declaración de ganador con validación de quórum.

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router, Server Components, Server Actions) | 15.4.10 |
| UI | React | 19.1.2 |
| Lenguaje | TypeScript | 5.9.3 |
| Estilos | Tailwind CSS (configuración *CSS-first*, sin `tailwind.config.js`) | v4 |
| ORM | Prisma con driver adapter `@prisma/adapter-pg` | 7.5.0 |
| Base de datos | PostgreSQL | 16 |
| Autenticación | NextAuth.js (Auth.js v4) — JWT, Credentials + Google | 4.24.11 |
| Validación | Zod | 4.1.11 |
| Formularios | React Hook Form | 7.62.0 |
| Pagos | `transbank-sdk` 6.1 · `mercadopago` 2.9 | — |
| Email | Resend | 6.5.2 |
| Gráficos | Chart.js + react-chartjs-2 | 4.5 / 5.3 |
| Diagramas | React Flow (visualización de brackets) | 11.11.4 |
| Animación | Framer Motion | 12.23.12 |
| Despliegue | Vercel | — |

---

## Requisitos previos

- **Node.js** ≥ 18.18 (recomendado: LTS 20 o superior)
- **Docker Desktop** — para levantar PostgreSQL en local ([descargar](https://www.docker.com/products/docker-desktop/))
- **npm** (se recomienda `npm ci` para instalaciones reproducibles)

---

## Instalación

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone https://github.com/ayrtoncatri/beatbox-chile-web.git
cd beatbox-chile-web
npm ci
```

> El hook `postinstall` ejecuta `prisma generate` automáticamente.

### 2. Configurar las variables de entorno

Crea un archivo `.env` en la raíz del proyecto. Ver [Variables de entorno](#variables-de-entorno) para el detalle de cada clave.

```env
DATABASE_URL="postgresql://beatbox:beatbox@localhost:5432/beatbox?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<genera-una-cadena-segura>"
APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Para generar un secreto robusto:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Levantar la base de datos

```bash
docker compose up -d     # PostgreSQL 16 en localhost:5432
docker compose ps        # debe reportar estado "healthy"
```

### 4. Preparar el esquema y los datos base

```bash
npx prisma generate      # cliente de Prisma
npx prisma migrate dev   # aplica las migraciones
npx prisma db seed       # roles, tipos de evento, categorías y rúbricas
```

> [!IMPORTANT]
> **El seed no es opcional.** Sin él la aplicación queda en un estado inconsistente: el acceso con Google falla (requiere que exista el rol `user`), el envío de wildcards falla (busca las categorías por nombre) y el panel de jueces no tiene criterios con los cuales puntuar.

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación queda disponible en **http://localhost:3000**.

Para inspeccionar los datos:

```bash
npx prisma studio
```

---

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|:---:|---|
| `DATABASE_URL` | ✅ | Cadena de conexión a PostgreSQL. |
| `NEXTAUTH_URL` | ✅ | URL base de la aplicación. También se usa para construir el enlace del correo de recuperación de contraseña. |
| `NEXTAUTH_SECRET` | ✅ | Clave de firma de los JWT. |
| `MFA_ENCRYPTION_KEY` | ✅ | Llave de 32 bytes en base64 para cifrar secretos TOTP de los roles `admin` y `judge`. |
| `MFA_SESSION_SECRET` | ➖ | Secreto de firma de la cookie de segundo factor. Si falta, se usa `NEXTAUTH_SECRET`; se recomienda definirlo en producción. |
| `CRON_SECRET` | ✅ | Secreto Bearer para ejecutar el cron diario de retención de datos (`/api/internal/data-retention`). |
| `GOOGLE_CLIENT_ID` | ⚠️ | ID de cliente OAuth. Requerido para el acceso con Google. |
| `GOOGLE_CLIENT_SECRET` | ⚠️ | Secreto de cliente OAuth. |
| `WEBPAY_PLUS_COMMERCE_CODE` | ✅ | Código de comercio de Transbank. |
| `WEBPAY_PLUS_API_KEY` | ✅ | API key de Transbank. |
| `WEBPAY_RETURN_URL` | ➖ | URL de retorno tras el pago. Por defecto: `http://localhost:3000/compra/resultado`. |
| `FORCE_WEBPAY_INTEGRATION` | ➖ | Con valor `"true"` fuerza el ambiente de Integración de Transbank aunque `NODE_ENV` sea `production`. |
| `MERCADOPAGO_ACCESS_TOKEN` | ✅ | Access token de Mercado Pago. |
| `APP_URL` | ✅ | URL base usada para las `back_urls` y el `notification_url` de Mercado Pago. |
| `NEXT_PUBLIC_APP_URL` | ➖ | URL base expuesta al cliente. |
| `RESEND_API_KEY` | ⚠️ | API key de Resend. Requerida para el envío de correos de recuperación. |

> [!WARNING]
> `lib/transbank.ts` y `lib/mercadopago.ts` validan sus credenciales **en tiempo de importación del módulo**: si faltan, la aplicación no arranca, no solo el flujo de pago. Define siempre las cuatro claves de pasarelas, aunque uses valores de prueba.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con Turbopack. |
| `npm run build` | Ejecuta `prisma generate` y compila la aplicación. |
| `npm start` | Sirve la build de producción. |
| `npm run lint` | Análisis estático con ESLint. |
| `npx prisma migrate dev --name <nombre>` | Crea y aplica una migración. |
| `npx prisma db seed` | Puebla catálogos, categorías y rúbricas. |
| `npx prisma studio` | Explorador visual de la base de datos. |
| `npx tsc --noEmit` | **Verificación de tipos.** Ver la nota siguiente. |

> [!NOTE]
> El build está configurado con `typescript.ignoreBuildErrors: true` y `next build --no-lint`, por lo que **una compilación exitosa no garantiza ausencia de errores de tipado**. Ejecuta `npx tsc --noEmit` antes de abrir un Pull Request.

---

## Estructura del proyecto

```
beatbox-chile-web/
├── app/                      # App Router: rutas, layouts y handlers
│   ├── actions/              # Server Actions transversales
│   │   ├── public-data.ts    # Capa central de lectura pública
│   │   ├── admin/            # Brackets, clasificación e inscripciones
│   │   └── judge/            # Declaración de ganadores
│   ├── admin/                # Panel de administración (rol admin)
│   ├── judge/                # Panel de jueces (rol judge)
│   ├── api/                  # Route Handlers: auth, pagos, webhooks, CRUD admin
│   ├── auth/                 # Login, registro y recuperación de contraseña
│   └── (públicas)            # eventos, wildcard, estadísticas, historial, ligas…
├── components/               # Componentes React, espejo de la estructura de app/
├── lib/                      # Infraestructura compartida
│   ├── prisma.ts             # Singleton de PrismaClient + adapter pg
│   ├── auth.ts               # Configuración de NextAuth
│   ├── permissions.ts        # Guardas de autorización
│   ├── transbank.ts          # SDK de Webpay Plus
│   ├── mercadopago.ts        # SDK de Mercado Pago
│   ├── email.ts / tokens.ts  # Resend y tokens de recuperación
│   └── schemas/              # Esquemas Zod de dominio
├── prisma/
│   ├── schema.prisma         # Fuente de verdad del modelo de datos
│   ├── migrations/           # Historial de migraciones
│   └── seed.cts              # Datos base
├── types/                    # Augmentación de tipos (NextAuth)
├── middleware.ts             # Protección de /admin y /api/admin
└── docker-compose.yml        # PostgreSQL local
```

Las carpetas `Fase 1/`, `Fase 2/` y `Fase 3/` contienen evidencias académicas del proyecto y **no forman parte del código fuente de la aplicación**.

---

## Roles y accesos

Los roles se almacenan como registros (`Role` ↔ `UserRole`) y viajan en el JWT como un arreglo de strings.

| Rol | Alcance |
|---|---|
| `user` | Rol por defecto. Perfil, compra de entradas y envío de wildcards. |
| `participant` | Competidor inscrito en eventos. |
| `judge` | Acceso a `/judge/dashboard`; puntúa únicamente las categorías y fases que tenga asignadas. |
| `admin` | Acceso completo a `/admin` y a la API administrativa. |

La autorización opera en tres capas: el `middleware.ts` protege el borde (`/admin/*` y `/api/admin/*`), las guardas de `lib/permissions.ts` protegen páginas y endpoints en el servidor, y las Server Actions revalidan permisos y reglas de negocio antes de escribir.

> [!TIP]
> Un administrador que necesite declarar ganadores de batalla debe tener **también** el rol `judge`: esa acción valida específicamente el rol de juez.

---

## Pasarelas de pago

El flujo vigente es `POST /api/compra/crear-orden`, que **relee siempre los precios desde la base de datos** en lugar de confiar en el payload del cliente, crea la `Compra` en estado `pendiente` y devuelve la URL de la pasarela seleccionada.

- **Webpay Plus** → el usuario vuelve a `/compra/resultado`, que confirma con `POST /api/compra/confirmar`. La confirmación es idempotente y compara el monto autorizado contra el total registrado; ante discrepancia, revierte la transacción.
- **Mercado Pago** → el usuario vuelve a `/compra/resultado-mp` y la confirmación real llega por el webhook `POST /api/compra/webhook-mp`, también idempotente.

Para pruebas locales, usa las credenciales de integración de Transbank junto con `FORCE_WEBPAY_INTEGRATION=true`.

---

## Despliegue

El proyecto está preparado para **Vercel**.

1. Configura todas las variables de entorno en el panel del proyecto.
2. Usa una base de datos PostgreSQL gestionada con *connection pooling* (Neon o Vercel Postgres). El adapter `@prisma/adapter-pg` está configurado precisamente para ese escenario.
3. El comando de build (`prisma generate && next build --no-lint`) ya está definido en `package.json`.
4. Aplica las migraciones contra la base de producción con `npx prisma migrate deploy` — deliberadamente **no** forma parte del build.
5. Registra las URLs de retorno y notificación de las pasarelas apuntando al dominio de producción.

---

## Documentación adicional

| Documento | Contenido |
|---|---|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Documentación técnica completa: modelo de datos e invariantes, mapa de rutas y Server Actions, flujos de negocio detallados, convenciones, deuda técnica conocida y recetas para los cambios más habituales. **Punto de partida recomendado para nuevos desarrolladores.** |
| [`CONTEXT.md`](./CONTEXT.md) | Visión general del proyecto y de su estado funcional. |
| [`prisma/schema.prisma`](./prisma/schema.prisma) | Fuente de verdad del modelo de datos. |

---

## Convenciones de contribución

- **Ramas**: una por funcionalidad, con nombre descriptivo (`feature/…`, `fix/…`); los cambios se integran a `main` mediante Pull Request.
- **Commits**: prefijo de tipo (`feature:`, `fix:`, `style:`, `refactor:`) seguido de una descripción breve en español.
- **Mutaciones de datos**: valida siempre con Zod en el servidor, verifica permisos antes de escribir, usa `prisma.$transaction` cuando la operación toque varias tablas e invoca `revalidatePath` sobre **todas** las vistas afectadas, incluidas las públicas.
- **Lecturas públicas** relacionadas con eventos, competidores o brackets: agrégalas en `app/actions/public-data.ts` en lugar de dispersarlas en las páginas.
- **Modelo de datos**: los cambios se hacen en `prisma/schema.prisma` y se propagan con `npx prisma migrate dev`. Nunca edites la base de datos a mano ni el SQL de una migración ya aplicada.
- **Antes del PR**: ejecuta `npx tsc --noEmit` y `npm run lint`.

Para el detalle de cada convención y guías paso a paso, consulta [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Equipo

Desarrollado por **Ayrton Catri** y **Alexander Pizarro** en colaboración con la comunidad de Beatbox Chile.

---

<div align="center">

*Hecho con ritmo en Chile* 🇨🇱

</div>
