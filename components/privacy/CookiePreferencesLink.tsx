"use client";

import { useCookieConsent } from "@/components/privacy/CookieConsentProvider";

export default function CookiePreferencesLink() {
  const { openPreferences } = useCookieConsent();

  return (
    <button
      type="button"
      onClick={openPreferences}
      className="underline-offset-2 hover:text-cyan-200 hover:underline"
    >
      Gestionar cookies
    </button>
  );
}
