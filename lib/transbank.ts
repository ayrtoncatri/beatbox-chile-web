import {
  WebpayPlus,
  Environment,
  Options,
} from 'transbank-sdk';

// 1. Determinar el entorno (Integration si es 'development', Production si es 'production')
const environment =
  process.env.NODE_ENV === 'production'
    ? Environment.Production
    : Environment.Integration;

// 2. LEER las credenciales SIEMPRE desde variables de entorno
// (Leerá las de .env.local en 'dev' y las de Vercel en 'prod')
const commerceCode = process.env.WEBPAY_PLUS_COMMERCE_CODE;
const apiKey = process.env.WEBPAY_PLUS_API_KEY;

// 3. Validar que las variables existan (Buena práctica)
if (!commerceCode) {
  throw new Error('WEBPAY_PLUS_COMMERCE_CODE no está definida en las variables de entorno');
}
if (!apiKey) {
  throw new Error('WEBPAY_PLUS_API_KEY no está definida en las variables de entorno');
}

console.log(
  `[Transbank SDK] Inicializado en modo: ${
    environment === Environment.Production ? 'Producción' : 'Integración'
  }`,
);
console.log(`[Transbank SDK] Usando Commerce Code: ${commerceCode.substring(0, 4)}...`);


// 4. Instanciar el SDK (con 'new Options' para v6.1.0)
export const tx = new WebpayPlus.Transaction(
  new Options(commerceCode, apiKey, environment),
);

// 5. Exportar la URL de retorno (también desde .env)
export const webpayReturnUrl =
  process.env.WEBPAY_RETURN_URL || 'http://localhost:3000/compra/resultado';