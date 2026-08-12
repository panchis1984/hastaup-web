'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import EventImageGallery from '@/components/EventImageGallery';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [whatsappMessage, setWhatsappMessage] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchEventDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${id}`);
        if (!res.ok) throw new Error('Evento no encontrado');
        const data = await res.json();
        setEvent(data);

        const dateStr = new Date(data.date).toLocaleDateString('es-AR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        setWhatsappMessage(
          `Hola, estoy interesado en recibir más información sobre el evento "${data.title}" (${data.category}) programado para el ${dateStr} a las ${data.time} hs en ${data.location}.`
        );
      } catch (error) {
        console.error('Error al cargar el evento', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();
  }, [id]);

  const handleWhatsAppRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneNumber = '5493435201231';
    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center text-gray-400 text-sm">
        Cargando detalles del evento...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="text-2xl font-bold text-gray-900">Evento no encontrado</h1>
        <p className="text-gray-500 text-sm">El evento que buscas ya no está disponible o la URL es incorrecta.</p>
        <Link href="/eventos" className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">
          Volver a Eventos
        </Link>
      </div>
    );
  }

  const galleryImages: string[] = Array.isArray(event.images) ? event.images : [];

  const formattedDate = new Date(event.date).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="min-h-screen bg-yellow-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Botón Volver */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-red-600 mb-6 transition-colors"
        >
          ← Volver a eventos
        </button>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Columna Izquierda: Galería + Detalles */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">

              {/* Galería de imágenes */}
              <div className="relative">
                <EventImageGallery
                  coverImage={event.imageUrl}
                  images={galleryImages}
                  title={event.title}
                />
                <span className="absolute top-4 left-4 z-10 bg-red-600/90 backdrop-blur-sm text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
                  {event.category}
                </span>
              </div>

              <div className="p-6 sm:p-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
                  {event.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                  <span className="flex items-center gap-1.5 font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    📍 {event.location}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 capitalize">
                    🗓️ {formattedDate}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    ⏰ {event.time?.includes('hs') ? event.time : `${event.time} hs`}
                  </span>
                </div>

                {/* Descripción Extensa */}
                {event.description && (
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Información y Detalles</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {event.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Consulta WhatsApp */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Consultar por WhatsApp</h3>
              <p className="text-xs text-gray-500 mb-6">Envía una consulta directa sobre este evento o subasta.</p>

              <form onSubmit={handleWhatsAppRedirect} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Mensaje de consulta</label>
                  <textarea
                    required
                    rows={5}
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:outline-none text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white font-medium py-3 rounded-xl hover:bg-green-700 transition-colors text-sm shadow-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  Consultar por WhatsApp
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
