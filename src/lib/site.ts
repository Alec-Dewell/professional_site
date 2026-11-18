/**
 * Public origin of the site, used for canonical URLs, Open Graph and the
 * sitemap. Set SITE_URL (for example https://alecdewell.com) when deploying.
 */
export const siteUrl = (process.env.SITE_URL || "http://127.0.0.1:3100").replace(/\/+$/, "");
