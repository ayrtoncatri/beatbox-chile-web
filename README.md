# 🇨🇱 Beatbox Chile — Plataforma Comunitaria

Plataforma web moderna para centralizar **audiciones (wildcards en YouTube)**, **eventos**, **estadísticas competitivas** y **contacto** de la comunidad Beatbox en Chile.

## 🚀 Stack principal
- **Next.js (App Router)** · SSR/ISR · Node runtime en APIs
- **TypeScript**
- **TailwindCSS**
- **Prisma ORM**
- **PostgreSQL**  
  - Dev: contenedor Docker local  
  - Prod: **Neon (Vercel Postgres)** con **pooling** (`pgbouncer=true`)
- **Auth.js (NextAuth)** · **solo credenciales (JWT)** por ahora
- **React Hook Form + Yup**
- **bcrypt** para hash de contraseñas
- **Framer Motion** (animaciones)

> Nota: actualmente **NO** usamos `PrismaAdapter` (los modelos de NextAuth no están en el schema). La autenticación es con **credentials provider** y **JWT**.

---

## ✨ Estado actual (MVP)
- Registro e inicio de sesión con correo + contraseña (hash con `bcrypt`).
- Modelo de datos (Prisma): `User`, `Evento`, `Wildcard`, `Estadistica`, `CompraEntrada`, `Sugerencia`, `Mensaje`.
- Envío de **wildcard (YouTube)** con validación, asignando evento por defecto si no existe.
- Listado público de **eventos**.
- **Compra de entradas** (simulada) con tipos `General`/`VIP`.
- Secciones de navegación: Inicio, Wildcard, Estadísticas, Ligas (competitiva/terapéutica), Quiénes Somos, Entradas.
- Proyecto desplegable en **Vercel** con **Neon**.

---

## 📁 Estructura relevante

app/
api/
auth/
[...nextauth]/route.ts # NextAuth (JWT + credentials). runtime=nodejs
register/route.ts # Registro con hash. runtime=nodejs
compra-entradas/route.ts # Crea CompraEntrada. runtime=nodejs
eventos/route.ts # Lista eventos. runtime=nodejs
wilcard/route.ts # (próx. renombrar a /wildcard). runtime=nodejs
(páginas públicas y layouts)

lib/
prisma.ts # PrismaClient singleton
auth.ts # export const authOptions (NextAuth)

prisma/
schema.prisma # provider postgresql
migrations/ # migraciones Prisma

---

## 🗄️ Esquema (resumen)
- **User**: `id`, `email` (único), `password?`, `name?`, `image?`, `role` (`user`/`admin`), relaciones a `Wildcard`, `Estadistica`, `CompraEntrada`, `Sugerencia`.
- **Evento**: `id`, `nombre`, `fecha`, `tipo`, `reglas`, relaciones a `Wildcard`, `Estadistica`, `CompraEntrada`.
- **Wildcard**: `id`, `youtubeUrl`, `userId`, `eventoId`, `createdAt`.
- **CompraEntrada**: datos de usuario, evento, tipo de entrada, `cantidad`, `precioUnitario`, `total`.
- **Estadistica**, **Sugerencia**, **Mensaje** (campos básicos).

---

## ⚙️ Requisitos
- **Node.js ≥ 18.18**
- **Docker** (para Postgres local) → https://docs.docker.com/get-started/get-docker/
- **npm** (se recomienda `npm ci`)

---

## 🧪 Configuración local (desarrollo)

1) **Clonar**

git clone https://github.com/ayrtoncatri/beatbox-chile-web.git
cd beatbox-chile-web

2) **Instalar**

npm ci (recomendado) o npm install

3) **Base de datos (Docker)**

docker compose up -d
docker compose ps   # debe verse Up/healthy

4) **Variables de entorno**

Crear archivo .env en la raiz del proyecto y pegar lo siguiente:

DATABASE_URL="postgresql://beatbox:beatbox@localhost:5432/beatbox?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="mVjW9oI2m2G2nJrXgkQ0Zb0J1MEoG0pG5w1Qy6Xy1xg="

5) **Prisma**

npx prisma generate
npx prisma migrate dev -n init_postgres
# (opcional) npx prisma studio

6) **Levantar servidor de desarrollo**

npm run dev
# http://localhost:3000






