'use client';

import EventForm from "@/components/admin/eventos/EventForm";

export default function NuevoEventoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-2 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Nuevo evento</h1>
        <EventForm mode="create" />
      </div>
    </main>
  );
}