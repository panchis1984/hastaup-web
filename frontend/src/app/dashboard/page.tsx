'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import EventCard from '@/components/EventCard';
import ConfirmModal from '@/components/ConfirmModal';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // Límite de 2 MB

export default function UserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'events'>('profile');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Formulario de perfil
  const [profileForm, setProfileForm] = useState({
    name: '',
    lastName: '',
    cuit: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: 'Argentina',
    password: '',
    avatarUrl: DEFAULT_AVATAR,
  });

  // Favoritos y eventos guardados
  const [favoriteProperties, setFavoriteProperties] = useState<any[]>([]);
  const [savedEvents, setSavedEvents] = useState<any[]>([]);

  // Alertas / Modal
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger',
    onConfirm: () => {},
    showCancel: false,
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        throw new Error('No se pudo cargar la información del usuario.');
      }

      const data = await res.json();
      setUser(data);

      setProfileForm({
        name: data.name || '',
        lastName: data.lastName || '',
        cuit: data.cuit || '',
        email: data.email || '',
        phone: data.phone || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || 'Argentina',
        password: '',
        avatarUrl: data.avatarUrl || DEFAULT_AVATAR,
      });

      setFavoriteProperties(data.favoriteProperties || []);
      setSavedEvents(data.savedEvents || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Manejo de carga de Avatar con control estricto de tamaño en bytes
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setModal({
        isOpen: true,
        title: 'Imagen demasiado grande',
        message: `El archivo supera el límite de 2 MB (Tu archivo pesa ${(file.size / (1024 * 1024)).toFixed(2)} MB). Por favor selecciona una imagen de menor peso.`,
        type: 'danger',
        showCancel: false,
        onConfirm: () => {},
      });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfileForm((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Guardar cambios en el Perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    setSavingProfile(true);

    try {
      const payload: any = {
        name: profileForm.name,
        lastName: profileForm.lastName,
        cuit: profileForm.cuit,
        email: profileForm.email,
        phone: profileForm.phone,
        city: profileForm.city,
        state: profileForm.state,
        country: profileForm.country,
        avatarUrl: profileForm.avatarUrl,
      };

      if (profileForm.password.trim() !== '') {
        payload.password = profileForm.password;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar el perfil');
      }

      setUser((prev: any) => ({ ...prev, ...data.data }));
      setProfileForm((prev) => ({ ...prev, password: '' }));

      // Actualizar localStorage para reflejar avatar y nombre en el Navbar
      const storedUserStr = localStorage.getItem('user');
      if (storedUserStr) {
        try {
          const parsed = JSON.parse(storedUserStr);
          localStorage.setItem('user', JSON.stringify({ ...parsed, ...data.data }));
        } catch (_) {}
      }

      setModal({
        isOpen: true,
        title: '¡Perfil Actualizado!',
        message: 'Tus datos de usuario fueron guardados correctamente.',
        type: 'success',
        showCancel: false,
        onConfirm: () => {},
      });
    } catch (err: any) {
      setModal({
        isOpen: true,
        title: 'Error al Guardar',
        message: err.message || 'Ocurrió un error al actualizar tus datos.',
        type: 'danger',
        showCancel: false,
        onConfirm: () => {},
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Quitar inmueble de favoritos
  const handleRemoveFavoriteProperty = async (propertyId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/favorites/property/${propertyId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setFavoriteProperties((prev) => prev.filter((p) => p.id !== propertyId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quitar evento guardado
  const handleRemoveSavedEvent = async (eventId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/favorites/event/${eventId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setSavedEvents((prev) => prev.filter((e) => e.id !== eventId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-600">Cargando tu panel...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header del Dashboard */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar del Usuario */}
            <div className="relative group flex-shrink-0">
              <img
                src={profileForm.avatarUrl || DEFAULT_AVATAR}
                alt={user?.name || 'Usuario'}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md bg-gray-100"
              />
              <span className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" title="Usuario activo" />
            </div>

            {/* Información Principal */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {user?.name} {user?.lastName}
                </h1>
                <span className="bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {user?.role === 'ADMIN' ? '👑 Administrador' : '👤 Usuario'}
                </span>
                {user?.cuit && (
                  <span className="bg-gray-100 text-gray-700 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border border-gray-200">
                    CUIT: {user.cuit}
                  </span>
                )}
              </div>

              <p className="text-gray-500 text-sm mb-3">
                {user?.email} {user?.city && `• ${user.city}, ${user.state || user.country}`}
              </p>

              {/* Botón rápido a Admin si aplica */}
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                  Ir al Panel Administrativo
                </Link>
              )}
            </div>
          </div>

          {/* Navegación por pestañas */}
          <div className="flex border-b border-gray-200 mt-8 gap-2 sm:gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-3 sm:px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              ⚙️ Mi Perfil y Datos
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-3 px-3 sm:px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'favorites'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              ❤️ Inmuebles Favoritos ({favoriteProperties.length})
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`py-3 px-3 sm:px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'events'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              📌 Eventos Guardados ({savedEvents.length})
            </button>
          </div>
        </div>

        {/* ── PESTAÑA 1: MI PERFIL ── */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Editar Información Personal
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-4xl">
              {/* Sección Foto de Perfil / Avatar */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Imagen de Avatar <span className="text-gray-400 font-normal text-xs">(Límite máximo: 2 MB)</span>
                </label>

                <div className="flex items-center gap-4">
                  <img
                    src={profileForm.avatarUrl || DEFAULT_AVATAR}
                    alt="Preview avatar"
                    className="w-16 h-16 rounded-full object-cover border border-gray-300 bg-white"
                  />
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                    />
                    <p className="text-xs text-gray-400 mt-1">Formatos soportados: JPG, PNG, WEBP.</p>
                  </div>
                </div>
              </div>

              {/* Grilla de Datos de Usuario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    CUIT / CUIL <span className="text-gray-400 font-normal text-xs">(Único)</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.cuit}
                    onChange={(e) => setProfileForm({ ...profileForm, cuit: e.target.value })}
                    placeholder="Ej. 20-12345678-9"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="Ej. 3434123456"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Localidad</label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    placeholder="Ej. Paraná"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Provincia</label>
                  <input
                    type="text"
                    value={profileForm.state}
                    onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                    placeholder="Ej. Entre Ríos"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">País</label>
                  <input
                    type="text"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    placeholder="Ej. Argentina"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none text-sm bg-white"
                  />
                </div>
              </div>

              {/* Cambiar contraseña opcional */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nueva Contraseña <span className="text-gray-400 font-normal text-xs">(Dejar en blanco si no deseas cambiarla)</span>
                </label>
                <input
                  type="password"
                  value={profileForm.password}
                  onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full sm:w-1/2 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none text-sm bg-white"
                />
              </div>

              {/* Botón Guardar */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  {savingProfile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── PESTAÑA 2: INMUEBLES FAVORITOS ── */}
        {activeTab === 'favorites' && (
          <div>
            {favoriteProperties.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <span className="text-4xl mb-3 block">❤️</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No tenés inmuebles en favoritos</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                  Guardá las propiedades que te interesen para revisarlas fácilmente más tarde.
                </p>
                <Link
                  href="/inmuebles"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm inline-block"
                >
                  Explorar Inmuebles
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteProperties.map((property) => (
                  <div key={property.id} className="relative group">
                    <PropertyCard
                      id={property.id}
                      title={property.title}
                      location={property.location}
                      price={property.price}
                      currency={property.currency}
                      bedrooms={property.details?.bedrooms || 0}
                      bathrooms={property.details?.bathrooms || 0}
                      imageUrl={property.imageUrl}
                      type={property.type}
                    />
                    <button
                      onClick={() => handleRemoveFavoriteProperty(property.id)}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white text-red-600 p-2 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110 z-10"
                      title="Quitar de favoritos"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PESTAÑA 3: EVENTOS GUARDADOS ── */}
        {activeTab === 'events' && (
          <div>
            {savedEvents.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <span className="text-4xl mb-3 block">📌</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No tenés eventos guardados</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                  Guardá las subastas, charlas y capacitaciones que quieras seguir.
                </p>
                <Link
                  href="/eventos"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm inline-block"
                >
                  Ver Próximos Eventos
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedEvents.map((event) => (
                  <div key={event.id} className="relative group">
                    <EventCard
                      id={event.id}
                      title={event.title}
                      location={event.location}
                      date={event.date}
                      time={event.time}
                      imageUrl={event.imageUrl}
                      category={event.category}
                    />
                    <button
                      onClick={() => handleRemoveSavedEvent(event.id)}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white text-red-600 p-2 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110 z-10"
                      title="Quitar de eventos guardados"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

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
    </div>
  );
}
