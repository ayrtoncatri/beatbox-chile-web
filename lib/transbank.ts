// lib/transbank.ts
import {
  WebpayPlus,
  Environment,
  Options,
} from 'transbank-sdk';

// --- (INICIO DE LA LÓGICA CORRECTA) ---
// 1. Revisamos si queremos FORZAR el modo Integración
const forceIntegration = process.env.FORCE_WEBPAY_INTEGRATION === 'true';

// 2. Determinamos el entorno: Si 'forceIntegration' es true, SIEMPRE será Integración.
//    Si no, usamos la lógica normal basada en NODE_ENV.
const environment =
  forceIntegration || process.env.NODE_ENV !== 'production'
    ? Environment.Integration
    : Environment.Production;
// --- (FIN DE LA LÓGICA CORRECTA) ---


// 3. LEER las credenciales SIEMPRE desde variables de entorno
const commerceCode = process.env.WEBPAY_PLUS_COMMERCE_CODE;
const apiKey = process.env.WEBPAY_PLUS_API_KEY;

// 4. Validar que las variables existan
if (!commerceCode) {
  throw new Error('WEBPAY_PLUS_COMMERCE_CODE no está definida');
}
if (!apiKey) {
  throw new Error('WEBPAY_PLUS_API_KEY no está definida');
}

console.log(
  `[Transbank SDK] Inicializado en modo: ${
    environment === Environment.Production ? 'Producción' : 'Integración'
  } ${forceIntegration ? '(Forzado)' : ''}`, // <-- Log mejorado
);
console.log(`[Transbank SDK] Usando Commerce Code: ${commerceCode.substring(0, 4)}...`);


// 5. Instanciar el SDK (con 'new Options')
export const tx = new WebpayPlus.Transaction(
  new Options(commerceCode, apiKey, environment),
);

// 6. Exportar la URL de retorno
export const webpayReturnUrl =
  process.env.WEBPAY_RETURN_URL || 'http://localhost:3000/compra/resultado';