// Build: 2026-07-30 — fuerza rebuild para tomar NEXT_PUBLIC_API_URL del entorno Railway
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Las imágenes de propiedades pueden venir de cualquier URL HTTPS
        // que el admin cargue (Airbnb, portales inmobiliarios, etc.)
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;

