/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Deshabilitar verificación de tipos durante el build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Excluir páginas de React Router del build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Excluir completamente la carpeta src/pages
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /src\/pages\/.*\.(tsx|ts|jsx|js)$/,
      use: 'ignore-loader',
    })
    return config
  },
  // Configuración para Supabase
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
