'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedType, setSelectedType] = useState('Todos');
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar las propiedades más recientes para mostrarlas en la portada
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/featured`);
        if (!res.ok) {
          throw new Error('Error al cargar destacados');
        }
        const data = await res.json();
        // Tomamos solo las primeras 3 o 4 propiedades para destacar
        setFeaturedProperties(data.slice(0, 3));
      } catch (error) {
        console.error('Error al cargar propiedades destacadas', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let url = '/inmuebles?';
    if (selectedType !== 'Todos') url += `type=${selectedType}&`;
    if (searchLocation.trim()) url += `search=${encodeURIComponent(searchLocation)}`;
    router.push(url);
  };

  return (
    <main className="min-h-screen bg-yellow-50">

      {/* 1. HERO SECTION (Portada Principal) */}
      <section className="relative bg-gray-900 text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Imagen de fondo con overlay oscuro */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600"
            alt="Moderna casa"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest bg-yellow-500/80 text-white px-3 py-1.5 rounded-full backdrop-blur-xs">
            Tu próximo hogar te espera
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Encuentra la propiedad ideal para tu vida
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            Explora cientos de opciones en venta y alquiler con asesoramiento profesional y transparente.
          </p>

          {/* Buscador Rápido Integrado */}
          <form onSubmit={handleSearchSubmit} className="bg-white p-3 rounded-2xl shadow-lg max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 mt-8">
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Busca por ubicación o título (ej. Paraná)..."
              className="flex-1 px-4 py-3 text-gray-900 rounded-xl focus:outline-none text-sm bg-gray-50 border border-gray-100"
            />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 text-gray-700 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none text-sm font-medium"
            >
              <option value="Todos">Todas</option>
              <option value="Venta">Venta</option>
              <option value="Alquiler">Alquiler</option>
            </select>
            <button
              type="submit"
              className="bg-red-600 text-white font-medium px-8 py-3 rounded-xl hover:bg-red-700 transition-colors text-sm shadow-sm"
            >
              Buscar
            </button>
          </form>
        </div>
      </section>

      {/* 2. PROPIEDADES DESTACADAS */}
      <section className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Oportunidades</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Propiedades Destacadas</h2>
          </div>
          <Link href="/inmuebles" className="text-sm font-semibold text-red-600 hover:underline">
            Ver todo el catálogo &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Cargando destacados...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((prop: any) => (
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
                        {prop.currency === 'ARS' ? `$ ${prop.price?.toLocaleString()}` : `USD $ ${prop.price?.toLocaleString()}`}
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

        {!loading && featuredProperties.length === 0 && (
          <div className="bg-white p-12 rounded-2xl text-center text-gray-400 border border-gray-100 text-sm">
            Aún no hay propiedades destacadas cargadas.
          </div>
        )}
      </section>

      {/* 3. SECCIÓN DE VALOR / BENEFICIOS */}
      <section className="bg-white border-y border-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">¿Por qué elegirnos?</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Hacemos que tu operación sea segura y simple</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gray-400 text-white flex items-center justify-center font-bold text-lg">
                🛡️
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Seguridad Jurídica</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Revisamos cada título y documentación para garantizar transacciones 100% confiables y transparentes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gray-400 text-white flex items-center justify-center font-bold text-lg">
                💼
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Asesoramiento Experto</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Contamos con profesionales especializados en tasaciones y oportunidades del mercado inmobiliario actual.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gray-400 text-white flex items-center justify-center font-bold text-lg">
                ⚡
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Atención Inmediata</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Conectamos directamente con WhatsApp para agilizar visitas y responder tus dudas en minutos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA FINAL */}
      <section className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-yellow-600 text-white p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-md">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">¿Tienes una propiedad para vender o alquilar?</h2>
          <p className="text-blue-100 max-w-xl mx-auto text-sm sm:text-base">
            Publica tu inmueble con nosotros y llega a cientos de potenciales compradores interesados cada día.
          </p>
          <div className="pt-2">
            <Link
              href="/contacto"
              className="px-8 py-3.5 bg-white text-red-600 font-semibold rounded-xl text-sm hover:bg-blue-50 transition-colors shadow-sm inline-block"
            >
              Contáctanos hoy
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}