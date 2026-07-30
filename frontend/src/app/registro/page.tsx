'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';

// Beneficios que se muestran en el panel derecho
const BENEFITS = [
  {
    icon: '🔔',
    title: 'Alertas de nuevas propiedades',
    desc: 'Sé el primero en enterarte cuando publiquemos inmuebles que se ajusten a lo que buscás.',
  },
  {
    icon: '🏷️',
    title: 'Oportunidades exclusivas',
    desc: 'Accedé a precios especiales y oportunidades de venta y alquiler antes que el público general.',
  },
  {
    icon: '📩',
    title: 'Novedades del mercado',
    desc: 'Recibí avisos sobre tendencias de precios, nuevos barrios y cambios en el mercado inmobiliario.',
  },
  {
    icon: '💼',
    title: 'Asesoramiento personalizado',
    desc: 'Un agente te contactará para ayudarte a encontrar exactamente lo que necesitás.',
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Estado para el modal
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger',
    onConfirm: () => { },
    showCancel: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    // Validar que las contraseñas coincidan antes de enviar
    if (form.password !== form.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    // Enviamos solo los campos que necesita la API (sin confirmPassword)
    const { confirmPassword: _, ...payload } = form;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }

      setModal({
        isOpen: true,
        title: '¡Registro Exitoso!',
        message: 'Tu cuenta ha sido creada correctamente. Ya podés iniciar sesión.',
        type: 'success',
        showCancel: false,
        onConfirm: () => router.push('/login'),
      });
    } catch (err: any) {
      setModal({
        isOpen: true,
        title: 'Error en el Registro',
        message: err.message || 'Ocurrió un error inesperado.',
        type: 'danger',
        showCancel: false,
        onConfirm: () => { },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-yellow-50 flex items-stretch">

      {/* ── COLUMNA IZQUIERDA: Formulario ── */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 py-14 sm:px-10 xl:px-20">

        {/* Logotipo / Marca */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-yellow-500 font-black text-sm shadow-sm group-hover:bg-blue-700 transition-colors">
              H
            </span>
            <span className="text-gray-900 font-extrabold text-lg tracking-tight">
              Hasta Up <span className="text-red-600">Subastas</span>
            </span>
          </Link>
        </div>

        {/* Encabezado del formulario */}
        <div className="mb-8">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            Creá tu cuenta gratuita
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2 leading-tight">
            Accedé a las mejores<br />oportunidades
          </h1>
          <p className="text-gray-500 text-sm mt-3 leading-relaxed">
            Registrate y recibí alertas exclusivas sobre propiedades en venta y alquiler antes que nadie.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="reg-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nombre completo
            </label>
            <input
              id="reg-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-blue-500 focus:outline-none text-sm bg-white transition-shadow hover:shadow-sm"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Correo electrónico
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none text-sm bg-white transition-shadow hover:shadow-sm"
              placeholder="juan@example.com"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Contraseña
            </label>
            <input
              id="reg-password"
              type="password"
              required
              value={form.password}
              onChange={(e) => { setPasswordError(''); setForm({ ...form, password: e.target.value }); }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none text-sm bg-white transition-shadow hover:shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="reg-confirm-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Repetir contraseña
            </label>
            <input
              id="reg-confirm-password"
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => { setPasswordError(''); setForm({ ...form, confirmPassword: e.target.value }); }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none text-sm bg-white transition-shadow hover:shadow-sm ${
                passwordError
                  ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                  : 'border-gray-200 focus:ring-red-500 focus:border-red-500'
              }`}
              placeholder="••••••••"
            />
            {passwordError && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {passwordError}
              </p>
            )}
          </div>

          <button
            type="submit"
            id="btn-registro-submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-white font-semibold py-3.5 rounded-xl hover:bg-yellow-600 active:scale-[0.98] transition-all disabled:opacity-50 text-sm shadow-sm mt-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Registrando...
              </span>
            ) : (
              'Crear cuenta gratis'
            )}
          </button>
        </form>

        {/* Separador y acceso a login */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">o</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-semibold">
            Iniciá sesión
          </Link>
        </p>

        <p className="text-center text-xs text-gray-400 mt-8">
          Al registrarte aceptás nuestros{' '}
          <span className="underline cursor-pointer">Términos de uso</span> y{' '}
          <span className="underline cursor-pointer">Política de privacidad</span>.
        </p>
      </div>

      {/* ── COLUMNA DERECHA: Panel promocional ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Imagen de fondo */}
        <img
          src="/registro-panel.png"
          alt="Propiedades exclusivas Hasta Up"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-900/60 to-blue-800/30" />

        {/* Contenido del panel */}
        <div className="relative z-10 flex flex-col justify-center p-10 xl:p-14 text-white">

          {/* Badge */}
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full w-fit mb-6">
            🏡 Novedades y oportunidades
          </span>

          <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight mb-4">
            Sé el primero en conocer las mejores propiedades del mercado
          </h2>

          <p className="text-blue-100 text-sm leading-relaxed mb-8 max-w-md">
            Cada semana publicamos nuevos inmuebles en venta y alquiler en Paraná y la región.
            Registrate y no te pierdas ninguna oportunidad.
          </p>

          {/* Lista de beneficios */}
          <ul className="space-y-4">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-base flex-shrink-0 border border-white/20">
                  {b.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{b.title}</p>
                  <p className="text-xs text-blue-200 leading-relaxed mt-0.5">{b.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Contador social */}
          <div className="mt-8 pt-6 border-t border-white/20 flex items-center gap-4">
            <div className="flex -space-x-2">
              {['👤', '👤', '👤'].map((u, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-blue-500/60 border-2 border-white/30 flex items-center justify-center text-xs">
                  {u}
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-200">
              <span className="text-white font-bold">+500 usuarios</span> ya reciben nuestras alertas
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText="Aceptar"
        showCancel={modal.showCancel}
        onConfirm={modal.onConfirm}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
    </main>
  );
}