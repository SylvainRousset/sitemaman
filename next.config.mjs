/** @type {import('next').NextConfig} */
const nextConfig = {
  // DÉSACTIVER Fast Refresh - cause majeure de fuites mémoire
  reactStrictMode: false,

  // Réduire drastiquement les workers
  experimental: {
    workerThreads: false,
    cpus: 1,
  },

  // Optimisation des images
  images: {
    formats: ['image/webp'],
  },

  // TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Webpack optimizations pour réduire la mémoire
  webpack: (config, { dev }) => {
    if (dev) {
      // Réduire la consommation mémoire en dev
      config.watchOptions = {
        poll: 1000, // Utiliser polling au lieu de file watchers
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      }

      // Limiter le cache
      config.cache = false

      // Optimisations mémoire
      config.optimization = {
        ...config.optimization,
        minimize: false,
        splitChunks: false,
      }
    }
    return config
  },
}

export default nextConfig
