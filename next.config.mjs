/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return [];
    // /api/* — what the frontend client calls (strips /api, hits backend /v1).
    // /v1/*  — what Google hits for the Gmail/Calendar connect callback when
    //          PUBLIC_BASE_URL is the Vercel origin (backend builds
    //          {PUBLIC_BASE_URL}/v1/integrations/google/callback).
    return [
      { source: "/api/:path*", destination: `${api}/v1/:path*` },
      { source: "/v1/:path*", destination: `${api}/v1/:path*` },
    ];
  },
};

export default nextConfig;
