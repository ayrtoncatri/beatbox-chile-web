# Operacion de MFA privilegiado - Beatbox Chile

Fecha: 2026-08-22
Alcance: roles `admin` y `judge`.

## Auditoria
Los siguientes eventos se registran en `AuditLog` sin secretos ni codigos de un solo uso:
- inicio de enrolamiento MFA;
- activacion de MFA;
- desafio MFA aprobado, identificando solo si se uso TOTP o codigo de recuperacion.

Estos eventos se habilitan junto con la migracion final de privacidad.

## Objetivo
Exigir un segundo factor TOTP para acceder a rutas administrativas y de jueces, sin modificar los flujos de negocio de la plataforma.

## Componentes implementados
- Modelo `User`: `totpSecretEncrypted`, `totpEnabled`, `totpConfirmedAt`.
- Modelo `MfaRecoveryCode`: codigos de recuperacion hasheados y de un solo uso.
- Cifrado AES-256-GCM para secreto TOTP en [lib/mfa.ts](lib/mfa.ts).
- Cookie HTTP-only firmada para acreditar segundo factor durante 8 horas.
- Rate limit de cinco intentos cada cinco minutos por usuario/IP en el desafio MFA.
- Middleware de proteccion para `/admin`, `/api/admin`, `/judge` y `/api/judge`.

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
5. La confirmacion emite de inmediato una cookie MFA firmada, por lo que la persona puede volver a la ruta protegida sin quedar en un bucle de redireccion.
6. La cookie MFA expira en ocho horas; despues debe completar `/auth/mfa/challenge` nuevamente.

## Recuperacion
- Cada codigo de recuperacion se guarda como hash bcrypt y se invalida al usarse.
- Si se pierden aplicacion y codigos, un administrador autorizado debe deshabilitar MFA mediante un procedimiento interno documentado, verificar identidad del titular y dejar evidencia de la accion.

## Evidencia para auditoria
- Migracion Prisma: `prisma/migrations/20260822021324_add_privileged_mfa/migration.sql`.
- APIs: `app/api/auth/mfa/setup`, `confirm` y `challenge`.
- Proteccion de rutas: `middleware.ts`.
- Dependencias: `otplib`, `qrcode`, `rate-limiter-flexible` y `@types/qrcode`.

## Prueba operativa minima
1. Configurar ambas variables de entorno.
2. Iniciar sesion con cuenta admin o judge.
3. Abrir `/admin` o `/judge/dashboard`: debe redirigir a setup.
4. Enrolar TOTP, confirmar codigo y guardar recovery codes.
5. Volver a ruta protegida: debe solicitar challenge.
6. Ingresar un TOTP valido: debe permitir acceso.
7. Repetir con un recovery code y verificar que no pueda reutilizarse.

---
DISCLAIMER: Este documento no constituye asesoria legal. Es un runbook tecnico de seguridad para apoyar el cumplimiento de la Ley 21.719.
