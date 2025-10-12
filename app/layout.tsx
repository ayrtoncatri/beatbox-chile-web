import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import Mascota from "@/components/mascota/Mascota";

export const metadata: Metadata = {
  title: "Beatbox Chile",
  description: "Comunidad oficial de Beatbox en Chile",
  icons:{
    icon: '/ISOTIPO-DEGRADADO.png'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gradient-to-b from-black via-blue-950 to-neutral-900 min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <Mascota />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
