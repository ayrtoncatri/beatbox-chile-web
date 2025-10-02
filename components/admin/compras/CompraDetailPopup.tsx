import { CompraEntrada } from "@prisma/client";

type Props = {
  compra: CompraEntrada & {
    userNombre: string;
    userEmail: string;
    eventoNombre: string;
    eventoFecha: Date;
  };
};

export default function CompraDetailPopup({ compra }: Props) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Detalle de compra</h2>
      <div className="mb-2 text-sm">
        <b>ID:</b> {compra.id}
      </div>
      <div className="mb-2 text-sm">
        <b>Fecha compra:</b> {new Date(compra.createdAt).toLocaleString()}
      </div>
      <div className="mb-2 text-sm">
        <b>Evento:</b> {compra.eventoNombre} ({new Date(compra.eventoFecha).toLocaleString()})
      </div>
      <div className="mb-2 text-sm">
        <b>Comprador:</b> {compra.userNombre} — {compra.userEmail}
      </div>
      <div className="mb-2 text-sm">
        <b>Tipo:</b> {compra.tipoEntrada}
      </div>
      <div className="mb-2 text-sm">
        <b>Cantidad:</b> {compra.cantidad}
      </div>
      <div className="mb-2 text-sm">
        <b>Precio unitario:</b> ${compra.precioUnitario.toLocaleString()}
      </div>
      <div className="mb-2 text-sm">
        <b>Total:</b> ${compra.total.toLocaleString()}
      </div>
    </div>
  );
}