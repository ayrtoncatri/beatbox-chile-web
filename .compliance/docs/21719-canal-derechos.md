# Canal de ejercicio de derechos - Beatbox Chile

Fecha: 2026-08-22
Canal principal: `/privacidad/derechos` (formulario) y API `/api/privacy/rights`
Canal admin: `/admin/privacidad`
Canal alternativo: privacidad@[COMPLETAR dominio]
Portabilidad autenticada: `GET /api/privacy/export`

## Ejecucion tecnica
- `PATCH /api/admin/privacy/requests/{id}` con `action: FULFILL` ejecuta el derecho (acceso/portabilidad/rectificacion/supresion/bloqueo/oposicion/revocacion) via `lib/privacy/fulfill-request.ts`.
- La supresion anonimiza PII y conserva compras/evidencias con causal documentada en el mapa PII.

Actualizacion de implementacion: 2026-08-21

## Derechos cubiertos
- Acceso
- Rectificacion
- Supresion
- Oposicion
- Portabilidad
- Bloqueo
- Revocacion del consentimiento

## Procedimiento operativo
1. Recepcion
- Registrar solicitud y tipo de derecho.
- Verificar identidad del titular.
- Las solicitudes autenticadas se crean en estado `IN_PROGRESS`; las solicitudes sin sesion quedan en `IDENTITY_PENDING` y no se ejecutan hasta verificar identidad.

2. Plazo
- Respuesta en 30 dias corridos.
- Prorroga unica por 30 dias corridos adicionales con aviso fundado.
- El sistema calcula el vencimiento inicial y permite una unica prorroga tecnica hasta 60 dias desde la recepcion. La fundamentacion y comunicacion al titular siguen siendo responsabilidad operativa.

3. Ejecucion por tipo
- Acceso: entrega de datos en formato legible.
- Portabilidad: entrega estructurada JSON/CSV.
- Rectificacion: correccion de datos inexactos.
- Supresion: eliminacion/anonimizacion salvo obligacion legal.
- Oposicion: cese para finalidad impugnada.
- Bloqueo: suspension temporal del tratamiento.

4. Cierre
- Notificar resultado al titular.
- Guardar evidencia de cumplimiento.
- El cierre requiere resolucion documentada; un rechazo exige motivo fundado. Ambos se registran en `PrivacyRequest` y generan un evento en `AuditLog`.

## Implementacion tecnica actual
- `POST /api/privacy/rights` recibe solicitudes autenticadas o no autenticadas.
- `GET /api/privacy/rights` permite al titular autenticado consultar sus solicitudes.
- `GET /api/admin/privacy/requests` lista solicitudes para administradores autorizados.
- `PATCH /api/admin/privacy/requests/{id}` permite verificar identidad, prorrogar, completar o rechazar una solicitud. El endpoint no ejecuta supresion, rectificacion ni bloqueo automatico de datos de negocio.
- Las rutas usan los modelos `PrivacyRequest` y `AuditLog`, por lo que se activaran en la base de datos con la migracion final `add_privacy_governance`.

## Gratuidad
Rectificacion, supresion y oposicion son gratuitas. Acceso gratuito al menos una vez por trimestre.

---
DISCLAIMER: Este documento no constituye asesoria legal. Es un borrador tecnico basado en Ley 21.719 y debe validarse juridicamente.
