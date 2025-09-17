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
      credentials: { email: { }, password: { } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user?.password) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        return { 
          id: user.id, 
          email: user.email, 
          name: user.nombres, 
          role: (user as any).role ?? "user", 
          image: user.image ?? null,
          nombres: user.nombres ?? null,
          apellidoPaterno: user.apellidoPaterno ?? null,
          apellidoMaterno: user.apellidoMaterno ?? null,
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
        if (!existing) {
          let nombres = user.name ?? "";
          let apellidoPaterno = "";
          let apellidoMaterno = "";
          if (nombres) {
            const partes = nombres.split(" ");
            nombres = partes.slice(0, -2).join(" ") || partes[0] || "";
            apellidoPaterno = partes[partes.length - 2] || "";
            apellidoMaterno = partes[partes.length - 1] || "";
          }
          await prisma.user.create({
            data: {
              email: user.email!,
              nombres,
              apellidoPaterno,
              apellidoMaterno,
              image: user.image ?? null,
              role: "user",
              // comuna, region, edad quedan null y puedes pedirlos luego
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) { 
      if (account?.provider === "google" || (!token.nombres && token.email)) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email as string } });
        if (dbUser) {
          token.sub = dbUser.id;
          token.nombres = dbUser.nombres ?? null;
          token.apellidoPaterno = dbUser.apellidoPaterno ?? null;
          token.apellidoMaterno = dbUser.apellidoMaterno ?? null;
          token.role = dbUser.role ?? "user";
          token.image = dbUser.image ?? null;
        }
      }

      if (user) {
        token.sub = (user as any).id;
        token.role = (user as any).role ?? "user";
        token.nombres = (user as any).nombres ?? null;
        token.apellidoPaterno = (user as any).apellidoPaterno ?? null;
        token.apellidoMaterno = (user as any).apellidoMaterno ?? null;
        token.image = (user as any).image ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { 
        (session.user as any).id = token.sub; 
        (session.user as any).role = (token as any).role ?? "user"; 
        (session.user as any).nombres = (token as any).nombres ?? null;
        (session.user as any).apellidoPaterno = (token as any).apellidoPaterno ?? null;
        (session.user as any).apellidoMaterno = (token as any).apellidoMaterno ?? null;
      }
      return session;
    },
  },
};
