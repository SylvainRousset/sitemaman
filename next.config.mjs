/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimisation des images
  images: {
    formats: ['image/webp'],
  },

  // TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
