/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite build en Vercel con variables de entorno externas
  output: 'standalone',

  // Habilitar soporte de imágenes externas (por ejemplo Bunny.net CDN)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.b-cdn.net',
      },
      {
        protocol: 'https',
        hostname: '**.bunnycdn.com',
      },
    ],
  },

  // Variables de entorno expuestas al cliente
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SAAS_DOMAIN: process.env.NEXT_PUBLIC_SAAS_DOMAIN,
  },
};

module.exports = nextConfig;
