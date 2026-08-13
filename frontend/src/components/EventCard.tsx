'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserSavedItems, toggleSavedEventApi } from '@/utils/userActions';

interface EventCardProps {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  imageUrl: string;
  category: string;
}

export default function EventCard({
  id,
  title,
  location,
  date,
  time,
  imageUrl,
  category,
}: EventCardProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const formattedDate = new Date(date).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const checkSavedStatus = () => {
    const { savedEventIds } = getUserSavedItems();
    setIsSaved(savedEventIds.includes(id));
  };

  useEffect(() => {
    checkSavedStatus();

    const handleUpdate = () => checkSavedStatus();
    window.addEventListener('user-favorites-updated', handleUpdate);
    return () => window.removeEventListener('user-favorites-updated', handleUpdate);
  }, [id]);

  const handleToggleSaved = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    const result = await toggleSavedEventApi(id);

    if (result.requireLogin) {
      router.push('/login');
    } else if (result.success && result.isSaved !== undefined) {
      setIsSaved(result.isSaved);
    }
    setLoading(false);
  };

  return (
    <Link href={`/eventos/${id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full relative">
        {/* Foto de portada con badge */}
        <div className="relative h-52 w-full overflow-hidden bg-gray-200">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {category}
          </span>

          {/* Botón Guardar Evento */}
          <button
            type="button"
            onClick={handleToggleSaved}
            disabled={loading}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-md transition-all duration-200 z-10 active:scale-90 ${
              isSaved
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-white/80 text-gray-400 hover:text-red-600 hover:bg-white'
            }`}
            title={isSaved ? 'Quitar de eventos guardados' : 'Guardar evento'}
          >
            <svg
              className="w-4 h-4 transition-transform duration-200 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
            </svg>
          </button>
        </div>

        {/* Info del evento */}
        <div className="p-5 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
              {title}
            </h3>

            <p className="text-gray-500 text-sm mt-2 flex items-center gap-1.5">
              <span>📍</span>
              <span className="truncate">{location}</span>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-700">
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
              <span>🗓️</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
              <span>⏰</span>
              <span>{time.includes('hs') ? time : `${time} hs`}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
