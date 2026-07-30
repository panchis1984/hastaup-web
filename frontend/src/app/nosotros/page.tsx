'use client';

import Link from 'next/link';

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">

        {/* Cabecera / Presentación */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">
            Sobre Nosotros
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Conectamos personas con su lugar en el mundo
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            Somos una firma inmobiliaria apasionada por brindar soluciones habitacionales y de inversión con un enfoque transparente, moderno y totalmente personalizado.
          </p>
        </div>

        {/* Historia / Propósito (Grid de 2 columnas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Nuestra Trayectoria y Compromiso</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Desde nuestros inicios, nos hemos propuesto transformar la experiencia de comprar, vender o alquilar propiedades. Entendemos que un inmueble no es solo ladrillos, es el escenario de tu vida o el futuro de tu patrimonio.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Acompañamos a cada cliente de principio a fin, garantizando seguridad jurídica, tasaciones justas y un asesoramiento ágil adaptado a las tendencias del mercado actual.
            </p>
          </div>
          <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800"
              alt="Oficina inmobiliaria"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Tarjetas de Valores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg">
              ✓
            </div>
            <h3 className="text-lg font-bold text-gray-900">Transparencia</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Operamos con absoluta claridad en cada proceso, honorarios y condiciones contractuales para tu tranquilidad.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg">
              ★
            </div>
            <h3 className="text-lg font-bold text-gray-900">Compromiso</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Cada cliente es único. Nos involucramos en tus metas inmobiliarias como si fueran propias hasta verlas concretadas.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-gray-900">Innovación</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Combinamos la atención humana y cercana con herramientas tecnológicas de vanguardia para agilizar tus operaciones.
            </p>
          </div>
        </div>

        {/* Llamado a la Acción final */}
        <div className="bg-yellow-500 text-white p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-md">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">¿Listo para dar el siguiente paso?</h2>
          <p className="text-blue-100 max-w-xl mx-auto text-sm sm:text-base">
            Explora nuestro catálogo de propiedades disponibles o ponte en contacto con nuestro equipo hoy mismo.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/inmuebles"
              className="px-6 py-3 bg-white text-red-600 font-semibold rounded-xl text-sm hover:bg-red-200 transition-colors shadow-sm"
            >
              Ver Catálogo
            </Link>
            <Link
              href="/contacto"
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl text-sm hover:bg-red-700 transition-colors border border-red-500"
            >
              Contáctanos
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}