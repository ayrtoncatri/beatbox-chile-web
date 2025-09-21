import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      role?: string;
      nombres?: string | null;
      apellidoPaterno?: string | null;
      apellidoMaterno?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    nombres?: string | null;
    apellidoPaterno?: string | null;
    apellidoMaterno?: string | null;
  }
}