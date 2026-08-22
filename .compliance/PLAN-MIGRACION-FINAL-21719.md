# Plan de migracion final - Ley 21.719

Estado: migracion final generada y aplicada localmente. Pendiente de revision y despliegue coordinado a produccion.
Objetivo: agrupar los cambios restantes de esquema en una sola migracion aditiva y revisable, sin borrar ni renombrar datos existentes.

## Cambios de esquema previstos

### 1. Consentimiento versionado
Modelo propuesto: `PrivacyConsent`.

Campos:
- `userId` opcional para consentimiento previo al registro.
- `email` opcional como identificador de contacto previo al registro.
- `category` para separar consentimiento necesario, marketing o sensible.
- `policyVersion` y `policyHash` para probar el texto exacto aceptado.
- `givenAt`, `revokedAt`, `method`, `ip`, `userAgent`.

Finalidad: acreditar consentimiento previo, informado, específico e inequívoco, y permitir revocación trazable.

### 2. Solicitudes de derechos del titular
Modelo propuesto: `PrivacyRequest`.

Campos:
- titular autenticado o contacto verificado;
- tipo de derecho;
- estado, fecha de recepción, vencimiento legal y posible prórroga;
- resolución, motivo fundado y fecha de cierre;
- trazabilidad mínima de IP y user-agent.

Finalidad: reemplazar el uso transitorio de mensajes/sugerencias por un flujo con SLA, responsable y evidencia legal propia.

### 3. Auditoría estructurada append-only
Modelo propuesto: `AuditLog`.

Campos:
- actor opcional, acción, recurso/tipo de recurso, identificador de recurso;
- resultado, IP, user-agent, metadata JSON y timestamp.

Finalidad: registrar operaciones de privacidad, cambios administrativos, MFA y ejecuciones de retención sin reutilizar tablas de comunicación.

## Cambios que NO se incluirán sin decisión corporativa

- Eliminación automatizada de compras, perfiles, sugerencias o historial competitivo.
- Cifrado de nuevos campos de negocio que no sean secretos MFA.
- Nuevas categorías de datos sensibles.

Estos requieren una matriz de retención aprobada y, cuando corresponda, fundamento legal específico.

## Orden de trabajo

1. Implementar consentimiento versionado y sus endpoints aislados. Terminado en codigo para credenciales, Google OAuth y revocacion de marketing; falta publicacion definitiva de la politica con datos corporativos completos.
2. Implementar dominio propio de solicitudes de derechos y migrar el endpoint existente a ese dominio. Terminado en codigo: falta probarlo tras la migracion y completar la operacion de identidad/notificacion.
3. Implementar `AuditLog` y registrar eventos de privacidad, MFA y retención. Terminado en codigo: falta probarlo tras la migracion y definir la retencion del log.
4. Revisar el esquema completo y generar una única migración aditiva: completado con `20260822032009_add_privacy_governance`.
5. Regenerar Prisma Client, ejecutar pruebas/tipos y actualizar `.compliance/`: completado localmente. `npx prisma migrate status` confirma cuatro migraciones aplicadas en la base local.
6. Preparar despliegue seguro a producción con respaldo, variables de entorno y `npx prisma migrate deploy`: pendiente.

## Garantía de seguridad de datos

La migración final planificada solo agregará tablas, campos opcionales, valores por defecto e índices. No debe incluir `DROP TABLE`, `DROP COLUMN`, conversiones destructivas ni reseteos de base de datos.

---
DISCLAIMER: Este documento no constituye asesoría legal. Es un plan técnico de implementación basado en Ley 21.719.
