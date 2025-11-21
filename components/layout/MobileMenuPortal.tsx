"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface MobileMenuPortalProps {
  children: ReactNode;
}

export function MobileMenuPortal({ children }: MobileMenuPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Evitamos hidratar antes de que exista document.body
  if (!mounted) return null;

  return createPortal(children, document.body);
}
