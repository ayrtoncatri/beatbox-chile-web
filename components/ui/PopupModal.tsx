"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

type PopupModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function PopupModal({ open, onClose, children }: PopupModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg border border-blue-700/30 rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
              <button
                className="absolute top-3 right-3 text-blue-300 hover:text-blue-100 font-bold text-xl"
                onClick={onClose}
                aria-label="Cerrar"
                type="button"
              >
                ×
              </button>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}