'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CatalogContent() {
  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';
  const typeParam = searchParams.get('type') || 'Todos';

  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de los filtros de la vista
  const [searchTerm, setSearchTerm] = useState(searchKeyword);
  const [selectedType, setSelectedType] = useState(typeParam);
  const [maxPrice, setMaxPrice] = useState('');

  // Estado del dropdown personalizado
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const TYPE_OPTIONS = ['Todos', 'Venta', 'Alquiler'];

  // Cargar propiedades al montar el componente
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`);
        const data = await res.json();
        setProperties(data);
        setFilteredProperties(data);
      } catch (error) {
        console.error('Error al cargar propiedades', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Sincronizar si cambian los parámetros de la URL
  useEffect(() => {
    setSearchTerm(searchKeyword);
    setSelectedType(typeParam);
  }, [searchKeyword, typeParam]);

  // Aplicar filtros cada vez que cambie algún criterio
  useEffect(() => {
    let result = properties;

    // Filtrar por texto (ubicación o título)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (prop: any) =>
          prop.title?.toLowerCase().includes(term) ||
          prop.location?.toLowerCase().includes(term)
      );
    }

    // Filtrar por tipo (Venta / Alquiler)
    if (selectedType && selectedType !== 'Todos') {
      result = result.filter((prop: any) => prop.type === selectedType);
    }

    // Filtrar por precio máximo
    if (maxPrice) {
      const priceLimit = Number(maxPrice);
      result = result.filter((prop: any) => prop.price <= priceLimit);
    }

    setFilteredProperties(result);
  }, [searchTerm, selectedType, maxPrice, properties]);

  return (
    <main className="min-h-screen bg-yellow-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Cabecera */}
        <div>
          <h1 className="text-3xl font-extrabold text-red-600">Catálogo de Inmuebles</h1>
          <p className="text-gray-500 text-sm mt-1">Encuentra la propiedad que estás buscando.</p>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Buscar por ubicación o título</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ej. Paraná..."
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none text-sm bg-gray-50"
            />
          </div>

          {/* ── Custom Dropdown: Tipo de Operación ── */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Operación</label>
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none text-sm bg-gray-50 flex items-center justify-between text-left"
            >
              <span>{selectedType}</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <ul className="absolute z-20 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {TYPE_OPTIONS.map((option) => (
                  <li key={option}>
                    <button
                      type="button"
                      onMouseDown={() => {
                        setSelectedType(option);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                        ${selectedType === option
                          ? 'bg-red-600 text-white font-semibold'
                          : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                        }`}
                    >
                      {option}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Precio Máximo ($)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Ej. 150000"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none text-sm bg-gray-50"
            />
          </div>
        </div>

        {/* Listado de Propiedades */}
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Cargando catálogo...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((prop: any) => (
              <Link key={prop.id} href={`/inmuebles/${prop.id}`} className="group block">
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                    <img
                      src={prop.imageUrl}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                      {prop.type}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors truncate">
                      {prop.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">{prop.location}</p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-extrabold text-gray-950">
                        ${prop.price?.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-3 text-gray-500 text-sm">
                        <span>{prop.details?.bedrooms || 0} habs</span>
                        <span>•</span>
                        <span>{prop.details?.bathrooms || 0} baños</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredProperties.length === 0 && (
          <div className="bg-white p-12 rounded-2xl text-center text-gray-400 border border-gray-100 text-sm">
            No se encontraron propiedades que coincidan con tu búsqueda.
          </div>
        )}

      </div>
    </main>
  );
}

// Envuelto en Suspense requerido por Next.js al usar useSearchParams en Client Components
export default function PropertiesCatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-yellow-50 flex items-center justify-center text-gray-400 text-sm">Cargando...</div>}>
      <CatalogContent />
    </Suspense>
  );
}