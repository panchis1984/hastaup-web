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
