"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  necessaryOnlyConsent,
  readBrowserCookieConsent,
  thirdPartyConsent,
  writeBrowserCookieConsent,
  type CookieConsentState,
} from "@/lib/cookie-consent";

type CookieConsentContextValue = {
  ready: boolean;
  showBanner: boolean;
  thirdPartyAllowed: boolean;
  allowThirdParty: () => void;
  allowNecessaryOnly: () => void;
  openPreferences: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

async function persistConsent(thirdParty: boolean) {
  try {
    await fetch("/api/privacy/cookies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thirdParty }),
    });
  } catch {
    // La preferencia local ya quedo escrita; el persistido en servidor es refuerzo.
  }
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [consent, setConsent] = useState<CookieConsentState | null>(null);

  useEffect(() => {
    const local = readBrowserCookieConsent();
    if (local) {
      setConsent(local);
      setShowBanner(false);
    } else {
      setConsent(necessaryOnlyConsent());
      setShowBanner(true);
    }
    setReady(true);

    void fetch("/api/privacy/cookies")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { thirdParty?: boolean } | null) => {
        if (typeof data?.thirdParty !== "boolean") return;
        if (data.thirdParty) {
          const next = thirdPartyConsent();
          writeBrowserCookieConsent(next);
          setConsent(next);
        } else if (local?.thirdParty) {
          const next = necessaryOnlyConsent();
          writeBrowserCookieConsent(next);
          setConsent(next);
        }
      })
      .catch(() => undefined);
  }, []);

  const allowThirdParty = useCallback(() => {
    const next = thirdPartyConsent();
    writeBrowserCookieConsent(next);
    setConsent(next);
    setShowBanner(false);
    void persistConsent(true);
  }, []);

  const allowNecessaryOnly = useCallback(() => {
    const next = necessaryOnlyConsent();
    writeBrowserCookieConsent(next);
    setConsent(next);
    setShowBanner(false);
    void persistConsent(false);
  }, []);

  const openPreferences = useCallback(() => {
    setShowBanner(true);
  }, []);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      ready,
      showBanner,
      thirdPartyAllowed: consent?.thirdParty === true,
      allowThirdParty,
      allowNecessaryOnly,
      openPreferences,
    }),
    [allowNecessaryOnly, allowThirdParty, consent?.thirdParty, openPreferences, ready, showBanner],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    return {
      ready: true,
      showBanner: false,
      thirdPartyAllowed: false,
      allowThirdParty: () => undefined,
      allowNecessaryOnly: () => undefined,
      openPreferences: () => undefined,
    } satisfies CookieConsentContextValue;
  }
  return context;
}
