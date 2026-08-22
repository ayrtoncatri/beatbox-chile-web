# Checklist DPA y transferencias internacionales

Fecha: 2026-08-22
Plantillas base: `21719-dpa.md`, `21719-anexo-transferencias.md`

## Proveedores / encargados detectados en codigo

| Proveedor | Rol | Pais / region (verificar) | Mecanismo | DPA firmado |
|---|---|---|---|---|
| Vercel | Hosting / edge | [VERIFICAR] | Clausulas modelo / DPA del proveedor | [ ] Pendiente |
| PostgreSQL managed (Neon/Supabase/RDS/otro) | BD | [VERIFICAR] | DPA del proveedor + cifrado en reposo | [ ] Pendiente |
| Resend | Correo transaccional | [VERIFICAR] | DPA + clausulas si hay transferencia | [ ] Pendiente |
| Google OAuth | Autenticacion | [VERIFICAR] | Terminos/DPA Google Cloud / Identity | [ ] Pendiente |
| Transbank | Pagos Chile | Chile | Contrato/encargado local | [ ] Pendiente |
| Mercado Pago | Pagos | [VERIFICAR] | DPA + mecanismo transferencia | [ ] Pendiente |
| Cloudinary (imagenes estaticas/CDN) | CDN media | [VERIFICAR] | DPA si trata PII en URLs/uploads | [ ] Pendiente |

## Pasos operativos

1. Completar pais/entidad real por proveedor.
2. Descargar DPA del proveedor o usar plantilla `21719-dpa.md`.
3. Adjuntar clausulas modelo Min. Economia cuando aplique transferencia internacional (`sources` de compliance-cl).
4. Archivar PDF firmado fuera del repo (drive interno) y marcar esta tabla.
5. Actualizar `21719-anexo-transferencias.md` y `state.json` (`data-dpa`, `data-transfer`).

## Estado de cumplimiento documental

- Plantillas generadas: SI
- Firmas reales: PENDIENTE (no bloquea el codigo; bloquea declarar evidencia contractual completa)

---
DISCLAIMER: No constituye asesoria legal.
