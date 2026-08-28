import { MediaItem, AdBanner, DevSettings, WindowId } from '../types';
import { INITIAL_ITEMS, INITIAL_ADS, INITIAL_DEV_SETTINGS } from '../data/defaultData';
import { cloudflareService } from './cloudflareService';
import { sitemapGenerator } from './sitemapGenerator';

const STORAGE_KEYS = {
  ITEMS: 'media_hub_items_v2',
  DRAFTS: 'media_hub_drafts_v2',
  ADS: 'media_hub_ads_v2',
  DEV_SETTINGS: 'media_hub_dev_settings_v2',
  SECRET_UNLOCKED: 'media_hub_secret_unlocked'
};

export const storage = {
  getItems(): MediaItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (!data) {
        const useLive = import.meta.env.VITE_USE_LIVE_API === 'true' || import.meta.env.PROD;
        if (useLive) {
          // In production or live mode, do NOT seed mock items
          return [];
        }
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
        return INITIAL_ITEMS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading items from localStorage:', e);
      return [];
    }
  },

  getItemsByWindow(windowId: WindowId): MediaItem[] {
    const all = this.getItems();
    return all.filter((item) => item.windowId === windowId);
  },

  getItemById(idOrCode: string): MediaItem | undefined {
    const all = this.getItems();
    const cleanQuery = idOrCode.trim().toLowerCase().replace(/^#\/?(item\/)?/, '').replace(/^item-/, '');
    return all.find((item) => {
      if (item.id.toLowerCase() === cleanQuery) return true;
      if (item.numericCode && item.numericCode.toLowerCase() === cleanQuery) return true;
      // Also match auto-derived 3-4 digit code like 101, 203, 301, 401
      const match = item.id.match(/w(\d+)-item-(\d+)/i);
      if (match) {
        const derived3Digit = `${match[1]}${parseInt(match[2], 10) < 10 ? '0' : ''}${match[2]}`;
        const derivedSimple = `${match[1]}${match[2]}`;
        if (derived3Digit === cleanQuery || derivedSimple === cleanQuery) return true;
      }
      return false;
    });
  },

  saveItems(items: MediaItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving items to localStorage:', e);
    }
  },

  addItem(item: MediaItem) {
    const items = this.getItems();
    const updated = [item, ...items.filter((i) => i.id !== item.id)];
    this.saveItems(updated);
    // Background async sync to Cloudflare R2, D1, and KV
    try {
      cloudflareService.syncItemToCloudflareR2D1KV(item).catch((err) => {
        console.warn('Cloudflare auto-sync notice:', err);
      });
      sitemapGenerator.syncSitemapsToCloudflareAndMainDomain(updated).catch((err) => {
        console.warn('Sitemap auto-sync notice:', err);
      });
    } catch (_) {}
    return updated;
  },

  addMultipleItems(newItems: MediaItem[]) {
    const items = this.getItems();
    const newIds = new Set(newItems.map((n) => n.id));
    const updated = [...newItems, ...items.filter((i) => !newIds.has(i.id))];
    this.saveItems(updated);
    // Background async sync each item to Cloudflare
    newItems.forEach((item) => {
      try {
        cloudflareService.syncItemToCloudflareR2D1KV(item).catch((err) => {
          console.warn('Cloudflare auto-sync notice:', err);
        });
      } catch (_) {}
    });
    try {
      sitemapGenerator.syncSitemapsToCloudflareAndMainDomain(updated).catch((err) => {
        console.warn('Sitemap auto-sync notice:', err);
      });
    } catch (_) {}
    return updated;
  },

  updateItem(id: string, updates: Partial<MediaItem>) {
    const items = this.getItems();
    const updated = items.map((item) => (item.id === id ? { ...item, ...updates } : item));
    this.saveItems(updated);
    try {
      sitemapGenerator.syncSitemapsToCloudflareAndMainDomain(updated).catch(() => {});
    } catch (_) {}
    return updated;
  },

  deleteItem(id: string) {
    const items = this.getItems();
    const updated = items.filter((item) => item.id !== id);
    this.saveItems(updated);
    try {
      sitemapGenerator.syncSitemapsToCloudflareAndMainDomain(updated).catch(() => {});
    } catch (_) {}
    return updated;
  },

  clearAllItemsForWindow(windowId: WindowId) {
    const items = this.getItems();
    const updated = items.filter((item) => item.windowId !== windowId);
    this.saveItems(updated);
    return updated;
  },

  wipeAllTestItems() {
    this.saveItems([]);
    return [];
  },

  // ==========================================
  // Developer Staging & Approval Drafts System
  // ==========================================

  getDraftItems(): MediaItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRAFTS);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading drafts from localStorage:', e);
      return [];
    }
  },

  getDraftItemsByWindow(windowId: WindowId): MediaItem[] {
    const all = this.getDraftItems();
    return all.filter((item) => item.windowId === windowId);
  },

  saveDraftItems(drafts: MediaItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
    } catch (e) {
      console.error('Error saving drafts to localStorage:', e);
    }
  },

  addDraftItems(newDrafts: MediaItem[]) {
    const existing = this.getDraftItems();
    const draftIds = new Set(newDrafts.map((d) => d.id));
    const updated = [...newDrafts, ...existing.filter((d) => !draftIds.has(d.id))];
    this.saveDraftItems(updated);
    return updated;
  },

  approveDraftItem(draftId: string): { publishedItem?: MediaItem; remainingDrafts: MediaItem[] } {
    const drafts = this.getDraftItems();
    const itemToApprove = drafts.find((d) => d.id === draftId);
    const remainingDrafts = drafts.filter((d) => d.id !== draftId);
    this.saveDraftItems(remainingDrafts);

    if (itemToApprove) {
      this.addItem(itemToApprove);
      return { publishedItem: itemToApprove, remainingDrafts };
    }
    return { remainingDrafts };
  },

  approveAllDraftsForWindow(windowId: WindowId): { approvedCount: number; publishedItems: MediaItem[] } {
    const drafts = this.getDraftItems();
    const forThisWindow = drafts.filter((d) => d.windowId === windowId);
    const remainingDrafts = drafts.filter((d) => d.windowId !== windowId);

    if (forThisWindow.length > 0) {
      this.addMultipleItems(forThisWindow);
      this.saveDraftItems(remainingDrafts);
    }

    return { approvedCount: forThisWindow.length, publishedItems: forThisWindow };
  },

  rejectDraftItem(draftId: string): MediaItem[] {
    const drafts = this.getDraftItems();
    const updated = drafts.filter((d) => d.id !== draftId);
    this.saveDraftItems(updated);
    return updated;
  },

  clearAllDraftsForWindow(windowId: WindowId): MediaItem[] {
    const drafts = this.getDraftItems();
    const updated = drafts.filter((d) => d.windowId !== windowId);
    this.saveDraftItems(updated);
    return updated;
  },

  incrementView(id: string) {
    const items = this.getItems();
    const updated = items.map((item) => (item.id === id ? { ...item, views: (item.views || 0) + 1 } : item));
    this.saveItems(updated);
  },

  incrementCopy(id: string) {
    const items = this.getItems();
    const updated = items.map((item) => (item.id === id ? { ...item, copies: (item.copies || 0) + 1 } : item));
    this.saveItems(updated);
  },

  getAds(): AdBanner[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(INITIAL_ADS));
        return INITIAL_ADS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading ads from localStorage:', e);
      return INITIAL_ADS;
    }
  },

  saveAds(ads: AdBanner[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
    } catch (e) {
      console.error('Error saving ads to localStorage:', e);
    }
  },

  addAd(ad: AdBanner) {
    const ads = this.getAds();
    const updated = [ad, ...ads];
    this.saveAds(updated);
    return updated;
  },

  updateAd(id: string, updates: Partial<AdBanner>) {
    const ads = this.getAds();
    const updated = ads.map((ad) => (ad.id === id ? { ...ad, ...updates } : ad));
    this.saveAds(updated);
    return updated;
  },

  deleteAd(id: string) {
    const ads = this.getAds();
    const updated = ads.filter((ad) => ad.id !== id);
    this.saveAds(updated);
    return updated;
  },

  getDevSettings(): DevSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEV_SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.DEV_SETTINGS, JSON.stringify(INITIAL_DEV_SETTINGS));
        return INITIAL_DEV_SETTINGS;
      }
      return { ...INITIAL_DEV_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.error('Error reading dev settings from localStorage:', e);
      return INITIAL_DEV_SETTINGS;
    }
  },

  saveDevSettings(settings: DevSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.DEV_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving dev settings to localStorage:', e);
    }
  },

  resetAllToDefault() {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(INITIAL_ADS));
    localStorage.setItem(STORAGE_KEYS.DEV_SETTINGS, JSON.stringify(INITIAL_DEV_SETTINGS));
    return {
      items: INITIAL_ITEMS,
      ads: INITIAL_ADS,
      settings: INITIAL_DEV_SETTINGS
    };
  }
};
