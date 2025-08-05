import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: ['www.notion.so', 's3.us-west-2.amazonaws.com'],
  },
  output: 'standalone',
}

export default nextConfig
