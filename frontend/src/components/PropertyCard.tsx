'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getUserSavedItems, toggleFavoritePropertyApi } from '@/utils/userActions';

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  currency?: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  type: string;
}

export default function PropertyCard({
  id,
  title,
  location,
  price,
  currency = 'USD',
  bedrooms,
  bathrooms,
  imageUrl,
  type,
}: PropertyCardProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkFavoriteStatus = () => {
    const { favoritePropertyIds } = getUserSavedItems();
    setIsFavorite(favoritePropertyIds.includes(id));
  };

  useEffect(() => {
    checkFavoriteStatus();

    const handleUpdate = () => checkFavoriteStatus();
    window.addEventListener('user-favorites-updated', handleUpdate);
    return () => window.removeEventListener('user-favorites-updated', handleUpdate);
  }, [id]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    const result = await toggleFavoritePropertyApi(id);

    if (result.requireLogin) {
      router.push('/login');
    } else if (result.success && result.isFavorite !== undefined) {
      setIsFavorite(result.isFavorite);
    }
    setLoading(false);
  };

  return (
    <Link href={`/inmuebles/${id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 relative">
        <div className="relative h-48 w-full overflow-hidden bg-gray-200">
          <Image
            width={300}
            height={400} 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {type}
          </span>

          {/* Botón de Favorito */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={loading}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-md transition-all duration-200 z-10 active:scale-90 ${
              isFavorite
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'
            }`}
            title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          >
            <svg
              className="w-4 h-4 transition-transform duration-200 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
        
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors truncate">
            {title}
          </h3>
          <p className="text-gray-500 text-sm mt-1">{location}</p>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xl font-extrabold text-gray-950">
              {currency === 'ARS' ? `$ ${price.toLocaleString()}` : `USD $ ${price.toLocaleString()}`}
            </span>
            <div className="flex items-center gap-3 text-gray-500 text-sm">
              <span>{bedrooms} habs</span>
              <span>•</span>
              <span>{bathrooms} baños</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}