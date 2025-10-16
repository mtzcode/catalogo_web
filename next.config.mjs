// Leitura obrigatória do cloudName via env (sem fallback)
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
if (!cloudName) {
  console.error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME não definido em .env.local");
  throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME é obrigatório para configuração de imagens");
}

const isProd = process.env.NODE_ENV === "production";
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const shouldUpgradeInsecureRequests = isProd && apiBase?.startsWith("https");

// Content Security Policy — ajustada para dev/prod
const cspLines = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  // Incluir upgrade-insecure-requests apenas quando API base for https
  ...(shouldUpgradeInsecureRequests ? ["upgrade-insecure-requests"] : []),
  "img-src 'self' data: https://res.cloudinary.com",
  `connect-src 'self' ${apiBase}`.trim(),
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"}`,
  "frame-ancestors 'none'",
];
const csp = cspLines.join("; ");

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${cloudName}/**`,
      },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Segurança: desabilitar SVGs por padrão
    dangerouslyAllowSVG: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Strict-Transport-Security", value: isProd ? "max-age=63072000; includeSubDomains; preload" : "max-age=0" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=(), payment=(), browsing-topics=()" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        // Assets internos do Next (hashados) — cache longo e imutável em produção
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: isProd ? "public, max-age=31536000, immutable" : "no-store" },
        ],
      },
      {
        // Assets estáticos do diretório public (svg, imagens, css/js) — cache de 1 dia em produção
        source: "/:path*\\.(svg|ico|png|jpg|jpeg|gif|webp|avif|css|js)",
        headers: [
          { key: "Cache-Control", value: isProd ? "public, max-age=86400" : "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
