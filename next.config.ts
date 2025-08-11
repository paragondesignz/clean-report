import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    // Re-enable ESLint during build for proper error checking
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Re-enable TypeScript checking during build for proper error checking
    ignoreBuildErrors: false,
  },
  // Disable image optimization for now to avoid issues
  images: {
    unoptimized: true,
  },
}

export default nextConfig
