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
      // Cuando uses Cloudinary más adelante, agregaremos su hostname aquí
    ],
  },
};

export default nextConfig;
