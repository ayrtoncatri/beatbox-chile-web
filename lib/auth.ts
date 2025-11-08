import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { 
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas en segundos (expiración fija)
    updateAge: 8 * 60 * 60, // Mismo valor que maxAge para evitar renovación automática
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 horas en segundos (expiración fija del JWT)
  },
  pages: { signIn: "/auth/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        // Incluye profile y roles
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            profile: true,
            roles: {
              include: {
                role: {
                  select: { name: true },
                },
              },
            },
          },
        });

        if (!user) return null;
        if (!user?.password) return null;
        if (user.isActive === false) return null;

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        const roles = user.roles.map((r) => r.role.name);

        return {
          id: user.id,
          email: user.email,
          image: user.image ?? null,
          isActive: user.isActive,
          nombres: user.profile?.nombres ?? null,
          apellidoPaterno: user.profile?.apellidoPaterno ?? null,
          apellidoMaterno: user.profile?.apellidoMaterno ?? null,
          roles: roles.length > 0 ? roles : ["user"],
        } as any;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existing = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existing) {
          if (existing.isActive === false) return false;
        } else {
          // --- INICIO DE CORRECCIÓN DE NOMBRES DE GOOGLE ---
          let nombres = "";
          let apellidoPaterno = "";
          let apellidoMaterno = "";

          if (user.name) {
            const partes = user.name.trim().split(" ");
            if (partes.length === 1) {
              // Ej: "Ayrton"
              nombres = partes[0];
            } else if (partes.length === 2) {
              // Ej: "Ayrton Catri"
              nombres = partes[0];
              apellidoPaterno = partes[1];
            } else if (partes.length === 3) {
              // Ej: "Ayrton David Catri"
              nombres = partes.slice(0, 2).join(" "); // "Ayrton David"
              apellidoPaterno = partes[2]; // "Catri"
            } else {
              // Ej: "Ayrton David Catri Pizarro" (4 o más)
              nombres = partes.slice(0, 2).join(" "); // "Ayrton David"
              apellidoPaterno = partes[2]; // "Catri"
              apellidoMaterno = partes.slice(3).join(" "); // "Pizarro"
            }
          }
          // --- FIN DE CORRECCIÓN DE NOMBRES DE GOOGLE ---

          try {
            const defaultUserRole = await prisma.role.findUnique({
              where: { name: "user" },
            });
            if (!defaultUserRole) {
              console.error("Rol 'user' no encontrado en la BD.");
              return false;
            }

            await prisma.user.create({
              data: {
                email: user.email!,
                image: user.image ?? null,
                isActive: true,
                profile: {
                  create: {
                    nombres, // Nombre corregido
                    apellidoPaterno, // Apellido corregido
                    apellidoMaterno, // Apellido corregido
                  },
                },
                roles: {
                  create: {
                    roleId: defaultUserRole.id,
                  },
                },
              },
            });
          } catch (error) {
            console.error("Error al crear usuario de Google:", error);
            return false;
          }
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      // El objeto 'user' solo existe en el login inicial.
      // Después de eso, necesitamos consultar la BD para hidratar el token
      // con los datos de nuestro schema (roles y profile).

      if (!token.email) {
        return token; 
      }

      // 1. Consultar la BD en CADA llamada JWT
      //    (Esto es necesario para OAuth y para reflejar cambios de rol inmediatos)
      const dbUser = await prisma.user.findUnique({
        where: { email: token.email as string },
        include: {
          profile: true,
          roles: {
            include: {
              role: { select: { name: true } },
            },
          },
        },
      });

      if (!dbUser) {
        // Si el usuario fue eliminado de la BD, invalidar el token
        return { ...token, error: "UserNotFound" };
      }

      // 2. Mapear roles a un array de strings
      const roles = dbUser.roles.map((r) => r.role.name);

      // 3. Hidratar el token con los datos FRESCOS de la BD
      return {
        ...token, // Mantener datos base del token (email, iat, exp, etc.)
        sub: dbUser.id,
        isActive: dbUser.isActive,
        image: dbUser.image ?? null,
        nombres: dbUser.profile?.nombres ?? null,
        apellidoPaterno: dbUser.profile?.apellidoPaterno ?? null,
        apellidoMaterno: dbUser.profile?.apellidoMaterno ?? null,
        roles: roles.length > 0 ? roles : ["user"], // Array de roles
      };
    },

    async session({ session, token }) {
      
      if (session.user) {
        session.user.id = token.sub!;
        session.user.image = token.image as string | null;
        
        // Agregar campos personalizados
        (session.user as any).isActive = token.isActive;
        (session.user as any).nombres = token.nombres;
        (session.user as any).apellidoPaterno = token.apellidoPaterno;
        (session.user as any).apellidoMaterno = token.apellidoMaterno;
        (session.user as any).roles = token.roles;
      }

      return session;
    },
  },
};
