# Politica operativa de cookies - Beatbox Chile

Fecha: 2026-08-23
Control: `data-consent-text` + `data-info` (identificadores en linea)

## Fundamento
La Ley 21.719 no crea un regimen especial de cookies. Un identificador (cookie, pixel, embed) que permite identificar a una persona es dato personal (Art. 2). El tratamiento no esencial requiere consentimiento Art. 12.

## Inventario
Ver texto publico en `/privacidad/cookies` (`lib/cookies-policy.ts`).

## Implementacion
- Default: no cargar YouTube en paginas publicas.
- Banner no bloqueante, dos acciones equivalentes (solo necesarias / aceptar YouTube).
- Facade: thumbnail local hasta opt-in (no se pide img.youtube.com antes).
- Juez/admin: bypass porque el video es objeto del encargo.

## Revocacion
Banner, `/privacidad/cookies` (gestionar), o derecho de oposicion alcance COOKIES.
