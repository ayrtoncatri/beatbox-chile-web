// lib/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extiende el objeto Session para incluir tus campos personalizados
   */
  interface Session {
    user: {
      id: string;
      isActive: boolean;
      nombres: string | null;
      apellidoPaterno: string | null;
      apellidoMaterno: string | null;
      roles: string[]; // Array de roles
    } & DefaultSession["user"]; // Mantiene email, name, image
  }

  /**
   * Extiende el objeto User (el que viene de authorize)
   */
  interface User extends DefaultUser {
    isActive: boolean;
    nombres: string | null;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
    roles: string[];
  }
}

declare module "next-auth/jwt" {
  /**
   * Extiende el Token JWT
   */
  interface JWT extends DefaultJWT {
    isActive: boolean;
    nombres: string | null;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
    roles: string[];
  }
}