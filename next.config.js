const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  images: {
    domains: ['localhost'],
  },
  eslint: {
    // Vercel build sırasında lint hatalarında derlemeyi durdurma
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
