import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const siteUrl = process.env.SITE_URL || "";

/**
 * Content Security Policy.
 *
 * The browser only ever talks to this origin (the OpenAI call happens on the
 * server), so everything is locked to 'self'. Next.js App Router injects
 * inline bootstrap scripts and styles, which needs 'unsafe-inline'; moving to
 * per-request nonces would force every page to render dynamically, which is
 * not worth it for a static portfolio. Dev mode also needs eval and a
 * websocket for hot reloading.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  // HSTS only makes sense over HTTPS; browsers ignore it on plain HTTP anyway.
  ...(siteUrl.startsWith("https://")
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  turbopack: { root: process.cwd() },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
