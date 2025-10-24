type CompraDetailProps = {
  compra: {
    id: string;
    createdAt: string | Date;
    total: number;
    status: string;
    user: {
      email: string;
      profile?: {
        nombres?: string | null;
        apellidoPaterno?: string | null;
        apellidoMaterno?: string | null;
        comuna?: {
          name?: string;
          region?: { name?: string };
        } | null;
      };
    };
    evento?: {
      nombre?: string;
      fecha?: string | Date;
      tipo?: { name?: string };
      venue?: { name?: string };
    };
    items: {
      id: string;
      ticketType: { name: string; price: number };
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[];
  };
};

export default function CompraDetailPopup({ compra }: CompraDetailProps) {
  const nombreCompleto = compra.user.profile
    ? [
        compra.user.profile.nombres,
        compra.user.profile.apellidoPaterno,
        compra.user.profile.apellidoMaterno,
      ].filter(Boolean).join(" ")
    : "";

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Detalle de compra</h2>
      <div className="mb-2 text-sm">
        <b>ID:</b> {compra.id}
      </div>
      <div className="mb-2 text-sm">
        <b>Fecha compra:</b> {new Date(compra.createdAt).toLocaleString("es-CL")}
      </div>
      <div className="mb-2 text-sm">
        <b>Evento:</b> {compra.evento?.nombre ?? "—"}{" "}
        {compra.evento?.fecha && (
          <>({new Date(compra.evento.fecha).toLocaleString("es-CL")})</>
        )}
      </div>
      <div className="mb-2 text-sm">
        <b>Comprador:</b> {nombreCompleto || "—"} — {compra.user.email}
      </div>
      <div className="mb-2 text-sm">
        <b>Comuna:</b> {compra.user.profile?.comuna?.name ?? "—"}{" "}
        <b>Región:</b> {compra.user.profile?.comuna?.region?.name ?? "—"}
      </div>
      <div className="mb-2 text-sm">
        <b>Estado:</b> {compra.status}
      </div>
      <div className="mb-2 text-sm">
        <b>Entradas:</b>
        <ul className="mt-2 space-y-2">
          {compra.items.map((item) => (
            <li key={item.id} className="border-b pb-2">
              <div>
                <b>Tipo:</b> {item.ticketType.name}
              </div>
              <div>
                <b>Cantidad:</b> {item.quantity}
              </div>
              <div>
                <b>Precio unitario:</b> ${item.unitPrice.toLocaleString("es-CL")}
              </div>
              <div>
                <b>Total:</b> ${item.subtotal.toLocaleString("es-CL")}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-2 text-sm">
        <b>Total compra:</b> ${compra.total.toLocaleString("es-CL")}
      </div>
    </div>
  );
}