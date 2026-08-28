/**
 * Rooh AI Platform - Cloudflare Worker Entry Point
 * Database (D1), Cache (KV), Storage (R2), and Gemini AI Server
 */

export interface Env {
  ROOH_STORAGE_R2?: any;
  ROOH_BUCKET?: any;
  roohme?: any;
  rooh_reviews_bucket?: any;
  ROOH_D1_DATABASE?: any;
  h?: any;
  ROOH_KV_CACHE?: any;
  ROOH_KV?: any;
  GEMINI_API_KEY?: string;
  ADMIN_EMAIL?: string;
  DEV_ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  BASE_DOMAIN?: string;
  VITE_BASE_DOMAIN?: string;
  APP_BASE_PATH?: string;
  ENVIRONMENT?: string;
  ASSETS?: any;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Rooh-Admin',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...headers,
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle Preflight CORS Requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Dynamic Binding Resolution with Aliases
    const d1Db = env.ROOH_D1_DATABASE || env.h;
    const kvCache = env.ROOH_KV_CACHE || env.ROOH_KV;
    const r2Storage = env.ROOH_STORAGE_R2 || env.ROOH_BUCKET || env.roohme || env.rooh_reviews_bucket;

    // 1. Health Check Endpoint
    if (path.endsWith('/api/health') || path.endsWith('/ai/api/health')) {
      return jsonResponse({
        status: 'healthy',
        platform: 'Cloudflare Worker',
        timestamp: Date.now(),
        environment: env.ENVIRONMENT || 'production',
        bindings: {
          d1: !!d1Db,
          r2: !!r2Storage,
          kv: !!kvCache,
          gemini: !!env.GEMINI_API_KEY,
        },
      });
    }

    // 2. D1 SQL Database Items API
    if (path.includes('/api/items') || path.includes('/ai/api/items')) {
      if (d1Db) {
        try {
          if (request.method === 'GET') {
            const windowId = url.searchParams.get('windowId');
            let query = 'SELECT * FROM media_items';
            if (windowId) {
              query += ' WHERE windowId = ?';
              const { results } = await d1Db.prepare(query).bind(parseInt(windowId, 10)).all();
              return jsonResponse({ success: true, count: results.length, data: results });
            }
            const { results } = await d1Db.prepare(query + ' ORDER BY sortOrder ASC, createdAt DESC').all();
            return jsonResponse({ success: true, count: results.length, data: results });
          }

          if (request.method === 'POST') {
            const body = (await request.json()) as any;
            const id = body.id || `item_${Date.now()}`;
            await d1Db
              .prepare(
                'INSERT OR REPLACE INTO media_items (id, windowId, title, prompt, url, createdAt, views, numericCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
              )
              .bind(
                id,
                body.windowId || 1,
                body.title || 'Untitled Prompt',
                body.prompt || '',
                body.url || '',
                body.createdAt || Date.now(),
                body.views || 0,
                body.numericCode || Math.floor(100 + Math.random() * 900)
              )
              .run();
            return jsonResponse({ success: true, id, message: 'Item saved successfully to D1' });
          }
        } catch (err: any) {
          return jsonResponse({ error: 'D1 operation error', details: err.message }, 500);
        }
      }
      return jsonResponse({ message: 'D1 not configured; using local fallback' });
    }

    // 3. R2 Media Storage Upload & Read Handler
    if (path.includes('/api/storage') || path.includes('/ai/api/storage')) {
      if (r2Storage) {
        try {
          const key = url.searchParams.get('key');
          if (request.method === 'GET' && key) {
            const object = await r2Storage.get(key);
            if (!object) {
              return jsonResponse({ error: 'Object not found in R2' }, 404);
            }
            const headers = new Headers();
            object.writeHttpMetadata?.(headers);
            headers.set('etag', object.httpEtag);
            headers.set('Access-Control-Allow-Origin', '*');
            return new Response(object.body, { headers });
          }

          if (request.method === 'POST') {
            const data = await request.arrayBuffer();
            let uploadKey = url.searchParams.get('key');
            if (!uploadKey) {
              uploadKey = `media_${Date.now()}`;
            }
            await r2Storage.put(uploadKey, data, {
              httpMetadata: { contentType: request.headers.get('content-type') || 'application/octet-stream' },
            });
            const publicUrl = `https://roohpro.com/ai/api/storage?key=${uploadKey}`;
            return jsonResponse({ success: true, key: uploadKey, url: publicUrl, message: 'File uploaded to R2 successfully' });
          }
        } catch (err: any) {
          return jsonResponse({ error: 'R2 storage error', details: err.message }, 500);
        }
      }
      return jsonResponse({ error: 'R2 bucket binding is not configured' }, 503);
    }

    // 4. KV Cache Prompt/Sitemap Handler
    if (path.includes('/api/kv') || path.includes('/ai/api/kv')) {
      if (kvCache) {
        try {
          const cacheKey = url.searchParams.get('key');
          if (request.method === 'GET' && cacheKey) {
            const value = await kvCache.get(cacheKey);
            return jsonResponse({ success: true, key: cacheKey, data: value ? JSON.parse(value) : null });
          }
          if (request.method === 'POST') {
            const body = (await request.json()) as any;
            if (body.key && body.value) {
              const ttl = body.ttl || 86400; // 24 hours default
              await kvCache.put(body.key, JSON.stringify(body.value), { expirationTtl: ttl });
              return jsonResponse({ success: true, message: 'Cached in KV successfully' });
            }
          }
        } catch (err: any) {
          return jsonResponse({ error: 'KV cache error', details: err.message }, 500);
        }
      }
      return jsonResponse({ error: 'KV Cache is not configured' }, 503);
    }

    // 5. Sitemap Dynamic Edge Generation
    if (path.endsWith('/sitemap.xml') || path.endsWith('/ai/sitemap.xml')) {
      let dynamicUrls = `<url><loc>https://roohpro.com/ai</loc><priority>1.0</priority></url>`;
      if (d1Db) {
        try {
          const { results } = await d1Db.prepare('SELECT id, numericCode FROM media_items LIMIT 500').all();
          if (results && results.length > 0) {
            dynamicUrls += results
              .map(
                (item: any) =>
                  `<url><loc>https://roohpro.com/ai/gallery/${item.numericCode || item.id}</loc><priority>0.8</priority></url>`
              )
              .join('\n');
          }
        } catch (_) {}
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${dynamicUrls}
</urlset>`;
      return new Response(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 6. Gemini AI Proxy Endpoint
    if (path.includes('/api/gemini') || path.includes('/ai/api/gemini')) {
      if (request.method !== 'POST') {
        return jsonResponse({ error: 'Method not allowed' }, 405);
      }
      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return jsonResponse({ error: 'Gemini API key is not configured on Cloudflare worker' }, 500);
      }

      try {
        const payload = await request.json();
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const aiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await aiResponse.json();
        return jsonResponse(data, aiResponse.status);
      } catch (err: any) {
        return jsonResponse({ error: 'AI processing failed', details: err.message }, 500);
      }
    }

    // 7. Static Asset Serving Fallback (Pages / Worker Assets)
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    return new Response('Rooh AI Platform Worker Active', { status: 200, headers: CORS_HEADERS });
  },
};
