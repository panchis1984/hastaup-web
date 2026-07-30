import Link from 'next/link';
import Image from 'next/image';

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
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
  bedrooms,
  bathrooms,
  imageUrl,
  type,
}: PropertyCardProps) {
  return (
    // Envolvemos toda la tarjeta en un Link hacia la ruta dinámica del detalle
    <Link href={`/inmuebles/${id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
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
        </div>
        
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
            {title}
          </h3>
          <p className="text-gray-500 text-sm mt-1">{location}</p>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xl font-extrabold text-gray-950">
              ${price.toLocaleString()}
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