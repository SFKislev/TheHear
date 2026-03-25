// next.config.js
/** @type {import('next').NextConfig} */
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.google.com', port: '', pathname: '/**' },
    ],
  },
  reactStrictMode: false,

  async redirects() {
    return [
      {
        source: '/:locale(en|heb)/iranwar',
        destination: '/:locale/mix/iranwar',
        permanent: false,
      },
    ];
  },

  async headers() {
    return [
      {
        // Exact archive HTML paths: /en|heb/<country>/<dd-MM-yyyy> or .../feed
        // This mirrors your middleware’s ARCHIVE_RE
        source: '/(en|heb)/:country/:date(\\d{2}-\\d{2}-\\d{4})(/feed)?',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, s-maxage=31536000, immutable' },
          // Do NOT add "Vary" headers here; keep shared cacheability
        ],
      },
    ];
  },
};

export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(nextConfig);
