/**
 * Mapa declarativo PII — Ley 21.719
 * Cada columna personal debe clasificarse. Agregar columna nueva sin clasificar = gap de cumplimiento.
 */

export type PiiAction = "export" | "anonymize" | "retain" | "structural" | "secret";

export type PiiField = {
  model: string;
  field: string;
  action: PiiAction;
  /** Reemplazo al anonimizar; null = set null */
  anonymizeTo?: string | null;
  /** Cita legal cuando action === retain */
  retainCitation?: string;
  note?: string;
};

export const RETAIN_TAX_CITATION =
  "Obligacion de conservacion tributaria (Codigo Tributario art. 17 inc. 2 y art. 200) — [verificar contra fuente oficial descargada]";

export const PRIVACY_DATA_MAP: PiiField[] = [
  // User
  { model: "User", field: "id", action: "structural" },
  { model: "User", field: "email", action: "anonymize", anonymizeTo: null, note: "Se reemplaza por email sintetico unico" },
  { model: "User", field: "name", action: "anonymize", anonymizeTo: null },
  { model: "User", field: "password", action: "secret", note: "Nunca exportar; se anula en supresion" },
  { model: "User", field: "image", action: "anonymize", anonymizeTo: null },
  { model: "User", field: "isActive", action: "structural" },
  { model: "User", field: "processingBlockedAt", action: "structural" },
  { model: "User", field: "anonymizedAt", action: "structural" },
  { model: "User", field: "totpSecretEncrypted", action: "secret" },
  { model: "User", field: "totpEnabled", action: "structural" },
  { model: "User", field: "totpConfirmedAt", action: "structural" },
  { model: "User", field: "createdAt", action: "export" },
  { model: "User", field: "updatedAt", action: "export" },

  // UserProfile
  { model: "UserProfile", field: "userId", action: "structural" },
  { model: "UserProfile", field: "nombres", action: "anonymize", anonymizeTo: null },
  { model: "UserProfile", field: "apellidoPaterno", action: "anonymize", anonymizeTo: null },
  { model: "UserProfile", field: "apellidoMaterno", action: "anonymize", anonymizeTo: null },
  { model: "UserProfile", field: "birthDate", action: "anonymize", anonymizeTo: null },
  { model: "UserProfile", field: "parentalGuardianName", action: "anonymize", anonymizeTo: null },
  { model: "UserProfile", field: "parentalConsentAt", action: "structural" },
  { model: "UserProfile", field: "comunaId", action: "anonymize", anonymizeTo: null },

  // Compra — se retienen montos/estado por obligacion tributaria; se desvincula PII del usuario
  { model: "Compra", field: "id", action: "retain", retainCitation: RETAIN_TAX_CITATION },
  { model: "Compra", field: "userId", action: "retain", retainCitation: RETAIN_TAX_CITATION, note: "Se conserva FK; el User queda anonimizado" },
  { model: "Compra", field: "total", action: "retain", retainCitation: RETAIN_TAX_CITATION },
  { model: "Compra", field: "status", action: "retain", retainCitation: RETAIN_TAX_CITATION },
  { model: "Compra", field: "createdAt", action: "retain", retainCitation: RETAIN_TAX_CITATION },

  // CompraItem
  { model: "CompraItem", field: "quantity", action: "retain", retainCitation: RETAIN_TAX_CITATION },
  { model: "CompraItem", field: "unitPrice", action: "retain", retainCitation: RETAIN_TAX_CITATION },
  { model: "CompraItem", field: "subtotal", action: "retain", retainCitation: RETAIN_TAX_CITATION },

  // Wildcard — nombre artistico puede ser seudonimo publico; se anonimiza PII de contacto
  { model: "Wildcard", field: "id", action: "structural" },
  { model: "Wildcard", field: "youtubeUrl", action: "anonymize", anonymizeTo: null },
  { model: "Wildcard", field: "nombreArtistico", action: "anonymize", anonymizeTo: "ANONIMIZADO" },
  { model: "Wildcard", field: "notes", action: "anonymize", anonymizeTo: null },
  { model: "Wildcard", field: "status", action: "structural" },

  { model: "Inscripcion", field: "id", action: "structural" },
  { model: "Inscripcion", field: "nombreArtistico", action: "anonymize", anonymizeTo: "ANONIMIZADO" },
  { model: "Inscripcion", field: "source", action: "structural" },
  { model: "Inscripcion", field: "eventoId", action: "structural" },
  { model: "Inscripcion", field: "categoriaId", action: "structural" },

  { model: "Puntaje", field: "id", action: "structural" },
  { model: "Puntaje", field: "puntos", action: "structural", note: "Historial competitivo agregado; sin PII directa" },
  { model: "Puntaje", field: "detalle", action: "anonymize", anonymizeTo: null },

  { model: "Score", field: "id", action: "structural" },
  { model: "Score", field: "totalScore", action: "structural" },
  { model: "Score", field: "notes", action: "anonymize", anonymizeTo: null },
  { model: "Score", field: "status", action: "structural" },

  { model: "Battle", field: "id", action: "structural", note: "Se conservan IDs; el User queda anonimizado" },
  { model: "Battle", field: "phase", action: "structural" },
  { model: "Battle", field: "orderInRound", action: "structural" },

  // Sugerencia / Mensaje
  { model: "Sugerencia", field: "nombre", action: "anonymize", anonymizeTo: null },
  { model: "Sugerencia", field: "email", action: "anonymize", anonymizeTo: null },
  { model: "Sugerencia", field: "asunto", action: "anonymize", anonymizeTo: null },
  { model: "Sugerencia", field: "mensaje", action: "anonymize", anonymizeTo: "[contenido anonimizado]" },
  { model: "Sugerencia", field: "notaPrivada", action: "anonymize", anonymizeTo: null },
  { model: "Mensaje", field: "nombre", action: "anonymize", anonymizeTo: "ANONIMIZADO" },
  { model: "Mensaje", field: "email", action: "anonymize", anonymizeTo: "anonimizado@invalid.local" },
  { model: "Mensaje", field: "mensaje", action: "anonymize", anonymizeTo: "[contenido anonimizado]" },

  // PrivacyConsent — evidencia de consentimiento: se conserva estructura, se limpia IP/UA
  { model: "PrivacyConsent", field: "email", action: "anonymize", anonymizeTo: null },
  { model: "PrivacyConsent", field: "ip", action: "anonymize", anonymizeTo: null },
  { model: "PrivacyConsent", field: "userAgent", action: "anonymize", anonymizeTo: null },
  { model: "PrivacyConsent", field: "policyVersion", action: "retain", retainCitation: "Carga de la prueba del consentimiento (Art. 12 Ley 21.719)" },
  { model: "PrivacyConsent", field: "policyHash", action: "retain", retainCitation: "Carga de la prueba del consentimiento (Art. 12 Ley 21.719)" },
  { model: "PrivacyConsent", field: "givenAt", action: "retain", retainCitation: "Carga de la prueba del consentimiento (Art. 12 Ley 21.719)" },

  // PrivacyRequest — evidencia del ejercicio del derecho
  { model: "PrivacyRequest", field: "email", action: "retain", retainCitation: "Evidencia de atencion de derechos (Art. 14 ter)" },
  { model: "PrivacyRequest", field: "detail", action: "retain", retainCitation: "Evidencia de atencion de derechos (Art. 14 ter)" },
  { model: "PrivacyRequest", field: "ip", action: "anonymize", anonymizeTo: null },
  { model: "PrivacyRequest", field: "userAgent", action: "anonymize", anonymizeTo: null },
];

export function fieldsForModel(model: string): PiiField[] {
  return PRIVACY_DATA_MAP.filter((f) => f.model === model);
}

export function retainReasonsForSuppression(): string[] {
  return [
    ...new Set(
      PRIVACY_DATA_MAP.filter((f) => f.action === "retain" && f.retainCitation).map(
        (f) => f.retainCitation as string,
      ),
    ),
  ];
}
