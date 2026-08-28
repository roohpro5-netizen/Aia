import { MediaItem, AdBanner, WindowId } from '../types';
import { INITIAL_ITEMS, INITIAL_ADS } from '../data/defaultData';
import { storage } from './storage';

/**
 * Rooh Pro AI - Central API & Data Repository Layer
 * Implements Repository Pattern with strict Mock Data Isolation:
 * In local dev (without VITE_USE_LIVE_API=true and PROD=false), fallback mock data is provided.
 * In production or when VITE_USE_LIVE_API is active, all requests strictly query live Cloudflare API endpoints.
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'live_api' | 'kv_cache' | 'local_fallback';
  cachedAt?: string;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://roohpro.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export const isLiveMode = (): boolean => {
  const envUseLive = import.meta.env.VITE_USE_LIVE_API === 'true' || import.meta.env.VITE_USE_LIVE_API === true;
  const isProd = Boolean(import.meta.env.PROD);
  return envUseLive || isProd;
};

export const apiService = {
  /**
   * Fetch portal items for a specific window / category (1-6)
   * Prevents mock data leakage in production
   */
  async fetchPortalData(windowId: string | number | WindowId): Promise<MediaItem[]> {
    const numId = typeof windowId === 'string' ? parseInt(windowId.replace(/\D/g, ''), 10) : windowId;
    const winNum = (numId >= 1 && numId <= 6 ? numId : 1) as WindowId;
    const useLive = isLiveMode();

    if (!useLive) {
      // Used ONLY during offline/isolated local development
      const localItems = storage.getItemsByWindow(winNum);
      if (localItems && localItems.length > 0) {
        return localItems;
      }
      return INITIAL_ITEMS.filter((item) => item.windowId === winNum);
    }

    try {
      const baseApiUrl = import.meta.env.VITE_API_ENDPOINT || '/ai/api/v1';
      const response = await fetch(`${baseApiUrl}/portals/${winNum}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch live portal ${winNum} data`);
      }

      const json = await response.json();
      return json.data || json || [];
    } catch (err) {
      console.warn(`[apiService] Live API request failed for portal ${winNum}. Falling back to cached storage:`, err);
      return storage.getItemsByWindow(winNum);
    }
  },

  /**
   * Fetch all items across all portals
   */
  async fetchAllItems(): Promise<MediaItem[]> {
    const useLive = isLiveMode();

    if (!useLive) {
      const local = storage.getItems();
      return local.length > 0 ? local : INITIAL_ITEMS;
    }

    try {
      const baseApiUrl = import.meta.env.VITE_API_ENDPOINT || '/ai/api/v1';
      const response = await fetch(`${baseApiUrl}/items`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch live items`);
      }

      const json = await response.json();
      const liveItems = json.data || json || [];
      // Cache latest live items in localStorage for offline resilience
      if (Array.isArray(liveItems) && liveItems.length > 0) {
        storage.saveItems(liveItems);
      }
      return liveItems;
    } catch (err) {
      console.warn('[apiService] Live items fetch failed, using local storage cache:', err);
      return storage.getItems();
    }
  },

  /**
   * Fetch single item by numericCode (e.g. "101", "205") or unique ID
   */
  async fetchItemByCode(codeOrId: string): Promise<MediaItem | undefined> {
    const useLive = isLiveMode();

    if (!useLive) {
      return storage.getItemById(codeOrId);
    }

    try {
      const cleanCode = encodeURIComponent(codeOrId.trim());
      const baseApiUrl = import.meta.env.VITE_API_ENDPOINT || '/ai/api/v1';
      const response = await fetch(`${baseApiUrl}/items/${cleanCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const json = await response.json();
        return json.data || json;
      }
    } catch (err) {
      console.warn(`[apiService] Live item lookup failed for ${codeOrId}:`, err);
    }

    // Fallback to local storage cache
    return storage.getItemById(codeOrId);
  },

  /**
   * Save / Create / Update an item via Cloudflare Worker D1 & KV
   */
  async saveItem(item: MediaItem): Promise<MediaItem> {
    // 1. Always update local storage for immediate UI responsiveness
    storage.addItem(item);

    const useLive = isLiveMode();
    if (!useLive) {
      return item;
    }

    try {
      const baseApiUrl = import.meta.env.VITE_API_ENDPOINT || '/ai/api/v1';
      const response = await fetch(`${baseApiUrl}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        console.warn('[apiService] Live item save returned non-200 status:', response.status);
      }
    } catch (err) {
      console.warn('[apiService] Could not sync item to live backend:', err);
    }

    return item;
  },

  /**
   * Delete an item by ID
   */
  async deleteItem(id: string): Promise<boolean> {
    storage.deleteItem(id);

    const useLive = isLiveMode();
    if (!useLive) return true;

    try {
      const baseApiUrl = import.meta.env.VITE_API_ENDPOINT || '/ai/api/v1';
      await fetch(`${baseApiUrl}/items/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      return true;
    } catch (err) {
      console.warn(`[apiService] Delete request failed for ${id}:`, err);
      return false;
    }
  },

  /**
   * Secure Upload to Cloudflare R2 via Edge Worker proxy
   * Prevents exposing AWS/R2 S3 Secret Access Keys in the browser
   */
  async uploadMediaToR2(file: File | Blob, customFilename?: string): Promise<{ success: boolean; url: string; key: string; error?: string }> {
    const fileName = customFilename || (file instanceof File ? file.name : `media_${Date.now()}.png`);
    const sanitizedFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const useLive = isLiveMode();

    if (!useLive) {
      // Local development mock object URL
      const mockUrl = URL.createObjectURL(file);
      return {
        success: true,
        url: mockUrl,
        key: `mock/${sanitizedFileName}`
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', file, sanitizedFileName);
      formData.append('contentType', file.type || 'image/png');

      const baseApiUrl = import.meta.env.VITE_API_ENDPOINT || '/ai/api/v1';
      const response = await fetch(`${baseApiUrl}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        url: result.url || `https://media.roohpro.com/${sanitizedFileName}`,
        key: result.key || sanitizedFileName
      };
    } catch (err: any) {
      console.error('[apiService] Cloudflare R2 upload error:', err);
      return {
        success: false,
        url: '',
        key: '',
        error: err?.message || 'Failed to upload media to Cloudflare R2'
      };
    }
  },

  /**
   * Fetch configured ad banners
   */
  async fetchAds(): Promise<AdBanner[]> {
    const useLive = isLiveMode();
    if (!useLive) {
      const localAds = storage.getAds();
      return localAds.length > 0 ? localAds : INITIAL_ADS;
    }

    try {
      const baseApiUrl = import.meta.env.VITE_API_ENDPOINT || '/ai/api/v1';
      const res = await fetch(`${baseApiUrl}/ads`);
      if (res.ok) {
        const data = await res.json();
        return data.data || data || [];
      }
    } catch (e) {
      console.warn('[apiService] Live ads fetch failed, using stored ads:', e);
    }

    return storage.getAds();
  },

  /**
   * Sync user daily quota consumption with Cloudflare D1
   */
  async syncDailyQuota(userIdentifier: string, copyCount: number): Promise<void> {
    if (!isLiveMode()) return;

    try {
      const baseApiUrl = import.meta.env.VITE_API_ENDPOINT || '/ai/api/v1';
      await fetch(`${baseApiUrl}/quota/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userIdentifier,
          copyCount,
          timestamp: new Date().toISOString()
        })
      });
    } catch (_) {
      // Non-blocking quota sync
    }
  }
};
