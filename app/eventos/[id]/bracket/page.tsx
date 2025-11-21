import { notFound } from 'next/navigation';
import { getPublicEventBracket } from '@/app/actions/public-data';
import { EventBracket } from '@/components/public/EventBracket';
import { getEventDetails } from '@/app/actions/public-data';



export default async function EventBracketPage({
  params,
}: {
  params: { id: string };
}) {

  const resolvedParams = await params;
  // 3. Llamamos al "motor" en el servidor para obtener los datos
  const bracketData = await getPublicEventBracket(resolvedParams.id);
  
  // (Opcional: Carga los detalles del evento para el título)
  const eventData = await getEventDetails(resolvedParams.id);
  const eventName = eventData?.nombre || 'Bracket del Evento';

  // 4. Manejo de errores: Si la data es nula (o el evento no existe)
  //    mostramos la página 404 de Next.js.
  if (!bracketData) {
    notFound();
  }

  // 5. Renderizamos la página
  return (
    <main
      className="
        min-h-screen w-full text-white
        
        /*          * Aplicamos los fondos apilados: 
         * 1. El gradiente oscuro
         * 2. La imagen del muro
         * (Usamos _ en lugar de espacios para Tailwind)
        */
        [background-image:radial-gradient(ellipse_at_center,_rgba(10,15,26,0.4)_0%,_rgba(10,10,10,1)_70%),_url('https://res.cloudinary.com/dfd1byvwn/image/upload/v1763744752/new-banner-bbx_ymgg2x.webp')]
        
        /*          * Aplicamos 'cover' a AMBAS imágenes (gradiente e imagen)
        */
        [background-size:cover,_cover]
        
        /*          * No repetimos NINGUNA
        */
        [background-repeat:no-repeat,_no-repeat]
        
        /*          * Centramos AMBAS
        */
        [background-position:center_center,_center_center]
        
        /*          * El fondo se queda fijo
        */
        [background-attachment:fixed]
      "
    >
      {/* 2. (MODIFICADO) Este es tu DIV original.
           Ahora solo se encarga del layout (centrado y padding).
           Le quitamos el 'text-white' porque ya lo tiene el padre.
      */}
      <div className="container mx-auto px-4 py-12">
        {/* Títulos */}
        <h1 className="text-4xl font-bold text-center mb-4 text-[#D6160F] text-shadow-red">
          {eventName}
        </h1>
        <h2 className="text-2xl text-purple-400 text-center mb-12 font-semibold">
          Llaves de Batalla
        </h2>

        <EventBracket 
          initialData={bracketData} 
          eventoId={resolvedParams.id}      
        />
      </div>
    </main>
  );
}