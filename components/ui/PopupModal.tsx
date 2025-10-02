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
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold"
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