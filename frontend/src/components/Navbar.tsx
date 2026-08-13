'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    // Cerrar el menú mobile al cambiar de ruta
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const executeLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setShowLogoutModal(false);
    setIsMobileMenuOpen(false);
    router.push('/login');
  };

  return (
    <>
      <nav className="w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logoNavbar.png"
              alt="Hasta Up Logo"
              width={140}
              height={45}
              priority
              style={{ width: 'auto', height: 'auto' }}
              className="object-contain cursor-pointer hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Menú Desktop (pantallas medianas y grandes) */}
          <ul className="hidden md:flex items-center gap-6 text-gray-700 font-medium text-sm">
            <li>
              <Link href="/" className={`hover:text-red-600 transition-colors ${pathname === '/' ? 'text-red-600 font-bold' : ''}`}>
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/inmuebles" className={`hover:text-red-600 transition-colors ${pathname.startsWith('/inmuebles') ? 'text-red-600 font-bold' : ''}`}>
                Inmuebles
              </Link>
            </li>
            <li>
              <Link href="/eventos" className={`hover:text-red-600 transition-colors ${pathname.startsWith('/eventos') ? 'text-red-600 font-bold' : ''}`}>
                Eventos
              </Link>
            </li>
            <li>
              <Link href="/nosotros" className={`hover:text-red-600 transition-colors ${pathname === '/nosotros' ? 'text-red-600 font-bold' : ''}`}>
                Nosotros
              </Link>
            </li>
            <li>
              <Link href="/contacto" className={`hover:text-red-600 transition-colors ${pathname === '/contacto' ? 'text-red-600 font-bold' : ''}`}>
                Contacto
              </Link>
            </li>

            {user?.role === 'ADMIN' && (
              <li>
                <Link href="/admin" className="text-red-600 font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                  Panel Admin
                </Link>
              </li>
            )}

            {user ? (
              <li className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-all"
                  title="Ir a mi panel"
                >
                  <img
                    src={user.avatarUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNFNUU3RUIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIyMCIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0xNiA4OEMxNiA2OS4yMjIzIDMxLjIyMjMgNTQgNTAgNTRDNjguNzc3NyA1NCA4NCA2OS4yMjIzIDg0IDg4SDE2WiIgZmlsbD0iIzlDQTNBRiIvPjwvc3ZnPg=='}
                    alt={user.name || 'Perfil'}
                    className="w-7 h-7 rounded-full object-cover border border-gray-300 shadow-sm"
                  />
                  <span className="font-bold text-gray-800 text-sm">
                    Mi Panel
                  </span>
                </Link>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  Cerrar Sesión
                </button>
              </li>
            ) : (
              <li className="flex items-center gap-3 pl-2">
                <Link href="/login" className="hover:text-red-600 transition-colors px-2">
                  Ingresar
                </Link>
                <Link href="/registro" className="bg-red-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-red-700 transition-all shadow-sm active:scale-95 text-xs">
                  Registro
                </Link>
              </li>
            )}
          </ul>

          {/* Botón Menú Hamburguesa (Mobile) */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link href="/dashboard" className="p-1">
                <img
                  src={user.avatarUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNFNUU3RUIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIyMCIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0xNiA4OEMxNiA2OS4yMjIzIDMxLjIyMjMgNTQgNTAgNTRDNjguNzc3NyA1NCA4NCA2OS4yMjIzIDg0IDg4SDE2WiIgZmlsbD0iIzlDQTNBRiIvPjwvc3ZnPg=='}
                  alt={user.name || 'Perfil'}
                  className="w-8 h-8 rounded-full object-cover border border-gray-300"
                />
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none"
              aria-label="Abrir menú de navegación"
            >
              {isMobileMenuOpen ? (
                /* Icono X (Cerrar) */
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                /* Icono Hamburguesa */
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>

        {/* Desplegable Mobile (Hamburguesa) */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <Link
              href="/"
              className={`block px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                pathname === '/' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              🏠 Inicio
            </Link>
            <Link
              href="/inmuebles"
              className={`block px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                pathname.startsWith('/inmuebles') ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              🏢 Inmuebles
            </Link>
            <Link
              href="/eventos"
              className={`block px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                pathname.startsWith('/eventos') ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              🎉 Eventos
            </Link>
            <Link
              href="/nosotros"
              className={`block px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                pathname === '/nosotros' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              👥 Nosotros
            </Link>
            <Link
              href="/contacto"
              className={`block px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                pathname === '/contacto' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              📞 Contacto
            </Link>

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="block px-3 py-2.5 rounded-xl font-bold text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                ⚙️ Panel Admin
              </Link>
            )}

            <div className="pt-3 border-t border-gray-100 space-y-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold text-sm transition-colors"
                  >
                    <img
                      src={user.avatarUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNFNUU3RUIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIyMCIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0xNiA4OEMxNiA2OS4yMjIzIDMxLjIyMjMgNTQgNTAgNTRDNjguNzc3NyA1NCA4NCA2OS4yMjIzIDg0IDg4SDE2WiIgZmlsbD0iIzlDQTNBRiIvPjwvc3ZnPg=='}
                      alt={user.name || 'Perfil'}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span>Mi Panel ({user.name || 'Usuario'})</span>
                  </Link>

                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    🚪 Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    className="text-center px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/registro"
                    className="text-center px-4 py-2.5 rounded-xl bg-red-600 font-bold text-sm text-white hover:bg-red-700 transition-colors"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <ConfirmModal
        isOpen={showLogoutModal}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar tu sesión actual?"
        confirmText="Sí, salir"
        type="danger"
        showCancel={true}
        onConfirm={executeLogout}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
}