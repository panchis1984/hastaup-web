'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal'; // <-- Importar el modal moderno

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'properties' | 'messages' | 'new-property'>('properties');
  const [properties, setProperties] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para creación y edición
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    location: '',
    price: '',
    type: 'Venta',
    imageUrl: '',
    images: [] as string[],
    bedrooms: '',
    bathrooms: '',
  });
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [formStatus, setFormStatus] = useState({ loading: false, error: '', success: false });
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const TYPE_OPTIONS = ['Venta', 'Alquiler'];

  // Estados para el Modal de Confirmación y Alertas modernas
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Aceptar',
    type: 'info' as 'danger' | 'info',
    onConfirm: () => { },
  });

  // Obtiene el token JWT almacenado tras el login
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Upload de imagen a Cloudinary (directo desde el browser)
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) throw new Error('Cloudinary no configurado. Agregá las variables de entorno.');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Error al subir imagen a Cloudinary');
    const data = await res.json();
    return data.secure_url as string;
  };


  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [propRes, msgRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, { headers: getAuthHeaders() }),
      ]);

      // Si el token expiró, redirigir al login
      if (msgRes.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const propData = await propRes.json();
      const msgData = await msgRes.json();

      setProperties(propData);
      setMessages(msgData);
    } catch (error) {
      console.error('Error al cargar datos del panel', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Verificar autenticación y rol de Administrador
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.role !== 'ADMIN') {
        setModalConfig({
          isOpen: true,
          title: 'Acceso Denegado',
          message: 'No tienes permisos de administrador para acceder a esta sección.',
          confirmText: 'Entendido',
          type: 'danger',
          onConfirm: () => router.push('/inmuebles'),
        });
        return;
      }
      setAuthorized(true);
      fetchData();
    } catch (error) {
      localStorage.removeItem('user');
      router.push('/login');
    }
  }, [router, fetchData]);

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ loading: true, error: '', success: false });

    try {
      const payload = {
        title: form.title,
        location: form.location,
        price: Number(form.price),
        type: form.type,
        imageUrl: form.imageUrl,
        images: form.images,
        details: {
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
        },
      };

      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/properties/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/properties`;

      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al guardar la propiedad');

      setFormStatus({ loading: false, error: '', success: true });
      resetForm();
      fetchData();
      setActiveTab('properties');
    } catch (err: any) {
      setFormStatus({ loading: false, error: err.message, success: false });
    }
  };

  const handleEditClick = (prop: any) => {
    setEditingId(prop.id);
    setFormStatus({ loading: false, error: '', success: false });
    setForm({
      title: prop.title,
      location: prop.location,
      price: prop.price,
      type: prop.type,
      imageUrl: prop.imageUrl,
      images: Array.isArray(prop.images) ? prop.images : [],
      bedrooms: prop.details?.bedrooms || '',
      bathrooms: prop.details?.bathrooms || '',
    });
    setActiveTab('new-property');
  };

  // Abrir modal moderno de confirmación para eliminar
  const confirmDeleteProperty = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Eliminar Inmueble',
      message: '¿Estás seguro de que deseas eliminar este inmueble? Esta acción no se puede deshacer.',
      confirmText: 'Sí, eliminar',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
          if (!res.ok) throw new Error('No se pudo eliminar la propiedad');
          fetchData();
        } catch (err: any) {
          alert(err.message);
        }
      },
    });
  };
  const handleToggleFeatured = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/destacar/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || 'Error al actualizar el estado de destaque');
        return;
      }

      fetchData(); // Recargar la lista para ver cambios
    } catch (err: any) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormStatus({ loading: false, error: '', success: false });
    setForm({ title: '', location: '', price: '', type: 'Venta', imageUrl: '', images: [], bedrooms: '', bathrooms: '' });
  };

  // Confirmar eliminación de mensaje de contacto
  const confirmDeleteMessage = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Eliminar Mensaje',
      message: '¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.',
      confirmText: 'Sí, eliminar',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
          if (!res.ok) throw new Error('No se pudo eliminar el mensaje');
          fetchData();
        } catch (err: any) {
          alert(err.message);
        }
      },
    });
  };

  if (!authorized) {
    return (
      <>
        <div className="min-h-screen bg-yellow-50 flex items-center justify-center text-gray-400 text-sm">
          Verificando credenciales de acceso...
        </div>
        <ConfirmModal
          isOpen={modalConfig.isOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          cancelText=""
          type={modalConfig.type}
          onConfirm={modalConfig.onConfirm}
          onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        />
      </>
    );
  }

  return (
    <main className="min-h-screen bg-yellow-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabecera del Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-500 text-sm mt-1">Gestiona tu catálogo de inmuebles y revisa las consultas.</p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/inmuebles" className="text-sm font-medium text-red-600 hover:underline">
              Ver sitio público
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                router.push('/login');
              }}
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-gray-400 text-sm font-medium">Total de Inmuebles</span>
            <div className="text-3xl font-bold text-gray-900 mt-1">{properties.length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-gray-400 text-sm font-medium">Mensajes de Contacto</span>
            <div className="text-3xl font-bold text-gray-900 mt-1">{messages.length}</div>
          </div>
        </div>

        {/* Pestañas de navegación */}
        <div className="flex border-b border-gray-200 mb-6 gap-6">
          <button
            onClick={() => { resetForm(); setActiveTab('properties'); }}
            className={`pb-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'properties' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Inmuebles ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`pb-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'messages' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Mensajes Recibidos ({messages.length})
          </button>
          <button
            onClick={() => { resetForm(); setActiveTab('new-property'); }}
            className={`pb-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'new-property' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {editingId ? 'Editar Inmueble' : '+ Agregar Inmueble'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Cargando información...</div>
        ) : (
          <div>
            {/* PESTAÑA: INMUEBLES */}
            {activeTab === 'properties' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                        <th className="p-4">Destacada</th>
                        <th className="p-4">Propiedad</th>
                        <th className="p-4">Ubicación</th>
                        <th className="p-4">Tipo</th>
                        <th className="p-4">Precio</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {properties.map((prop: any) => (
                        <tr key={prop.id} className="hover:bg-gray-50/50">
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleFeatured(prop.id)}
                              title={prop.featured ? "Desmarcar de destacados" : "Marcar como destacado"}
                              className={`text-2xl transition-colors ${prop.featured
                                ? 'text-yellow-500 hover:text-yellow-600'
                                : 'text-gray-300 hover:text-yellow-400'
                                }`}
                            >
                              {prop.featured ? '★' : '☆'}
                            </button>
                          </td>
                          <td className="p-4 flex items-center gap-3">
                            <img src={prop.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-200" />
                            <span className="font-bold text-gray-900">{prop.title}</span>
                          </td>
                          <td className="p-4 text-gray-500">{prop.location}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full">
                              {prop.type}
                            </span>
                          </td>
                          <td className="p-4 font-extrabold text-gray-950">${prop.price?.toLocaleString()}</td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleEditClick(prop)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-xs transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => confirmDeleteProperty(prop.id)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg text-xs transition-colors"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PESTAÑA: MENSAJES */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="bg-white p-12 rounded-2xl text-center text-gray-400 border border-gray-100 text-sm">
                    No hay mensajes de contacto todavía.
                  </div>
                )}
                {messages.map((msg: any) => (
                  <div key={msg.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{msg.name}</h3>
                        <p className="text-xs text-gray-400">Email: <span className="text-blue-600 font-medium">{msg.email}</span></p>
                        {msg.phone && <p className="text-xs text-gray-400">Tel: <span className="font-medium text-gray-600">{msg.phone}</span></p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                        <button
                          onClick={() => confirmDeleteMessage(msg.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg text-xs transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-xl text-sm leading-relaxed border border-gray-100">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* PESTAÑA: CREAR / EDITAR */}
            {activeTab === 'new-property' && (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingId ? 'Editar Inmueble' : 'Registrar Nuevo Inmueble'}
                  </h2>
                  {editingId && (
                    <button onClick={resetForm} className="text-xs text-gray-500 hover:text-gray-700 underline">
                      Cancelar edición
                    </button>
                  )}
                </div>

                {formStatus.success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
                    ¡Inmueble {editingId ? 'actualizado' : 'creado'} con éxito!
                  </div>
                )}

                <form onSubmit={handleSubmitProperty} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                      <input
                        type="text"
                        required
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                      <input
                        type="number"
                        required
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Operación</label>
                      <button
                        type="button"
                        onClick={() => setTypeDropdownOpen((o) => !o)}
                        onBlur={() => setTimeout(() => setTypeDropdownOpen(false), 150)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none bg-white text-sm flex items-center justify-between"
                      >
                        <span>{form.type}</span>
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${typeDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {typeDropdownOpen && (
                        <ul className="absolute z-20 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                          {TYPE_OPTIONS.map((option) => (
                            <li key={option}>
                              <button
                                type="button"
                                onMouseDown={() => {
                                  setForm({ ...form, type: option });
                                  setTypeDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                                  ${form.type === option
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones</label>
                      <input
                        type="number"
                        required
                        value={form.bedrooms}
                        onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Baños</label>
                      <input
                        type="number"
                        required
                        value={form.bathrooms}
                        onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* ── SECCIÓN IMÁGENES ── */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">📷 Fotos del Inmueble</h3>

                    {/* Foto de portada */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Foto de portada <span className="text-red-500">*</span></label>
                      <div className="flex items-center gap-3">
                        {form.imageUrl && (
                          <div className="relative w-20 h-20 flex-shrink-0">
                            <img src={form.imageUrl} alt="Portada" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">PORTADA</span>
                          </div>
                        )}
                        <label className={`flex-1 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${
                          uploadingCover ? 'border-gray-200 bg-gray-50' : 'border-red-200 hover:border-red-400 hover:bg-red-50'
                        }`}>
                          {uploadingCover ? (
                            <svg className="animate-spin w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                          )}
                          <span className="text-xs text-gray-500">{uploadingCover ? 'Subiendo...' : form.imageUrl ? 'Cambiar portada' : 'Subir foto de portada'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingCover}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                setUploadingCover(true);
                                const url = await uploadToCloudinary(file);
                                setForm((f) => ({ ...f, imageUrl: url }));
                              } catch (err: any) {
                                alert(err.message);
                              } finally {
                                setUploadingCover(false);
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Galería */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Galería <span className="text-gray-400 font-normal">({form.images.length} fotos adicionales)</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {form.images.map((url, i) => (
                          <div key={i} className="relative w-20 h-20">
                            <img src={url} alt={`Galería ${i + 1}`} className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                            <button
                              type="button"
                              onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}

                        {/* Botón agregar foto */}
                        {form.images.length < 9 && (
                          <label className={`w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            uploadingGallery ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
                          }`}>
                            {uploadingGallery ? (
                              <svg className="animate-spin w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                            )}
                            <span className="text-[10px] text-gray-400 mt-0.5">{uploadingGallery ? '...' : 'Agregar'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              disabled={uploadingGallery}
                              onChange={async (e) => {
                                const files = Array.from(e.target.files || []);
                                if (!files.length) return;
                                try {
                                  setUploadingGallery(true);
                                  const urls = await Promise.all(files.slice(0, 9 - form.images.length).map(uploadToCloudinary));
                                  setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
                                } catch (err: any) {
                                  alert(err.message);
                                } finally {
                                  setUploadingGallery(false);
                                  e.target.value = '';
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Máximo 9 fotos de galería. Podés seleccionar varias a la vez.</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formStatus.loading}
                    className="w-full bg-yellow-500 text-white font-medium py-2.5 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 mt-4 text-sm"
                  >
                    {formStatus.loading ? 'Guardando...' : (editingId ? 'Actualizar Inmueble' : 'Publicar Inmueble')}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmación global */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
    </main>
  );
}