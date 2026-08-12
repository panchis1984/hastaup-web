'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import EventCard from '@/components/EventCard';

function EventsCatalogContent() {
  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'Todas';

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(searchKeyword);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const CATEGORY_OPTIONS = ['Todas', 'Subasta', 'Charla', 'Capacitación', 'Exhibición', 'Evento'];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`);
        if (!res.ok) throw new Error('Error al cargar eventos');
        const data = await res.json();
        setEvents(data);
        setFilteredEvents(data);
      } catch (error) {
        console.error('Error al cargar eventos', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    setSearchTerm(searchKeyword);
    setSelectedCategory(categoryParam);
  }, [searchKeyword, categoryParam]);

  useEffect(() => {
    let result = events;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (ev: any) =>
          ev.title?.toLowerCase().includes(term) ||
          ev.location?.toLowerCase().includes(term) ||
          ev.description?.toLowerCase().includes(term)
      );
    }

    if (selectedCategory && selectedCategory !== 'Todas') {
      result = result.filter((ev: any) => ev.category === selectedCategory);
    }

    setFilteredEvents(result);
  }, [searchTerm, selectedCategory, events]);

  return (
    <main className="min-h-screen bg-yellow-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Cabecera */}
        <div>
          <h1 className="text-3xl font-extrabold text-red-600">Eventos y Subastas</h1>
          <p className="text-gray-500 text-sm mt-1">
            Descubre las próximas subastas, remates, charlas y eventos de interés inmobiliario.
          </p>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Buscar por título, ubicación o contenido</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ej. Subasta Paraná..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none text-sm bg-gray-50"
            />
          </div>

          {/* Custom Dropdown: Categoría */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">Categoría de Evento</label>
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none text-sm bg-gray-50 flex items-center justify-between text-left"
            >
              <span>{selectedCategory === 'Todas' ? 'Todas las categorías' : selectedCategory}</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <ul className="absolute z-20 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {CATEGORY_OPTIONS.map((option) => (
                  <li key={option}>
                    <button
                      type="button"
                      onMouseDown={() => {
                        setSelectedCategory(option);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                        ${selectedCategory === option
                          ? 'bg-red-600 text-white font-semibold'
                          : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                        }`}
                    >
                      {option === 'Todas' ? 'Todas las categorías' : option}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Listado de Eventos */}
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Cargando eventos...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event: any) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                location={event.location}
                date={event.date}
                time={event.time}
                imageUrl={event.imageUrl}
                category={event.category}
              />
            ))}
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="bg-white p-12 rounded-2xl text-center text-gray-400 border border-gray-100 text-sm">
            No se encontraron eventos o subastas que coincidan con tu búsqueda.
          </div>
        )}

      </div>
    </main>
  );
}

export default function EventsCatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-yellow-50 flex items-center justify-center text-gray-400 text-sm">Cargando eventos...</div>}>
      <EventsCatalogContent />
    </Suspense>
  );
}
