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
  }, [pathname]);

  const executeLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <>
      <nav className="w-full bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image src="/logoNavbar.png" alt="Logo Inmobiliaria" width={100} height={50} style={{ height: 'auto' }} className="object-contain cursor-pointer" />
          </Link>
        </div>

        <ul className="flex items-center gap-6 text-gray-600 font-medium text-sm">
          <li><Link href="/" className="hover:text-red-600 transition">Inicio</Link></li>
          <li><Link href="/inmuebles" className="hover:text-red-600 transition">Inmuebles</Link></li>
          <li><Link href="/eventos" className="hover:text-red-600 transition">Eventos</Link></li>
          <li><Link href="/nosotros" className="hover:text-red-600 transition">Nosotros</Link></li>
          <li><Link href="/contacto" className="hover:text-red-600 transition">Contacto</Link></li>

          {user?.role === 'ADMIN' && (
            <li>
              <Link href="/admin" className="text-red-600 font-semibold hover:underline">
                Panel Admin
              </Link>
            </li>
          )}

          {user ? (
            <li className="flex items-center gap-3 pl-2 border-l border-gray-200">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 hover:bg-gray-100 px-2.5 py-1 rounded-lg transition"
                title="Ir a mi panel"
              >
                <img
                  src={user.avatarUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNFNUU3RUIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIyMCIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0xNiA4OEMxNiA2OS4yMjIzIDMxLjIyMjMgNTQgNTAgNTRDNjguNzc3NyA1NCA4NCA2OS4yMjIzIDg0IDg4SDE2WiIgZmlsbD0iIzlDQTNBRiIvPjwvc3ZnPg=='}
                  alt={user.name || 'Perfil'}
                  className="w-7 h-7 rounded-full object-cover border border-gray-300"
                />
                <span className="font-semibold text-gray-800 text-sm hidden sm:inline">
                  Mi Panel
                </span>
              </Link>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
              >
                Cerrar Sesión
              </button>
            </li>
          ) : (
            <li className="flex items-center gap-2">
              <Link href="/login" className="hover:text-red-600 transition px-2">
                Ingresar
              </Link>
              <Link href="/registro" className="bg-red-600 text-white px-4 py-1.5 rounded-md hover:bg-red-700 transition">
                Registro
              </Link>
            </li>
          )}
        </ul>
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