/**
 * Cloudflare Pages Function & Edge Worker Middleware for Rooh AI Platform
 * Handles:
 * 1. Edge SEO routing & Dynamic Sitemaps (XML / Robots.txt)
 * 2. Cloudflare R2 & KV Caching for AI prompts, media & generated pages
 * 3. Crawler-specific OpenGraph & Schema.org rich previews for roohpro.com/ai/item/*
 * 4. High-security HTTP response headers
 */

interface R2ObjectBody {
  text: () => Promise<string>;
}

interface R2BucketBinding {
  get: (key: string) => Promise<R2ObjectBody | null>;
}

interface KVNamespaceBinding {
  get: (key: string) => Promise<string | null>;
}

interface Env {
  ROOH_STORAGE_R2?: R2BucketBinding;
  ROOH_D1_DATABASE?: any;
  ROOH_KV_CACHE?: KVNamespaceBinding;
  ENVIRONMENT?: string;
  BASE_DOMAIN?: string;
}

interface PagesFunctionContext<E> {
  request: Request;
  env: E;
  next: () => Promise<Response>;
}

export const onRequest = async (context: PagesFunctionContext<Env>): Promise<Response> => {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

  // 1. Edge Route: Robots.txt
  if (pathname === '/robots.txt' || pathname === '/ai/robots.txt') {
    let robotsTxt = `User-agent: *
Allow: /
Allow: /ai/
Allow: /ai/*

# Sitemaps Index for Main Domain Archiving (roohpro.com)
Sitemap: https://roohpro.com/ai/sitemap.xml
Sitemap: https://roohpro.com/ai/sitemap-images.xml
Sitemap: https://roohpro.com/ai/sitemap-videos.xml
Sitemap: https://roohpro.com/ai/sitemap-index.xml
`;
    if (env.ROOH_KV_CACHE) {
      const cached = await env.ROOH_KV_CACHE.get('seo:robots_txt');
      if (cached) robotsTxt = cached;
    }

    return new Response(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 2. Edge Route: Master Sitemap XML
  if (
    pathname === '/sitemap.xml' ||
    pathname === '/ai/sitemap.xml' ||
    pathname === '/ai/sitemap-master.xml'
  ) {
    let xml = '';
    if (env.ROOH_KV_CACHE) {
      xml = (await env.ROOH_KV_CACHE.get('sitemap:master')) || '';
    }
    if (!xml && env.ROOH_STORAGE_R2) {
      const r2Obj = await env.ROOH_STORAGE_R2.get('sitemaps/sitemap.xml');
      if (r2Obj) {
        xml = await r2Obj.text();
      }
    }
    if (!xml) {
      xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://roohpro.com/ai/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://roohpro.com/ai/window/1</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://roohpro.com/ai/window/2</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://roohpro.com/ai/window/3</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://roohpro.com/ai/window/4</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://roohpro.com/ai/window/5</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://roohpro.com/ai/window/6</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
    }

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 3. Edge Route: Images Sitemap XML
  if (pathname === '/sitemap-images.xml' || pathname === '/ai/sitemap-images.xml') {
    let xml = '';
    if (env.ROOH_KV_CACHE) {
      xml = (await env.ROOH_KV_CACHE.get('sitemap:images')) || '';
    }
    if (!xml && env.ROOH_STORAGE_R2) {
      const r2Obj = await env.ROOH_STORAGE_R2.get('sitemaps/sitemap-images.xml');
      if (r2Obj) {
        xml = await r2Obj.text();
      }
    }
    if (!xml) {
      xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://roohpro.com/ai/</loc>
  </url>
</urlset>`;
    }

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 4. Edge Route: Videos Sitemap XML
  if (pathname === '/sitemap-videos.xml' || pathname === '/ai/sitemap-videos.xml') {
    let xml = '';
    if (env.ROOH_KV_CACHE) {
      xml = (await env.ROOH_KV_CACHE.get('sitemap:videos')) || '';
    }
    if (!xml && env.ROOH_STORAGE_R2) {
      const r2Obj = await env.ROOH_STORAGE_R2.get('sitemaps/sitemap-videos.xml');
      if (r2Obj) {
        xml = await r2Obj.text();
      }
    }
    if (!xml) {
      xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>https://roohpro.com/ai/window/3</loc>
  </url>
</urlset>`;
    }

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 5. Bot & Crawler OpenGraph HTML Previews for Items
  const isSearchBot =
    userAgent.includes('googlebot') ||
    userAgent.includes('bingbot') ||
    userAgent.includes('yandex') ||
    userAgent.includes('duckduckbot') ||
    userAgent.includes('baiduspider') ||
    userAgent.includes('twitterbot') ||
    userAgent.includes('facebookexternalhit') ||
    userAgent.includes('whatsapp') ||
    userAgent.includes('telegrambot');

  const itemMatch = pathname.match(/\/(?:ai\/)?item\/([a-zA-Z0-9_-]+)/);
  if (isSearchBot && itemMatch && itemMatch[1]) {
    const itemCode = itemMatch[1];
    if (env.ROOH_STORAGE_R2) {
      const r2Html = await env.ROOH_STORAGE_R2.get(`pages/html/item-${itemCode}.html`);
      if (r2Html) {
        const html = await r2Html.text();
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }
  }

  // 6. Default response execution with Security Headers
  const response = await next();
  const newHeaders = new Headers(response.headers);

  // Apply Industry Standard Security Headers
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('X-XSS-Protection', '1; mode=block');
  newHeaders.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');

  // Cache static hashed assets
  if (pathname.startsWith('/assets/')) {
    newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
};
