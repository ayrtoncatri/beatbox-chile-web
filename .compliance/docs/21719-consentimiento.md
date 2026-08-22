# Consentimiento y avisos de captura - Beatbox Chile

Fecha: 2026-08-22

Actualizacion de implementacion: 2026-08-21

## 1. Aviso corto para formularios
Texto recomendado junto al punto de captura:

Tus datos personales seran tratados por Beatbox Chile para gestionar tu cuenta y/o la finalidad especifica del formulario. Puedes ejercer tus derechos de acceso, rectificacion, supresion, oposicion, portabilidad y bloqueo por el canal de privacidad. Revisa el detalle en nuestra Politica de Privacidad.

## 2. Consentimiento principal (casilla no premarcada)
[ ] Acepto el tratamiento de mis datos personales para la finalidad indicada en este formulario, conforme a la Politica de Privacidad de Beatbox Chile.

## 3. Consentimiento de marketing (separado y opcional)
[ ] Quiero recibir novedades y comunicaciones de Beatbox Chile por correo.

## 4. Datos sensibles (si aplica)
Cuando exista tratamiento de datos sensibles, debe agregarse consentimiento expreso y especifico:
[ ] Autorizo expresamente el tratamiento de [dato sensible] para [finalidad], segun la Politica de Privacidad.

## 5. Revocacion
La revocacion del consentimiento debe estar disponible por medio expedito, gratuito y permanente.

## 6. Evidencia de consentimiento
Debe guardarse evidencia por titular:
- texto aceptado,
- timestamp,
- IP o identificador tecnico equivalente,
- version de la politica/aviso vigente.

## 7. Implementacion actual
El registro por credenciales exige una casilla no premarcada para el aviso de privacidad y presenta una casilla independiente, no obligatoria y desmarcada para comunicaciones comerciales.

La API rechaza el registro si no recibe la aceptacion obligatoria y, junto con el usuario, persiste en `PrivacyConsent`:
- categoria (`NECESSARY` o `MARKETING`),
- version y hash SHA-256 del aviso vigente,
- fecha de otorgamiento,
- metodo de captura,
- IP y user-agent cuando estan disponibles.

La categoria `NECESSARY` acredita la aceptacion del aviso para el alta de cuenta; no reemplaza la base de licitud de ejecucion de contrato indicada en la politica.

## 8. Revocacion de marketing
El titular autenticado puede revocar sus consentimientos `MARKETING` desde `/perfil`. La accion marca los consentimientos activos con `revokedAt`, no altera el consentimiento necesario para su cuenta y deja un evento `MARKETING_CONSENT_REVOKED` en `AuditLog`.

## 9. Registro mediante Google OAuth
Los accesos mediante Google pasan primero por `/auth/google-consent`. El endpoint de consentimiento emite una cookie HTTP-only, firmada con `NEXTAUTH_SECRET`, de un solo proposito y con vigencia de diez minutos.

El callback de Google no crea cuentas nuevas si esa evidencia no es valida. Si es valida, crea la cuenta y los consentimientos `NECESSARY` y, cuando corresponde, `MARKETING`, en la misma operacion atomica. La evidencia incluye version/hash del aviso, fecha, metodo `google_oauth_registration`, IP y user-agent cuando estan disponibles.

Pendiente antes de produccion: publicar la politica con los datos corporativos completos.

---
DISCLAIMER: Este documento no constituye asesoria legal. Es un borrador tecnico basado en Ley 21.719 y debe validarse juridicamente antes de su implementacion final.
