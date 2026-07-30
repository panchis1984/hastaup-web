'use client';

import { useState } from 'react';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';

// Datos de contacto que se muestran en el panel derecho
const CONTACT_INFO = [
  {
    icon: '📍',
    title: '¿Dónde estamos?',
    desc: 'Paraná, Entre Ríos, Argentina',
  },
  {
    icon: '📞',
    title: 'Teléfono / WhatsApp',
    desc: '+54 343 5201231',
  },
  {
    icon: '📧',
    title: 'Correo electrónico',
    desc: 'hastaup57@gmail.com',
  },
  {
    icon: '🕐',
    title: 'Horario de atención',
    desc: 'Lunes a viernes · 9:00 a 18:00 hs',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('No se pudo enviar el mensaje');

      setModal({
        isOpen: true,
        title: '¡Mensaje Enviado!',
        message: 'Gracias por contactarnos. Nos comunicaremos con vos a la brevedad.',
        type: 'success',
      });
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      setModal({
        isOpen: true,
        title: 'Error de Envío',
        message: 'Hubo un problema al enviar tu mensaje. Por favor, intentá nuevamente.',
        type: 'danger',
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

        {/* Encabezado */}
        <div className="mb-8">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            Estamos para ayudarte
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2 leading-tight">
            Contactanos y encontrá<br />tu propiedad ideal
          </h1>
          <p className="text-gray-500 text-sm mt-3 leading-relaxed">
            ¿Tenés alguna consulta sobre venta o alquiler? Completá el formulario y un asesor se comunicará con vos a la brevedad.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="contact-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nombre completo
            </label>
            <input
              id="contact-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none text-sm bg-white transition-shadow hover:shadow-sm"
              placeholder="Juan Pérez"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none text-sm bg-white transition-shadow hover:shadow-sm"
                placeholder="juan@example.com"
              />
            </div>
            <div>
              <label htmlFor="contact-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Teléfono <span className="font-normal text-gray-400">(opcional)</span>
              </label>
              <input
                id="contact-phone"
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none text-sm bg-white transition-shadow hover:shadow-sm"
                placeholder="343 400-0000"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Mensaje
            </label>
            <textarea
              id="contact-message"
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none text-sm bg-white transition-shadow hover:shadow-sm resize-none"
              placeholder="Escribí tu consulta aquí..."
            />
          </div>

          <button
            type="submit"
            id="btn-contacto-submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-white font-semibold py-3.5 rounded-xl hover:bg-yellow-600 active:scale-[0.98] transition-all disabled:opacity-50 text-sm shadow-sm mt-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Enviando...
              </span>
            ) : (
              'Enviar mensaje'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8">
          También podés escribirnos directamente a{' '}
          <span className="text-blue-600 font-medium">hastaup57@gmail.com</span>
        </p>
      </div>

      {/* ── COLUMNA DERECHA: Panel informativo ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Imagen de fondo */}
        <img
          src="/contacto-panel.png"
          alt="Oficina Hasta Up Inmobiliaria"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-900/60 to-blue-800/30" />

        {/* Contenido del panel */}
        <div className="relative z-10 flex flex-col justify-center p-8 xl:p-12 text-white">

          {/* Badge */}
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full w-fit mb-6">
            💬 Respondemos en menos de 24 hs
          </span>

          <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight mb-4">
            Tu consulta es nuestra prioridad
          </h2>

          <p className="text-blue-100 text-sm leading-relaxed mb-8 max-w-md">
            Contamos con un equipo de asesores especializados listos para ayudarte a encontrar la propiedad perfecta, ya sea para vivir o invertir.
          </p>

          {/* Datos de contacto */}
          <ul className="space-y-4">
            {CONTACT_INFO.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-base flex-shrink-0 border border-white/20">
                  {item.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-blue-200 leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Separador y CTA WhatsApp */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <a
              href="https://wa.me/543435201231"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 transition-colors text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm"
            >
              <span>💬</span>
              Escribinos por WhatsApp
            </a>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText="Aceptar"
        showCancel={false}
        onConfirm={() => setModal({ ...modal, isOpen: false })}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
    </main>
  );
}