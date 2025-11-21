// app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/AuthProvider';
import ToastProvider from '@/components/ToastProvider';
import Mascota from '@/components/mascota/Mascota';

export const metadata: Metadata = {
  title: 'Beatbox Chile',
  description: 'Comunidad oficial de Beatbox en Chile',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      {/* 1. CLASE DEL BODY LIMPIA: 
        Quitamos el "bg-gradient-to-b..." 
        Mantenemos "min-h-screen flex flex-col" que es clave para el sticky footer.
      */}
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <ToastProvider>
            <Header />
            <Mascota />
            
            {/* 2. MAIN CON FLEX-GROW: 
              Esto hace que el <main> ocupe todo el espacio disponible,
              empujando el <Footer> al fondo de la página.
            */}
            <main className="flex-grow">{children}</main>
            
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}