# Politica de backups y restauracion

Fecha: 2026-08-22
Control: `sec-backups`

## Alcance

Datos de la aplicacion Beatbox Chile almacenados en PostgreSQL de produccion y artefactos de despliegue en Vercel.

## Responsables

- Operacion tecnica: equipo de desarrollo / DevOps del proyecto.
- Responsable de datos: [COMPLETAR nombre/cargo].

## Politica

1. **Frecuencia:** backups automaticos del proveedor de BD (diario como minimo; PITR si el plan lo incluye).
2. **Retencion del backup:** segun plan del proveedor (documentar dias exactos al fijar proveedor). Default operativo propuesto: >= 7 dias.
3. **Cifrado:** backups cifrados en reposo por el proveedor.
4. **Prueba de restauracion:** al menos **trimestral** en staging; registrar fecha y resultado en este archivo o en el registro de vulneraciones si falla.
5. **Relacion con derecho de supresion:** la anonimizacion en produccion no reescribe backups historicos; los datos eliminados/anonimizados desaparecen del entorno vivo y de backups al rotar el plazo de retencion del snapshot.

## Procedimiento de restauracion (resumen)

1. Congelar writes no esenciales.
2. Restaurar snapshot al entorno de staging primero.
3. Validar integridad (conteo usuarios, compras recientes, migraciones).
4. Solo entonces restaurar produccion si el incidente lo exige.
5. Registrar incidente en `21719-registro-vulneraciones.md` si aplica brecha.

## Evidencia pendiente de completar en operacion

- [ ] Nombre del proveedor BD de produccion
- [ ] RPO / RTO acordados
- [ ] Fecha de ultima prueba de restore: [COMPLETAR]
- [ ] Resultado: [COMPLETAR]

---
DISCLAIMER: Documento tecnico; no constituye asesoria legal.
