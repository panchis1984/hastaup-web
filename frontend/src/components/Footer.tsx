import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

          {/* Columna 1: Marca */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-lg">Hasta Up</h3>
            <p className="text-sm leading-relaxed">
              Servicio especializado en tasación, venta y alquiler de propiedades en Entre Ríos, Argentina.
            </p>
          </div>

          {/* Columna 2: Navegación rápida */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/inmuebles" className="hover:text-white transition-colors">Inmuebles</Link></li>
              <li><Link href="/nosotros" className="hover:text-white transition-colors">Nosotros</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li>📍 Paraná, Entre Ríos</li>
              <li>
                <a
                  href="https://wa.me/5493435201231"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  💬 WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="mailto:hastaup57@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  ✉️ hastaup57@gmail.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Línea divisoria y copyright */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs">
          © {currentYear} Hasta Up Subastas. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
