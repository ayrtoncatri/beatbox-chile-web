# Instructivo operativo de cumplimiento - Ley 21.719

Empresa: Beatbox Chile ([COMPLETAR razon social], [COMPLETAR RUT])
Version: 1.0
Fecha: 2026-08-22

## A. Derechos del titular (acceso, rectificacion, supresion, oposicion, portabilidad, bloqueo)
Plazo legal: 30 dias corridos, prorrogable una sola vez por 30 dias corridos adicionales.

1. Recepcion y registro
- Registrar solicitud, fecha, identidad declarada, canal y derecho solicitado.
- Abrir ticket interno en el canal de privacidad.

2. Verificacion de identidad
- Si el titular tiene cuenta, validar sesion autenticada.
- Si no tiene cuenta, pedir verificacion por correo y antecedentes minimos.

3. Ejecucion segun derecho
- Acceso/portabilidad: entregar copia en JSON o CSV.
- Rectificacion: actualizar dato inexacto.
- Supresion: eliminar o anonimizar, salvo obligacion legal de conservacion.
- Oposicion: detener tratamiento para la finalidad impugnada.
- Bloqueo: suspender temporalmente el tratamiento en disputa.

4. Respuesta
- Responder por escrito en plazo legal.
- Guardar evidencia del cumplimiento y fecha de cierre.

## B. Brecha de seguridad de datos personales
Plazo legal: notificar a la Agencia sin dilaciones indebidas.

1. Contencion inmediata (0-4h)
- Aislar componente afectado.
- Revocar/rotar credenciales involucradas.
- Iniciar bitacora de incidente.

2. Evaluacion (4-24h)
- Categoria de datos comprometidos.
- Volumen estimado de titulares.
- Riesgo para titulares (alto/no alto).

3. Notificaciones
- Agencia: naturaleza, impacto, medidas, contacto.
- Titulares: cuando exista riesgo alto o cuando afecte datos sensibles, economicos/financieros/bancarios o de NNA.

4. Cierre
- Causa raiz, remediacion, acciones preventivas.
- Registrar el incidente en el registro de vulneraciones.

## C. Fiscalizacion de la Agencia
1. Designar un unico punto de contacto.
2. Reunir inmediatamente:
- RAT
- Evidencia de consentimiento
- Politica de privacidad
- DPA y anexos de transferencia
- Registro de vulneraciones
3. Responder dentro de plazo por cada requerimiento.

## D. Cambios en producto o proveedores
1. Actualizar RAT y matriz de licitud.
2. Re-evaluar necesidad de EIPD.
3. Actualizar politica de privacidad y consentimientos.
4. Re-correr auditoria de compliance.

## E. Calendario minimo
- Mensual: revisar canal de derechos y tickets abiertos.
- Trimestral: revisar retenciones y minimizacion.
- Semestral: simulacro de incidente.
- Anual: revision integral documental y tecnica.

## E.1 Retencion tecnica diaria
1. Vercel ejecuta `POST /api/internal/data-retention` con `CRON_SECRET` a las 04:00 UTC.
2. Revisar `DataRetentionRun` despues del primer despliegue y ante cada alerta del proveedor.
3. El job solo elimina tokens vencidos, enrolamientos MFA abandonados y recovery codes usados.
4. No eliminar compras, perfiles, sugerencias o historial competitivo mediante este job sin actualizar la matriz de retencion y su fundamento legal.

## F. Verificacion operativa del canal de derechos
1. Solicitud autenticada
- Enviar POST a /api/privacy/rights con right y detail.
- Verificar creacion de ticket [PRIVACY_RIGHT] en los registros internos.

2. Solicitud sin sesion
- Enviar POST a /api/privacy/rights con right, detail, name y email.
- Verificar recepcion en canal de mensajes con prefijo [PRIVACY_RIGHT].

3. Portabilidad
- Ejecutar GET a /api/privacy/export con sesion valida.
- Verificar respuesta JSON con datos del titular.
- Verificar registro de auditoria [PRIVACY_EXPORT] PORTABILIDAD.

4. Evidencia minima por solicitud
- requestedAt
- ip
- userAgent
- estado de atencion

---
DISCLAIMER: Este documento no constituye asesoria legal. Es un instrumento tecnico de cumplimiento basado en Ley 21.719 y debe ser validado por el responsable del tratamiento y, de ser necesario, por asesoria juridica especializada.
