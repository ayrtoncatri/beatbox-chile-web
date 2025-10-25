import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
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
            roles: { include: { role: true } }
          }
        });
        if (!user?.password) return null;
        if (user.isActive === false) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        // Obtiene el primer rol (puedes adaptar para múltiples roles)
        const role = user.roles[0]?.role?.name ?? "user";
        return {
          id: user.id,
          email: user.email,
          role,
          image: user.image ?? null,
          nombres: user.profile?.nombres ?? null,
          apellidoPaterno: user.profile?.apellidoPaterno ?? null,
          apellidoMaterno: user.profile?.apellidoMaterno ?? null,
          isActive: user.isActive,
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
        const existing = await prisma.user.findUnique({ where: { email: user.email! } });
        if (existing) {
          if (existing.isActive === false) return false;
        } else {
          let nombres = user.name ?? "";
          let apellidoPaterno = "";
          let apellidoMaterno = "";
          if (nombres) {
            const partes = nombres.split(" ");
            nombres = partes.slice(0, -2).join(" ") || partes[0] || "";
            apellidoPaterno = partes[partes.length - 2] || "";
            apellidoMaterno = partes[partes.length - 1] || "";
          }
          // Crea User y UserProfile
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              image: user.image ?? null,
              isActive: true,
            },
          });
          await prisma.userProfile.create({
            data: {
              userId: newUser.id,
              nombres,
              apellidoPaterno,
              apellidoMaterno,
            },
          });
          // Asigna rol "user" por defecto
          const userRole = await prisma.role.findUnique({ where: { name: "user" } });
          if (userRole) {
            await prisma.userRole.create({
              data: { userId: newUser.id, roleId: userRole.id }
            });
          }
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Obtiene datos completos del usuario
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          include: {
            profile: true,
            roles: { include: { role: true } }
          }
        });
        if (dbUser) {
          token.sub = dbUser.id;
          token.nombres = dbUser.profile?.nombres ?? null;
          token.apellidoPaterno = dbUser.profile?.apellidoPaterno ?? null;
          token.apellidoMaterno = dbUser.profile?.apellidoMaterno ?? null;
          token.role = dbUser.roles[0]?.role?.name ?? "user";
          token.image = dbUser.image ?? null;
          token.isActive = dbUser.isActive;
        }
      }
      if (user) {
        token.sub = (user as any).id;
        token.role = (user as any).role ?? "user";
        token.nombres = (user as any).nombres ?? null;
        token.apellidoPaterno = (user as any).apellidoPaterno ?? null;
        token.apellidoMaterno = (user as any).apellidoMaterno ?? null;
        token.image = (user as any).image ?? null;
        token.isActive = (user as any).isActive ?? true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role ?? "user";
        (session.user as any).isActive = (token as any).isActive ?? true;
        (session.user as any).nombres = (token as any).nombres ?? null;
        (session.user as any).apellidoPaterno = (token as any).apellidoPaterno ?? null;
        (session.user as any).apellidoMaterno = (token as any).apellidoMaterno ?? null;
      }
      return session;
    },
  },
};
