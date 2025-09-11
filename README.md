# 🇨🇱 Beatbox Chile - Plataforma Comunitaria

Plataforma web moderna desarrollada con **Next.js (App Router)** para la comunidad Beatbox Chile. Permite la gestión de ligas, eventos, audiciones, estadísticas, contacto y difusión de la cultura beatbox en Chile.

## 🚀 Tecnologías principales

- [Next.js](https://nextjs.org/) (App Router, SSR/ISR)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/) (UI moderna y responsiva)
- [Prisma ORM](https://www.prisma.io/) (manejo de base de datos)
- [SQLite](https://www.sqlite.org/) (para desarrollo local, fácil de migrar a PostgreSQL en producción)
- [React Hook Form](https://react-hook-form.com/) (manejo de formularios)
- [Zustand](https://zustand-demo.pmnd.rs/) (estado global)
- [NextAuth (Auth.js)](https://authjs.dev/) (próximamente: autenticación de usuarios)

## 🎨 Estilo & UI

Inspirado visualmente en [Swissbeatbox](https://swissbeatbox.com/) y [GBB Official](https://gbbofficial.com/), usando fondo oscuro, cards visuales, fuentes grandes y navegación clara.

---

## 📚 Estructura de carpetas

/app # Rutas principales y subpáginas (Next.js App Router)
/components # Componentes reutilizables por sección
/lib # Utilidades, conexión Prisma, helpers
/hooks # Custom hooks de React
/store # Estado global (Zustand)
/public # Imágenes, logos, etc.
/styles # Tailwind y estilos globales
/prisma # Esquema de la base de datos

## ✨ Funcionalidades del MVP

- **Landing page (Home):** Banner, últimas noticias, anuncios, login/register.
- **Historial competitivo:** Cards de eventos pasados y detalle por competidor.
- **Estadísticas:** Resumen por evento y por participante (dummy).
- **Recepción de wildcard:** Formulario para enviar link de YouTube.
- **Ligas:**  
  - **Liga Competitiva:** Info de circuito, clasificados, reglas, sponsors.
  - **Liga Terapéutica:** Propósito, registro, contacto.
- **Quiénes somos:** Directiva, equipo de trabajo, contacto, buzón de ideas.
- **Layout global:** Header con navegación, footer fijo.
- **Estilo responsive, moderno y atractivo.**

---

## ⚙️ Instalación y ejecución local

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tuusuario/beatbox-chile.git
   cd beatbox-chile

2. **Instala dependencias**
    npm install

3. **Configura el entorno**
    - Crea un archivo .env o .env.local:
    DATABASE_URL="postgresql://USER:PASS@HOST:5432/DB?schema=public"
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="CHANGEME"


4. **Configura la base de datos**
    npx prisma migrate dev --name init

5. **Levanta el servidor**
    npm run dev
    Accede a http://localhost:3000

📦 Scripts útiles
npm run dev — Servidor de desarrollo

npm run build — Build de producción

npm run start — Servidor en producción

npx prisma studio — Administra tu base de datos con UI visual
