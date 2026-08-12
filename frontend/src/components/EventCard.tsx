import Link from 'next/link';
import Image from 'next/image';

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
  const formattedDate = new Date(date).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Link href={`/eventos/${id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
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
