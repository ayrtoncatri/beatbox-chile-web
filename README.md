🇨🇱 Beatbox Chile — Plataforma Comunitaria
📝 Descripción del Proyecto
Beatbox Chile es una plataforma web full-stack moderna creada para servir como el centro digital de la comunidad de Beatbox en Chile.
La aplicación está construida utilizando Next.js con el App Router, lo que nos permite implementar una arquitectura monolítica. Esto significa que la lógica de backend (rutas de API y conexión a base de datos) reside en el servidor, garantizando alto rendimiento mediante Server-Side Rendering (SSR) y una navegación fluida similar a una Single Page Application (SPA).
El proyecto está diseñado para gestionar:
• Audiciones (Wildcards): Envío y validación de audiciones de YouTube.
• Eventos y Entradas: Publicación de eventos y compra simulada de entradas (General / VIP).
• Gestión Interna: Incluye un Dashboard para la administración de usuarios, wildcards, eventos y transacciones [Conversación anterior].
🚀 Stack Principal (Tecnologías)
El proyecto se basa en una pila de tecnologías optimizada, aprovechando la potencia del ecosistema Next.js:
Categoría
Tecnología
Descripción / Uso
Framework
Next.js (App Router)
Soporte para SSR/ISR y React Server Components.
Lenguaje
TypeScript
Lenguaje principal (99.6%) para garantizar tipado estricto.
Estilos
TailwindCSS
Framework CSS utilitario.
Base de Datos
PostgreSQL
Base de datos relacional. Se utiliza Docker en desarrollo local y Neon (Vercel Postgres) en producción.
ORM
Prisma ORM
Capa de abstracción para la base de datos.
Autenticación
Auth.js (NextAuth)
Implementado con el credentials provider y JWT. Utiliza bcrypt para el hashing de contraseñas.
Formularios
React Hook Form + Yup
Manejo de formularios y validación de esquemas.
Animaciones
Framer Motion
Biblioteca para animaciones en la interfaz.
📁 Estructura Arquitectónica Relevante
El proyecto utiliza el sistema de enrutado basado en el sistema de archivos (File System Routing) de Next.js:
• app/api/.../route.ts: Rutas de API que se ejecutan en el Node runtime del servidor, manejando lógica de negocio como registro de usuarios y creación de compras.
• app/(...)/page.tsx: Componentes de página (rutas públicas y layouts anidados).
• lib/prisma.ts: Implementación del singleton de PrismaClient.
• prisma/schema.prisma: Definición del esquema de la base de datos.
• middleware.ts: Archivo utilizado para la gestión de acceso y seguridad de rutas, especialmente para el dashboard.
⚙️ Requisitos para Desarrollo Local
Para iniciar el proyecto en su entorno local, se requiere:
• Node.js ≥ 18.18 (Se recomienda la versión LTS 20).
• Docker (Para levantar el contenedor de PostgreSQL local).
• npm (Se recomienda npm ci).
🧪 Configuración Local (Paso a Paso)
Siga estas instrucciones detalladas para configurar y ejecutar el servidor de desarrollo:
1. Clonación e Instalación de Dependencias
git clone https://github.com/ayrtoncatri/beatbox-chile-web.git
cd beatbox-chile-web
npm ci # Instalación limpia de dependencias
2. Configuración de la Base de Datos Local (PostgreSQL)
Levante el contenedor de PostgreSQL utilizando Docker Compose. Este contenedor se mapea a la DATABASE_URL local definida más adelante:
# Levanta el contenedor de PostgreSQL en segundo plano
docker compose up -d

# Verifica que el contenedor esté corriendo
docker compose ps
3. Variables de Entorno
Cree un archivo llamado .env en la raíz del proyecto y pegue las siguientes variables. Estas son críticas para la conexión a la base de datos y la funcionalidad de autenticación (Auth.js):
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
Cadena aleatoria utilizada por Auth.js para firmar y encriptar los JWT (JSON Web Tokens).
[Genere y use una cadena compleja]
GOOGLE_CLIENT_ID
ID del cliente de Google para autenticación OAuth (Preparado para implementación futura).
[Su ID de Google]
GOOGLE_CLIENT_SECRET
Secreto del cliente de Google para autenticación OAuth (Preparado para implementación futura).
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
Una vez configurada la base de datos y las variables de entorno, inicie el servidor de desarrollo de Next.js:
npm run dev
La aplicación estará disponible en su navegador en la siguiente dirección:
http://localhost:3000