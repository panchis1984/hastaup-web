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
              <span className="font-medium text-gray-700 hidden sm:inline">
                Hola, <span className="font-bold text-gray-900">{user.name}</span>
              </span>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="px-3 py-1.5 font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
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