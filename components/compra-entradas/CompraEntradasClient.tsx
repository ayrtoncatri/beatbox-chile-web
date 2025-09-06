'use client';

import { useState } from "react";
import EventosDisponibles, { EventoDTO } from "./EventosDisponibles";
import FormularioCompraEntradas from "./FormularioCompraEntradas";

export default function CompraEntradasClient() {
  const [evento, setEvento] = useState<EventoDTO | null>(null);

  return (
    <>
      <EventosDisponibles onSelect={setEvento} selectedId={evento?.id} />
      <FormularioCompraEntradas eventoSeleccionado={evento} />
    </>
  );
}
