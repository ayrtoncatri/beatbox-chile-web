// lib/transbank.ts
import {
  WebpayPlus,
  Environment,
  Options,
} from 'transbank-sdk';

// --- (INICIO DE LA LÓGICA DE FORZADO) ---
// 1. Revisamos si queremos FORZAR el modo Integración
//    Leemos la variable de entorno 'FORCE_WEBPAY_INTEGRATION'.
//    Solo será 'true' si la variable existe y su valor es exactamente "true".
const forceIntegration = process.env.FORCE_WEBPAY_INTEGRATION === 'true';

// 2. Determinamos el entorno:
//    - Si 'forceIntegration' es true, SIEMPRE será Integración.
//    - Si no, usamos la lógica normal: Integración si NODE_ENV NO es 'production',
//      y Producción si NODE_ENV SÍ es 'production'.
const environment =
  forceIntegration || process.env.NODE_ENV !== 'production'
    ? Environment.Integration
    : Environment.Production;
// --- (FIN DE LA LÓGICA DE FORZADO) ---


// 3. LEEMOS las credenciales SIEMPRE desde variables de entorno
//    (Estas serán las claves de prueba que configuraste en Vercel)
const commerceCode = process.env.WEBPAY_PLUS_COMMERCE_CODE;
const apiKey = process.env.WEBPAY_PLUS_API_KEY;

// 4. Validamos que las variables de credenciales existan
if (!commerceCode) {
  throw new Error('WEBPAY_PLUS_COMMERCE_CODE no está definida en las variables de entorno');
}
if (!apiKey) {
  throw new Error('WEBPAY_PLUS_API_KEY no está definida en las variables de entorno');
}

// 5. Log MEJORADO para saber qué modo se está usando y si fue forzado
console.log(
  `[Transbank SDK] Inicializado en modo: ${
    environment === Environment.Production ? 'Producción' : 'Integración'
  } ${forceIntegration ? '(Forzado)' : ''}` // Indica si se forzó el modo
);
console.log(`[Transbank SDK] Usando Commerce Code: ${commerceCode.substring(0, 4)}...`);


// 6. Instanciamos el SDK con 'new Options', pasándole el 'environment' determinado
export const tx = new WebpayPlus.Transaction(
  new Options(commerceCode, apiKey, environment),
);

// 7. Exportamos la URL de retorno (leída desde el entorno)
export const webpayReturnUrl =
  process.env.WEBPAY_RETURN_URL || 'http://localhost:3000/compra/resultado';