# 🇨🇱 Beatbox Chile — Plataforma Comunitaria

## 📝 Descripción del Proyecto

**Beatbox Chile** es una plataforma web *full-stack* moderna diseñada para centralizar la actividad, la información y el contacto de la comunidad de *Beatbox* en Chile [1].

La aplicación utiliza **Next.js** con el **App Router** [1, 2], implementando una arquitectura monolítica [3]. Esto permite que la lógica de *backend* (API Routes y *data fetching*) se ejecute en el servidor [4, 5], garantizando **alto rendimiento** y una **navegación fluida** similar a una Single Page Application (SPA) [6, 7].

El proyecto está diseñado para gestionar [1, 8]:
*   **Audiciones (*Wildcards*):** Envío, listado y validación de audiciones a través de YouTube [8].
*   **Eventos y Entradas:** Publicación de eventos y gestión de compra de entradas (simulada) [8].
*   **Comunidad y Datos:** Módulos de estadísticas y un *Dashboard* administrativo para la gestión interna de la plataforma.

## 🚀 Stack Principal (Tecnologías)

La base del proyecto es una pila tecnológica moderna que prioriza la velocidad y el tipado estricto (TypeScript 99.6%) [9, 10].

| Categoría | Tecnología | Descripción / Uso |
| :--- | :--- | :--- |
| **Framework** | **Next.js (App Router)** | Base del proyecto, con soporte para **SSR/ISR** (Server-Side Rendering / Incremental Static Regeneration) [1, 11]. |
| **Lenguaje** | **TypeScript** | Utilizado para todo el código base [1, 9]. |
| **Estilos** | **TailwindCSS** | *Framework* CSS utilitario [1]. |
| **Base de Datos** | **PostgreSQL** | Se utiliza **Docker** en desarrollo local y **Neon (Vercel Postgres)** con *pooling* en producción [1]. |
| **ORM** | **Prisma ORM** | Capa de abstracción para la base de datos [1]. |
| **Autenticación** | **Auth.js (NextAuth)** | Implementado con **credentials provider (JWT)** y **bcrypt** para *hash* de contraseñas [1, 8]. |
| **Formularios** | **React Hook Form + Yup** | Manejo de estados de formularios y validación de esquemas [1]. |
| **Animaciones** | **Framer Motion** | Biblioteca para animaciones en la interfaz [1]. |

## 📁 Estructura Arquitectónica Relevante

El proyecto sigue las convenciones del **App Router** de Next.js para definir rutas basadas en el sistema de archivos [12, 13]:

*   `app/api/auth/[...nextauth]/route.ts`: Configuración de NextAuth (JWT + credentials) [14].
*   `app/api/.../route.ts`: Rutas de API específicas que se ejecutan en el *Node runtime* del servidor (ej., `register/route.ts`, `compra-entradas/route.ts`) [14].
*   `lib/prisma.ts`: Implementación del *singleton* de `PrismaClient` [14].
*   `prisma/schema.prisma`: Definición del esquema de la base de datos [14].
*   `middleware.ts`: Archivo utilizado para la gestión de acceso y seguridad de rutas, especialmente para el *dashboard*.

## ⚙️ Requisitos para Desarrollo Local

Asegúrese de tener instalados los siguientes componentes antes de iniciar la configuración [15]:

*   **Node.js ≥ 18.18** (Se recomienda la versión LTS 20) [15-17].
*   **Docker** (Necesario para levantar el contenedor de PostgreSQL local) [15].
*   **npm** (Se recomienda `npm ci`) [15].

## 🧪 Configuración Local (Paso a Paso)

Siga estas instrucciones detalladas para configurar y ejecutar el servidor de desarrollo.

### 1. Clonación e Instalación de Dependencias

```bash
git clone https://github.com/ayrtoncatri/beatbox-chile-web.git
cd beatbox-chile-web
npm ci # Instalación limpia de dependencias (recomendado)
2. Configuración de la Base de Datos Local (PostgreSQL)
Levante el contenedor de PostgreSQL utilizando Docker Compose:
# Levanta el contenedor de PostgreSQL en segundo plano
docker compose up -d

# Verifica que el contenedor esté corriendo (Status: Up/healthy)
docker compose ps
3. Variables de Entorno
Cree un archivo llamado .env en la raíz del proyecto y pegue la siguiente configuración. Las variables de Google son opcionales y están preparadas para la integración futura de OAuth.
Variable
Descripción
Ejemplo Local (Dev)
DATABASE_URL
URL de conexión de Prisma a la base de datos PostgreSQL local.
postgresql://beatbox:beatbox@localhost:5432/beatbox?schema=public
NEXTAUTH_URL
URL base de la aplicación para callbacks de autenticación.
http://localhost:3000
NEXTAUTH_SECRET
Cadena aleatoria utilizada por Auth.js para firmar y encriptar los JWT.
[Genere y use una cadena compleja]
GOOGLE_CLIENT_ID
ID del cliente de Google para autenticación OAuth.
[Su ID de Google]
GOOGLE_CLIENT_SECRET
Secreto del cliente de Google para autenticación OAuth.
[Su Secreto de Google]
4. Configuración y Migración de Prisma
Ejecute los comandos de Prisma para generar el cliente y aplicar las migraciones a la base de datos:
# 1. Genera el cliente de Prisma (necesario para interactuar con la DB)
npx prisma generate

# 2. Aplica las migraciones (crea las tablas definidas en schema.prisma)
npx prisma migrate dev -n init_postgres

# (Opcional) Inicia Prisma Studio para inspeccionar los datos:
npx prisma studio
5. Levantar el Servidor de Desarrollo
Inicie el servidor de desarrollo de Next.js en el modo estándar:
npm run dev
La aplicación estará disponible en su navegador en la siguiente dirección:
http://localhost:3000