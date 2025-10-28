// lib/mercadopago.ts
import { MercadoPagoConfig, Preference } from 'mercadopago';

// 1. Validar que el Access Token exista
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!accessToken) {
  throw new Error(
    'MERCADOPAGO_ACCESS_TOKEN no está definida en las variables de entorno',
  );
}

// 2. Inicializar el cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: accessToken,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc', 
  },
});

console.log('[Mercado Pago SDK] Inicializado.');

// 3. Exportar el cliente y la clase 'Preference' para usarla
export const mpClient = client;
export const mpPreference = new Preference(client);

