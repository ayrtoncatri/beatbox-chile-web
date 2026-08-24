export const COOKIE_POLICY_VERSION = "2026-08-23";

export const COOKIE_POLICY_SECTIONS = [
  {
    title: "1. Por que existe esta politica",
    paragraphs: [
      "Chile no tiene una ley especial de cookies tipo ePrivacy. Si una cookie u otro identificador permite identificar a una persona (por ejemplo, junto con la IP), es dato personal y aplica la Ley 21.719 (Art. 2 y Art. 12).",
      "Las cookies estrictamente necesarias se tratan por ejecucion de contrato o interes legitimo de seguridad (Art. 13). Las de terceros no esenciales, como reproducir YouTube, se tratan solo con consentimiento previo, libre, especifico e inequivoco (Art. 12).",
    ],
  },
  {
    title: "2. Cookies estrictamente necesarias",
    paragraphs: [
      "Sesion de autenticacion (NextAuth): identifica tu cuenta mientras navegas. HttpOnly, SameSite=Lax.",
      "Evidencia de consentimiento Google OAuth: cookie de un solo proposito y 10 minutos, para no crear cuentas sin aviso de privacidad.",
      "Sesion MFA: segundo factor en rutas de administracion y jueces.",
      "Preferencia de cookies (beatbox_cookie_consent): recuerda si autorizaste o no contenidos de terceros. Vigencia 12 meses.",
      "Estas cookies no se usan para publicidad y no requieren casilla extra: sin ellas la cuenta, el pago y la seguridad no funcionan.",
    ],
  },
  {
    title: "3. Terceros (opt-in)",
    paragraphs: [
      "YouTube / Google: al reproducir una wildcard publica se carga un iframe de youtube-nocookie.com. Google puede tratar IP, identificadores tecnicos y datos del video. Es transferencia internacional. Por defecto NO se carga hasta que aceptas.",
      "Google OAuth: solo si eliges «Continuar con Google». No se carga el SDK de Google en todas las paginas.",
      "Cloudinary: entrega imagenes editoriales del sitio (logo, banners). No usamos su widget para subir fotos de perfil en este flujo.",
      "Instagram: enlace estatico en el pie; no incrustamos su SDK.",
    ],
  },
  {
    title: "4. Jueces y administracion",
    paragraphs: [
      "En paneles de juez y admin, ver el video forma parte de la ejecucion del encargo (evaluar wildcards). Ahi se usa el patron facade (clic para cargar) con youtube-nocookie, sin bloquear la labor del jurado.",
    ],
  },
  {
    title: "5. Conservacion y revocacion",
    paragraphs: [
      "La preferencia de cookies se guarda 12 meses o hasta que la cambies. Puedes revocarla en este banner, en /privacidad/cookies o ejerciendo oposicion/revocacion en /privacidad/derechos.",
      "Revocar no borra la cuenta ni las compras; solo deja de cargar YouTube en paginas publicas.",
    ],
  },
] as const;
