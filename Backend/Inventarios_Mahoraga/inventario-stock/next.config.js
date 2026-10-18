/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // La raíz abre directamente el inventario
      { source: '/', destination: '/inventario', permanent: false },
    ];
  },
};

module.exports = nextConfig;
