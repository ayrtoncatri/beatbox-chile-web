# 🎤 Beatbox Chile — Contexto del Proyecto

> Documento generado para entender la arquitectura, funcionalidades y estado actual de la plataforma.

---

## 1. ¿Qué es Beatbox Chile?

**Beatbox Chile** es una plataforma web *full-stack* moderna creada para centralizar la actividad, la información y el contacto de la comunidad de **Beatbox** en Chile. Es un proyecto académico/profesional que busca digitalizar y profesionalizar la gestión de competencias, eventos y comunidad beatboxer chilena.

### Objetivos principales
- Centralizar información de la comunidad beatbox de Chile.
- Gestionar audiciones (*wildcards*) para competencias.
- Publicar y vender entradas a eventos.
- Registrar historial competitivo de beatboxers.
- Ofrecer un panel administrativo para la directiva.
- Incluir un módulo de evaluación con jueces para competencias.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión / Notas |
|------|-----------|-----------------|
| **Framework** | Next.js (App Router) | 15.4.10 — Con Turbopack en dev |
| **Lenguaje** | TypeScript | 5.9.3 — Tipado estricto en todo el proyecto |
| **Estilos** | Tailwind CSS | v4 — Con PostCSS |
| **Base de datos** | PostgreSQL | Local vía Docker / Producción vía Neon (Vercel Postgres) |
| **ORM** | Prisma | 7.5.0 — Con adapter para `pg` (node-postgres) |
| **Autenticación** | NextAuth.js (Auth.js v4) | JWT + Credentials + Google OAuth |
| **Formularios** | React Hook Form + Zod | Validación de esquemas |
| **Animaciones** | Framer Motion | Interacciones visuales |
| **Emails** | Resend | Envío de correos transaccionales |
| **Pagos** | MercadoPago SDK + Transbank SDK | Integración de pasarelas de pago chilenas |
| **Gráficos** | Chart.js + react-chartjs-2 | Estadísticas y visualizaciones |
| **UI Icons** | Heroicons + Lucide React + React Icons | Iconografía |
| **Deploy** | Vercel | Configurado para build con `--no-lint` |

---

## 3. Arquitectura

### Patrón: Monolito Full-Stack con App Router
- El proyecto usa el **App Router** de Next.js, donde las rutas se definen por el sistema de archivos en `app/`.
- Las **API Routes** (`app/api/.../route.ts`) ejecutan lógica de backend en el runtime de Node.js del servidor.
- Se usa **Server Components** por defecto para fetching de datos directo a la base de datos.
- **Client Components** se usan para interactividad (formularios, animaciones, estado local).

### Flujo de datos típico
```
Usuario → Navegador → Next.js App Router
                        ↓
              ┌─────────┴──────────┐
              ↓                    ↓
    Server Component      API Route (POST/PUT/DELETE)
              ↓                    ↓
         Prisma Client ←───────────┘
              ↓
         PostgreSQL
```

### Autenticación y Autorización
- **NextAuth.js** con estrategia **JWT** (8 horas de expiración fija, sin renovación automática).
- **Providers:** Credentials (email+password con bcrypt) y Google OAuth.
- **Roles:** Sistema basado en `Role` → `UserRole` → `User`. El token JWT incluye el array de roles.
- **Middleware** (`middleware.ts`): Protege rutas `/admin/*` y `/api/admin/*`, verificando que el usuario tenga el rol `"admin"`.

---

## 4. Estructura de Carpetas

```
beatbox-chile-web/
├── app/                          # App Router de Next.js
│   ├── (rutas públicas)
│   │   ├── page.tsx              # Home / Landing
│   │   ├── eventos/              # Listado de eventos
│   │   ├── eventos/[id]/         # Detalle de evento
│   │   ├── wildcard/             # Envío de audiciones (wildcards)
│   │   ├── estadisticas/         # Estadísticas de competidores/jueces
│   │   ├── historial-competitivo/# Historial de competencias
│   │   ├── liga-competitiva/     # Liga competitiva
│   │   ├── liga-terapeutica/     # Liga terapéutica (comunidad)
│   │   ├── quienes-somos/        # Sobre nosotros + Contacto + Buzón de ideas
│   │   ├── tienda/               # Tienda (placeholder)
│   │   ├── compra-entradas/      # Compra de entradas a eventos
│   │   ├── perfil/               # Perfil de usuario
│   │   └── publicaciones/        # Blog y Noticias
│   ├── admin/                    # Panel de administración
│   │   ├── page.tsx              # Dashboard admin
│   │   ├── eventos/              # CRUD eventos
│   │   ├── usuarios/             # CRUD usuarios
│   │   ├── wildcards/            # Revisión y aprobación de wildcards
│   │   ├── publicaciones/        # CRUD publicaciones
│   │   ├── sugerencias/          # Gestión de sugerencias/contacto
│   │   ├── compras/              # Gestión de compras/ventas
│   │   ├── inscripciones/        # Inscripciones a eventos
│   │   └── clasificacion/        # Clasificación de competidores
│   ├── judge/                    # Panel del juez
│   │   └── dashboard/            # Dashboard para jueces evaluadores
│   ├── auth/                     # Autenticación
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── api/                      # API Routes
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── auth/register/        # Registro de usuarios
│   │   ├── admin/...             # CRUD protegido para admin
│   │   ├── eventos/              # API pública de eventos
│   │   ├── wildcard/             # API para enviar wildcards
│   │   ├── compra-entradas/      # API para comprar entradas
│   │   ├── compra/               # MercadoPago / Transbank
│   │   ├── cl/                   # Datos geográficos de Chile (regiones/comunas)
│   │   ├── publicaciones/        # API de publicaciones
│   │   ├── Sugerencias/          # Envío de sugerencias/contacto
│   │   ├── user/update/          # Actualización de perfil
│   │   └── password/...          # Recuperación de contraseña
│   └── actions/                  # Server Actions
│       ├── public-data.ts        # Datos públicos reutilizables
│       ├── admin/                # Actions de admin
│       └── judge/                # Actions de juez
├── components/                   # Componentes React
│   ├── home/                     # Secciones del home
│   ├── admin/                    # Componentes del panel admin
│   ├── compra-entradas/          # Flujo de compra
│   ├── estadisticas/             # Gráficos y estadísticas
│   ├── public/                   # Componentes públicos (brackets, wildcards)
│   ├── judge/                    # UI del panel de jueces
│   └── layout/                   # Header, Footer, MobileMenu
├── lib/                          # Utilidades y configuraciones
│   ├── prisma.ts                 # Singleton de PrismaClient con adapter pg
│   ├── auth.ts                   # Configuración de NextAuth
│   ├── permissions.ts            # Lógica de permisos/roles
│   ├── email.ts                  # Configuración de Resend
│   ├── mercadopago.ts            # SDK de MercadoPago
│   ├── transbank.ts              # SDK de Transbank
│   ├── tokens.ts                 # Generación de tokens seguros
│   ├── cl-geo.ts / cl-geo-static.ts # Datos geográficos de Chile
│   └── schemas/judging.ts        # Esquemas Zod para evaluación
├── prisma/
│   ├── schema.prisma             # Esquema completo de la base de datos
│   ├── seed.cts                  # Seed de datos iniciales
│   └── migrations/               # Migraciones de Prisma
├── types/
│   └── next-auth.d.ts            # Tipos extendidos de NextAuth
├── public/                       # Archivos estáticos
├── Fase 1/                       # Evidencias académicas (grupales e individuales)
├── Fase 2/                       # Evidencias académicas
└── Fase 3/                       # Evidencias académicas
```

---

## 5. Modelo de Datos (Prisma Schema)

### Entidades principales

#### 👤 Usuarios y Autenticación
- **`User`** — Usuario base (email, password hash, imagen, estado activo).
- **`UserProfile`** — Perfil extendido (nombres, apellidos, fecha de nacimiento, comuna).
- **`Role`** / **`UserRole`** — Sistema de roles (ej: "admin", "user", "judge").
- **`PasswordResetToken`** — Tokens para recuperación de contraseña.

#### 🎤 Competencias y Eventos
- **`Evento`** — Evento principal (nombre, fecha, tipo, reglas, venue, imagen, estado publicado, venta de entradas, deadline de wildcards).
- **`EventType`** — Catálogo de tipos de evento.
- **`Categoria`** — Categorías de competencia (ej: Solo, Tag Team, Loopstation).
- **`Criterio`** — Criterios de evaluación por categoría (nombre, descripción, puntaje min/max).
- **`Venue`** / **`Address`** / **`Comuna`** / **`Region`** — Ubicación geográfica del evento.

#### 🎧 Wildcards y Evaluación
- **`Wildcard`** — Audición enviada por un usuario (URL de YouTube, nombre artístico, estado: PENDING/APPROVED/REJECTED, notas de revisión).
- **`Inscripcion`** — Inscripción centralizada de competidores a eventos. Vincula usuarios a eventos+categorías con una `source` (wildcard, liga, admin, top3 histórico, etc.).
- **`JudgeAssignment`** — Asignación de jueces a eventos/categorías/fases.
- **`Score`** — Puntaje de un juez a un participante en una ronda/fase. Incluye estado (DRAFT / SUBMITTED).
- **`ScoreDetail`** — Detalle de cada criterio evaluado dentro de un Score.
- **`Battle`** — Batalla entre dos participantes en una fase. Incluye relaciones de llave (nextBattle/prevBattles) para brackets.

#### 🎟️ Tickets y Compras
- **`TicketType`** — Tipos de entrada para un evento (nombre, precio, capacidad, moneda).
- **`Compra`** — Orden de compra de un usuario (estado: pendiente/pagada/fallida/reembolsada).
- **`CompraItem`** — Línea de compra (cantidad, precio unitario, subtotal).

#### 📰 Contenido y Comunicación
- **`Publicacion`** — Blog y noticias (título, descripción, tipo, estado, autor, imágenes).
- **`Sugerencia`** — Mensajes del buzón de ideas/contacto (con estado de gestión).
- **`Mensaje`** — Mensajes de contacto general.
- **`Puntaje`** — Sistema de puntos/ranking de competidores por evento.

### Enums clave
- `WildcardStatus`: `PENDING`, `APPROVED`, `REJECTED`
- `PaymentStatus`: `pendiente`, `pagada`, `fallida`, `reembolsada`
- `PublicationType`: `blog`, `noticia`
- `PublicationStatus`: `borrador`, `publicado`, `archivado`
- `SuggestionStatus`: `nuevo`, `en_progreso`, `resuelta`, `descartada`
- `RoundPhase`: `WILDCARD`, `PRELIMINAR`, `OCTAVOS`, `CUARTOS`, `SEMIFINAL`, `TERCER_LUGAR`, `FINAL`
- `ScoreStatus`: `DRAFT`, `SUBMITTED`
- `InscripcionSource`: `WILDCARD`, `LIGA_ADMIN`, `CN_ADMIN`, `CN_HISTORICO_TOP3`, `LIGA_PRESENCIAL_TOP3`, `LIGA_ONLINE_TOP3`

---

## 6. Rutas y Páginas Principales

### 🌐 Públicas
| Ruta | Descripción |
|------|-------------|
| `/` | Home con banner, anuncios, blog, noticias, misión/visión/valores |
| `/eventos` | Listado de eventos |
| `/eventos/[id]` | Detalle de un evento |
| `/wildcard` | Formulario para enviar audición (wildcard) |
| `/estadisticas` | Estadísticas de competidores, eventos y jueces |
| `/historial-competitivo` | Historial de competencias y competidores |
| `/liga-competitiva` | Información de la liga competitiva |
| `/liga-terapeutica` | Liga terapéutica / comunitaria |
| `/quienes-somos` | Sobre la organización, directiva, contacto, buzón de ideas |
| `/tienda` | Tienda (en desarrollo) |
| `/compra-entradas` | Flujo de compra de entradas |
| `/perfil` | Perfil y edición de datos del usuario |
| `/publicaciones/[id]` | Lectura de blog o noticia |
| `/auth/login` | Inicio de sesión |
| `/auth/register` | Registro de cuenta |
| `/auth/forgot-password` | Recuperación de contraseña |
| `/auth/reset-password` | Reset de contraseña con token |

### 🔒 Administración (`/admin/*` — Requiere rol "admin")
| Ruta | Descripción |
|------|-------------|
| `/admin` | Dashboard administrativo |
| `/admin/eventos` | CRUD de eventos |
| `/admin/usuarios` | Gestión de usuarios y roles |
| `/admin/wildcards` | Revisión y aprobación de wildcards |
| `/admin/publicaciones` | Gestión de blog y noticias |
| `/admin/sugerencias` | Gestión del buzón de ideas |
| `/admin/compras` | Gestión de compras y exportación |
| `/admin/inscripciones` | Inscripciones a eventos |
| `/admin/clasificacion` | Clasificación de competidores |

### ⚖️ Panel de Juez (`/judge/*`)
| Ruta | Descripción |
|------|-------------|
| `/judge/dashboard` | Dashboard para jueces evaluadores |

---

## 7. Flujos de Negocio Clave

### 7.1 Registro y Autenticación
1. El usuario se registra con email/password (hash con bcrypt).
2. O inicia sesión con Google OAuth (se crea perfil automáticamente parseando nombres/apellidos).
3. NextAuth genera un JWT con roles, datos de perfil y estado activo.
4. El JWT expira en 8 horas (sin renovación automática).
5. El middleware protege `/admin/*` y `/api/admin/*` verificando el rol `"admin"`.

### 7.2 Envío y Revisión de Wildcards
1. Usuario logueado accede a `/wildcard`.
2. Envía URL de YouTube + nombre artístico + selecciona categoría.
3. La wildcard queda en estado `PENDING`.
4. Un admin revisa en `/admin/wildcards`.
5. Al aprobar: la wildcard pasa a `APPROVED` y se puede generar una `Inscripcion` automática.
6. Al rechazar: pasa a `REJECTED` con notas del admin.

### 7.3 Compra de Entradas
1. Usuario navega `/compra-entradas` y selecciona un evento.
2. Elige tipo y cantidad de entradas.
3. Se crea una `Compra` en estado `pendiente`.
4. Se redirige a MercadoPago o Transbank para el pago.
5. El webhook confirma el pago y la compra pasa a `pagada`.

### 7.4 Evaluación por Jueces (Sistema de Competencia)
1. Admin asigna jueces a eventos/categorías/fases (`JudgeAssignment`).
2. El juez accede a `/judge/dashboard`.
3. Ve los participantes asignados y evalúa según criterios de la categoría.
4. Cada evaluación crea un `Score` con múltiples `ScoreDetail` (uno por criterio).
5. El score puede estar en `DRAFT` (borrador) o `SUBMITTED` (enviado).
6. Las batallas (`Battle`) conectan participantes en fases eliminatorias con llaves tipo bracket.

### 7.5 Inscripciones Centralizadas
- El modelo `Inscripcion` es la "fuente de verdad" de quién compite en qué.
- Soporta múltiples orígenes: wildcard aprobado, inscripción manual por admin, cupo automático por top 3, etc.
- Garantiza unicidad por `userId + eventoId + categoriaId`.

---

## 8. Estado Actual del Proyecto

### ✅ Lo que está implementado
- ✅ Autenticación completa (credentials + Google OAuth + JWT).
- ✅ Sistema de roles y middleware de protección de admin.
- ✅ CRUD completo de eventos, usuarios, wildcards, publicaciones y sugerencias en el panel admin.
- ✅ Envío y revisión de wildcards con estados.
- ✅ Sistema de compra de entradas con integración a MercadoPago y Transbank.
- ✅ Blog y noticias publicables.
- ✅ Página de estadísticas con gráficos.
- ✅ Historial competitivo.
- ✅ Liga competitiva y terapéutica.
- ✅ Perfil de usuario editable.
- ✅ Módulo de evaluación por jueces (`Score`, `ScoreDetail`, `JudgeAssignment`, `Battle`).
- ✅ Sistema de inscripciones centralizadas con múltiples fuentes.
- ✅ Recuperación de contraseña por email (Resend).
- ✅ Datos geográficos de Chile (regiones/comunas).

### 🔄 Áreas en desarrollo / pendientes
- 🔄 Tienda (`/tienda`) — parece estar en etapa inicial.
- 🔄 Posibles mejoras en la UX del bracket de competencias.
- 🔄 Integraciones adicionales de pago o notificaciones push.

---

## 9. Configuración del Entorno

### Variables de entorno necesarias
```env
DATABASE_URL=postgresql://usuario:pass@host:puerto/db?schema=public
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<cadena-segura-aleatoria>
GOOGLE_CLIENT_ID=<opcional>
GOOGLE_CLIENT_SECRET=<opcional>
```

### Comandos clave
```bash
# Instalación
npm ci

# Base de datos (desarrollo local con Docker)
docker compose up -d

# Prisma
npx prisma generate
npx prisma migrate dev
npx prisma studio

# Desarrollo
npm run dev        # Con Turbopack

# Build
npm run build      # Genera Prisma + build Next.js
```

### Requisitos
- Node.js ≥ 18.18 (recomendado LTS 20)
- Docker (para PostgreSQL local)
- npm

---

## 10. Notas Técnicas Importantes

1. **Prisma usa adapter de `pg`**: El archivo `lib/prisma.ts` crea un `Pool` de `pg` y un `PrismaPg` adapter. Esto es importante para conexiones con Neon/Vercel Postgres.

2. **Build sin lint**: El `next.config.ts` tiene `typescript: { ignoreBuildErrors: true }` y el script de build usa `--no-lint`. Esto sugiere que el proyecto prioriza el despliegue sobre la corrección de errores de tipado/lint en este momento. Aun así, desde la pasada de legibilidad de 2026-08-24 (rama `chore/buenas-practicas-legibilidad`) `npm run lint` corre casi limpio (8 errores, 0 warnings — todos documentados en `ARCHITECTURE.md` §11.7, §11.12 y §11.20) y `npx tsc --noEmit` no tiene errores nuevos respecto a los 19 preexistentes (§11.7, §11.20, §11.21, §11.22) — vale la pena seguir corriendo ambos antes de cada PR aunque el build no los exija.

3. **Imágenes externas**: Configurado para soportar `lh3.googleusercontent.com` (Google avatars), `ui-avatars.com` y `res.cloudinary.com`.

4. **Seed de datos**: `prisma/seed.cts` contiene datos iniciales. Se ejecuta con `npx prisma db seed`.

5. **Scripts personalizados**: `geo:snapshot` genera un snapshot de datos geográficos de Chile.

6. **Fases del proyecto**: Las carpetas `Fase 1`, `Fase 2` y `Fase 3` contienen evidencias académicas (grupales e individuales). No son parte del código fuente de la aplicación.

---

> 📄 Este documento refleja el estado del proyecto al momento de su generación. Para actualizaciones, revisar `package.json`, `prisma/schema.prisma` y las rutas en `app/`.
