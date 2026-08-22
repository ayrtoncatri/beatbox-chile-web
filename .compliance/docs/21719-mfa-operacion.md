# Operacion de MFA privilegiado - Beatbox Chile

Fecha: 2026-08-22
Alcance: roles `admin` y `judge`.

## Auditoria
Los siguientes eventos se registran en `AuditLog` sin secretos ni codigos de un solo uso:
- inicio de enrolamiento MFA;
- activacion de MFA;
- desafio MFA aprobado, identificando solo si se uso TOTP o codigo de recuperacion;
- intento fallido de activacion o de desafio, indicando si fue por codigo incorrecto
  (`invalid_code`) o por bloqueo del limite de intentos (`rate_limited`);
- deshabilitacion de MFA por el procedimiento de recuperacion, con el motivo registrado.

Estos eventos se habilitan junto con la migracion final de privacidad.

## Objetivo
Exigir un segundo factor TOTP para acceder a rutas administrativas y de jueces, sin modificar los flujos de negocio de la plataforma.

## Componentes implementados
- Modelo `User`: `totpSecretEncrypted`, `totpEnabled`, `totpConfirmedAt`.
- Modelo `MfaRecoveryCode`: codigos de recuperacion hasheados y de un solo uso.
- Cifrado AES-256-GCM para secreto TOTP en [lib/mfa.ts](lib/mfa.ts).
- Cookie HTTP-only firmada para acreditar segundo factor durante 8 horas.
- Rate limit de cinco intentos cada cinco minutos por usuario/IP en [lib/mfa-attempts.ts](lib/mfa-attempts.ts),
  compartido entre la activacion y el desafio para que ambos no sumen presupuestos separados.
- Middleware de proteccion para `/admin`, `/api/admin`, `/judge` y `/api/judge`.

La cookie firmada es la prueba del segundo factor: el middleware no puede consultar la
base de datos en el runtime edge, y el claim `mfaEnabled` del JWT queda desactualizado
cuando alguien se enrola con la sesion ya iniciada. Las paginas `/auth/mfa/*` si
consultan el estado real de enrolamiento antes de mostrarse.

## Variables de entorno obligatorias
- `MFA_ENCRYPTION_KEY`: 32 bytes codificados en base64. Generar con:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

- `MFA_SESSION_SECRET`: secreto para firmar la cookie MFA. Si se omite, se usa `NEXTAUTH_SECRET`; en produccion se recomienda definirlo de forma independiente.

Nunca rotar `MFA_ENCRYPTION_KEY` sin un plan de recifrado: los secretos TOTP existentes dependen de esa llave.

## Flujo de enrolamiento
1. Un admin o juez autenticado entra a una ruta protegida.
2. El middleware redirige a `/auth/mfa/setup` si MFA aun no esta habilitado.
3. La persona genera un QR, lo escanea en su aplicacion autenticadora y almacena los diez codigos de recuperacion.
4. Al ingresar un TOTP valido, el sistema activa MFA.
5. La confirmacion emite de inmediato la cookie MFA firmada y lleva a la ruta protegida
   sin pedir un segundo codigo, porque el factor ya quedo acreditado en ese mismo paso.
6. La cookie MFA expira en ocho horas; despues debe completar `/auth/mfa/challenge` nuevamente.

## Recuperacion
- Cada codigo de recuperacion se guarda como hash bcrypt y se invalida al usarse.
- Si se pierden aplicacion y codigos, un administrador autorizado verifica la identidad
  del titular y deshabilita MFA con:

```powershell
npm run mfa:reset -- persona@ejemplo.cl "motivo y forma de verificacion de identidad"
```

  El script borra el secreto TOTP y los codigos de recuperacion, y registra
  `MFA_DISABLED` en `AuditLog` con el motivo indicado. La persona vuelve a enrolarse en
  su siguiente acceso a una ruta privilegiada.
- Riesgo residual: la cookie MFA vigente de esa cuenta sigue siendo valida hasta que
  expire. Si el motivo del reset es sospecha de compromiso, desactiva ademas la cuenta
  (`isActive = false`) en vez de solo reiniciar el segundo factor.

## Evidencia para auditoria
- Migracion Prisma: `prisma/migrations/20260822021324_add_privileged_mfa/migration.sql`.
- APIs: `app/api/auth/mfa/setup`, `confirm` y `challenge`.
- Limite de intentos y registro de fallos: `lib/mfa-attempts.ts`.
- Proteccion de rutas: `middleware.ts` y el guard de `lib/permissions.ts`.
- Recuperacion: `prisma/scripts/mfa-reset.cts`.
- Dependencias: `otplib`, `qrcode`, `rate-limiter-flexible` y `@types/qrcode`.

## Prueba operativa minima
1. Configurar ambas variables de entorno.
2. Iniciar sesion con cuenta admin o judge.
3. Abrir `/admin` o `/judge/dashboard`: debe redirigir a setup.
4. Enrolar TOTP, confirmar codigo y guardar recovery codes.
5. Al confirmar debe entrar directamente a la ruta protegida, sin pedir otro codigo.
6. Cerrar la sesion MFA y volver a la ruta protegida: debe solicitar challenge.
7. Ingresar un TOTP valido: debe permitir acceso.
8. Repetir con un recovery code y verificar que no pueda reutilizarse.
9. Fallar el codigo hasta agotar el limite: debe responder 429 y quedar en `AuditLog`.

---
DISCLAIMER: Este documento no constituye asesoria legal. Es un runbook tecnico de seguridad para apoyar el cumplimiento de la Ley 21.719.
