/**
 * Rooh Pro AI - Cloudflare Edge Worker (Universal Gateway & API Engine)
 * Domain: https://roohpro.com/ai
 * 
 * Features:
 * 1. Pre-Production Security & Strict CORS headers for https://roohpro.com
 * 2. Secure R2 Direct Streaming Uploads (No browser secret keys)
 * 3. KV Edge Cache with Stale-While-Revalidate (3600s / 86400s)
 * 4. Dynamic OpenGraph / Twitter Cards SEO Injection for `/ai/item/:code` via D1
 * 5. Dynamic `/ai/sitemap.xml` generation from D1 database
 */

export interface CloudflareWorkerEnv {
  ROOH_R2_BUCKET: any;
  ROOH_D1_DB: any;
  ROOH_KV_CACHE: any;
  ENVIRONMENT?: string;
}

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': 'https://roohpro.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

export const roohEdgeWorker = {
  async fetch(request: Request, env: CloudflareWorkerEnv, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Handle Preflight CORS Requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // 2. API Routing Layer (/ai/api/v1/*)
    if (path.startsWith('/ai/api/v1')) {
      return handleApiRoutes(request, env, ctx, url);
    }

    // 3. Dynamic Sitemap.xml Route (/ai/sitemap.xml)
    if (path === '/ai/sitemap.xml' || path === '/sitemap.xml') {
      return handleDynamicSitemap(env);
    }

    // 4. Dynamic SEO & OpenGraph Meta Injection for Item Pages (/ai/item/:code or /ai/#/item/:code)
    const itemMatch = path.match(/\/ai\/item\/([a-zA-Z0-9_-]+)/i);
    if (itemMatch && request.headers.get('accept')?.includes('text/html')) {
      const itemCode = itemMatch[1];
      return handleDynamicSeoHtml(request, env, itemCode);
    }

    // Default Fallback to Static Asset Delivery
    return fetch(request);
  },
};

export default roohEdgeWorker;

/**
 * Handle API Endpoints with KV Cache & D1 Database
 */
async function handleApiRoutes(
  request: Request,
  env: CloudflareWorkerEnv,
  ctx: any,
  url: URL
): Promise<Response> {
  const path = url.pathname;

  // --- GET /ai/api/v1/portals/:id ---
  const portalMatch = path.match(/\/ai\/api\/v1\/portals\/(\d+)/);
  if (portalMatch && request.method === 'GET') {
    const windowId = parseInt(portalMatch[1], 10);
    const cacheKey = `portal_data_${windowId}`;

    // Try KV Cache first
    try {
      const cached = await env.ROOH_KV_CACHE.get(cacheKey, 'json');
      if (cached) {
        return new Response(JSON.stringify({ success: true, data: cached, source: 'kv_cache' }), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            ...corsHeaders,
          },
        });
      }
    } catch (_) {}

    // Query D1 Database
    try {
      const { results } = await env.ROOH_D1_DB.prepare(
        'SELECT * FROM media_items WHERE window_id = ? ORDER BY created_at DESC'
      ).bind(windowId).all();

      // Store in KV cache (TTL 1 hour)
      if (ctx?.waitUntil) {
        ctx.waitUntil(env.ROOH_KV_CACHE.put(cacheKey, JSON.stringify(results), { expirationTtl: 3600 }));
      }

      return new Response(JSON.stringify({ success: true, data: results, source: 'd1_db' }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          ...corsHeaders,
        },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }

  // --- GET /ai/api/v1/items/:code ---
  const itemMatch = path.match(/\/ai\/api\/v1\/items\/([a-zA-Z0-9_-]+)/);
  if (itemMatch && request.method === 'GET') {
    const code = itemMatch[1];
    const cacheKey = `item_code_${code}`;

    try {
      const cached = await env.ROOH_KV_CACHE.get(cacheKey, 'json');
      if (cached) {
        return new Response(JSON.stringify({ success: true, data: cached, source: 'kv_cache' }), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            ...corsHeaders,
          },
        });
      }
    } catch (_) {}

    try {
      const item = await env.ROOH_D1_DB.prepare(
        'SELECT * FROM media_items WHERE numeric_code = ? OR id = ? LIMIT 1'
      ).bind(code, code).first();

      if (!item) {
        return new Response(JSON.stringify({ success: false, error: 'Item not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      if (ctx?.waitUntil) {
        ctx.waitUntil(env.ROOH_KV_CACHE.put(cacheKey, JSON.stringify(item), { expirationTtl: 3600 }));
      }

      return new Response(JSON.stringify({ success: true, data: item, source: 'd1_db' }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          ...corsHeaders,
        },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }

  // --- POST /ai/api/v1/upload (Secure Cloudflare R2 Upload) ---
  if (path === '/ai/api/v1/upload' && request.method === 'POST') {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return new Response(JSON.stringify({ success: false, error: 'No file provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const fileStream = file.stream();

      // Put directly into Cloudflare R2 Bucket using Native Worker Binding
      await env.ROOH_R2_BUCKET.put(fileName, fileStream, {
        httpMetadata: {
          contentType: file.type || 'image/png',
          cacheControl: 'public, max-age=31536000, immutable',
        },
      });

      const publicUrl = `https://media.roohpro.com/${fileName}`;

      return new Response(
        JSON.stringify({
          success: true,
          url: publicUrl,
          key: fileName,
          size: file.size,
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }

  // --- POST /ai/api/v1/quota/sync ---
  if (path === '/ai/api/v1/quota/sync' && request.method === 'POST') {
    try {
      const body: any = await request.json();
      if (body?.userId) {
        await env.ROOH_D1_DB.prepare(
          `INSERT INTO user_quotas (user_id, copy_count, updated_at) 
           VALUES (?, ?, ?) 
           ON CONFLICT(user_id) DO UPDATE SET copy_count = ?, updated_at = ?`
        ).bind(body.userId, body.copyCount, body.timestamp, body.copyCount, body.timestamp).run();
      }
    } catch (_) {}

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

/**
 * Handle Dynamic SEO & OpenGraph HTML Injection for Crawlers and Users
 */
async function handleDynamicSeoHtml(
  request: Request,
  env: CloudflareWorkerEnv,
  itemCode: string
): Promise<Response> {
  let item: any = null;
  try {
    item = await env.ROOH_D1_DB.prepare(
      'SELECT * FROM media_items WHERE numeric_code = ? OR id = ? LIMIT 1'
    ).bind(itemCode, itemCode).first();
  } catch (_) {}

  const staticResponse = await fetch(request);
  let html = await staticResponse.text();

  if (item) {
    const title = `${item.title || 'برومبت ذكي'} | منصة Rooh Pro AI`;
    const desc = `${item.description || item.prompt?.slice(0, 160) || ''} - كود البرومبت #${item.numeric_code || itemCode}`;
    const img = item.image_url || 'https://roohpro.com/ai/og-default.png';
    const pageUrl = `https://roohpro.com/ai/item/${item.numeric_code || itemCode}`;

    html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
    html = html.replace(
      '</head>',
      `  <meta name="description" content="${desc}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:width" content="1024">
  <meta property="og:image:height" content="1024">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${img}">
  <link rel="canonical" href="${pageUrl}">
</head>`
    );
  }

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400',
    },
  });
}

/**
 * Handle Dynamic Sitemap XML from D1
 */
async function handleDynamicSitemap(env: CloudflareWorkerEnv): Promise<Response> {
  let results: any[] = [];
  try {
    const queryRes: any = await env.ROOH_D1_DB.prepare(
      'SELECT numeric_code, updated_at FROM media_items ORDER BY created_at DESC'
    ).all();
    results = queryRes.results || [];
  } catch (_) {}

  const baseUrl = 'https://roohpro.com/ai';
  const lastMod = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/#/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/#/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/#/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

  for (const row of results) {
    const code = row.numeric_code;
    const mod = row.updated_at ? row.updated_at.split('T')[0] : lastMod;
    xml += `
  <url>
    <loc>${baseUrl}/item/${code}</loc>
    <lastmod>${mod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  }

  xml += '\n</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
