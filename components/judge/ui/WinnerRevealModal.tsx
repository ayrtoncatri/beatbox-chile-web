'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, XMarkIcon } from '@heroicons/react/24/solid';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface WinnerRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  winnerName: string;
}

export function WinnerRevealModal({ isOpen, onClose, winnerName }: WinnerRevealModalProps) {
  
  // Efecto de Confeti al abrir
  useEffect(() => {
    if (isOpen) {
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ['#d946ef', '#0ea5e9', '#ffffff']; // Fuchsia, Sky, White

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          
          {/* 1. Backdrop Oscuro y Borroso */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          {/* 2. Tarjeta del Ganador (Estilo Urbano) */}
          <motion.div
            initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
            animate={{ 
              scale: 1, 
              rotate: 0, 
              opacity: 1,
              transition: { type: "spring", stiffness: 300, damping: 15 }
            }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="relative w-full max-w-md"
          >
            
            {/* Decoración de fondo (Mancha de pintura/Glow) */}
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600 to-blue-600 blur-3xl opacity-50 rounded-full animate-pulse" />

            {/* Contenedor Principal */}
            <div className="relative bg-[#0a0a0f] border-2 border-white/10 p-8 rounded-3xl shadow-2xl overflow-hidden transform -skew-y-2">
              
              {/* Lineas decorativas */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500" />
              <div className="absolute bottom-0 right-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-fuchsia-500" />

              <div className="flex flex-col items-center text-center space-y-6 transform skew-y-2">
                
                {/* Icono Trofeo Animado */}
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.4)]"
                >
                  <TrophyIcon className="w-12 h-12 text-black" />
                </motion.div>

                <div>
                  <motion.h3 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-blue-300 font-black tracking-[0.3em] uppercase text-sm mb-2"
                  >
                    El ganador es
                  </motion.h3>
                  
                  {/* NOMBRE DEL GANADOR */}
                  <motion.h2 
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-fuchsia-200 to-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] italic"
                  >
                    {winnerName}
                  </motion.h2>
                </div>

                {/* Botón de Cierre */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="mt-4 px-8 py-3 bg-white text-black font-black uppercase tracking-wider rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  Continuar <XMarkIcon className="w-5 h-5" />
                </motion.button>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}