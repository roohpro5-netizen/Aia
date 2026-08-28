import { AdNetworkSettings } from '../types';
import { storage } from './storage';
import { apiService } from './apiService';

const AD_STATS_KEY = 'media_hub_ad_stats_v3';
const DAILY_FREE_LIMIT = 5;
const DEFAULT_COOLDOWN_SECONDS = 60; // Strict minimum 1 minute (60s) between ANY ad

interface AdStats {
  copyCount: number;
  totalAdsShown: number;
  appOpenAdsShown: number;
  navigationAdsShown: number;
  rewardedAdsShown: number;
  dailyCopiesUsed: number;
  lastResetDate: string; // YYYY-MM-DD
  lastGlobalAdTimestamp: number; // Timestamp of ANY ad shown (App Open, Navigation, Rewarded)
  lastRewardedAdTimestamp: number;
  currentNetwork: 'monetag' | 'adsterra';
  userId: string;
}

export const adManager = {
  getStats(): AdStats {
    const today = new Date().toISOString().split('T')[0];
    try {
      const data = localStorage.getItem(AD_STATS_KEY);
      if (data) {
        const parsed: AdStats = JSON.parse(data);
        // If it's a new day, auto-reset daily copies count
        if (parsed.lastResetDate !== today) {
          parsed.dailyCopiesUsed = 0;
          parsed.lastResetDate = today;
          this.saveStats(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error reading ad stats:', e);
    }

    const initial: AdStats = {
      copyCount: 0,
      totalAdsShown: 0,
      appOpenAdsShown: 0,
      navigationAdsShown: 0,
      rewardedAdsShown: 0,
      dailyCopiesUsed: 0,
      lastResetDate: today,
      lastGlobalAdTimestamp: 0,
      lastRewardedAdTimestamp: 0,
      currentNetwork: 'monetag',
      userId: `usr_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`
    };
    this.saveStats(initial);
    return initial;
  },

  saveStats(stats: AdStats) {
    try {
      localStorage.setItem(AD_STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('Error saving ad stats:', e);
    }
  },

  /**
   * Determine active network (Monetag vs Adsterra) with smart alternation
   */
  getChosenNetwork(settings: AdNetworkSettings): 'monetag' | 'adsterra' {
    if (settings.activeNetwork === 'adsterra') return 'adsterra';
    if (settings.activeNetwork === 'monetag') return 'monetag';

    // Auto-switch mode: Alternates smartly based on total ads shown
    const stats = this.getStats();
    const switchFreq = Math.max(1, settings.switchFrequency || 1);
    const cycleIndex = Math.floor(stats.totalAdsShown / switchFreq) % 2;
    return cycleIndex === 0 ? 'monetag' : 'adsterra';
  },

  /**
   * Universal cooldown check: Ensures at least 60 seconds (or configured duration >= 60s)
   * elapsed since ANY ad was shown across the platform.
   */
  isGlobalCooldownPassed(minSeconds: number = DEFAULT_COOLDOWN_SECONDS): boolean {
    const stats = this.getStats();
    if (!stats.lastGlobalAdTimestamp || stats.lastGlobalAdTimestamp === 0) {
      return true;
    }
    const elapsedMs = Date.now() - stats.lastGlobalAdTimestamp;
    const requiredMs = Math.max(60, minSeconds) * 1000;
    return elapsedMs >= requiredMs;
  },

  /**
   * Returns remaining cooldown in seconds until next ad is permissible
   */
  getRemainingCooldownSeconds(minSeconds: number = DEFAULT_COOLDOWN_SECONDS): number {
    const stats = this.getStats();
    if (!stats.lastGlobalAdTimestamp || stats.lastGlobalAdTimestamp === 0) {
      return 0;
    }
    const elapsedMs = Date.now() - stats.lastGlobalAdTimestamp;
    const requiredMs = Math.max(60, minSeconds) * 1000;
    if (elapsedMs >= requiredMs) return 0;
    return Math.ceil((requiredMs - elapsedMs) / 1000);
  },

  /**
   * Check if App Open Ad should be triggered on app launch
   */
  shouldShowAppOpenAd(adSettings?: AdNetworkSettings): { shouldShow: boolean; activeNetwork: 'monetag' | 'adsterra' } {
    const devSettings = storage.getDevSettings();
    const settings = adSettings || devSettings.adNetworks;

    // 1. Global kill switch check
    if (!settings || settings.globalAdsEnabled === false || settings.appOpenAdEnabled === false) {
      return { shouldShow: false, activeNetwork: 'monetag' };
    }

    const chosenNetwork = this.getChosenNetwork(settings);
    const minCooldown = settings.minCooldownSeconds || DEFAULT_COOLDOWN_SECONDS;

    // Check 60s cooldown
    if (!this.isGlobalCooldownPassed(minCooldown)) {
      return { shouldShow: false, activeNetwork: chosenNetwork };
    }

    return { shouldShow: true, activeNetwork: chosenNetwork };
  },

  /**
   * Check if Navigation Interstitial Ad should be triggered when moving between pages/portals
   */
  shouldShowNavigationAd(adSettings?: AdNetworkSettings): { shouldShow: boolean; activeNetwork: 'monetag' | 'adsterra' } {
    const devSettings = storage.getDevSettings();
    const settings = adSettings || devSettings.adNetworks;

    // 1. Global kill switch check
    if (!settings || settings.globalAdsEnabled === false || settings.navigationAdEnabled === false) {
      return { shouldShow: false, activeNetwork: 'monetag' };
    }

    const chosenNetwork = this.getChosenNetwork(settings);
    const minCooldown = settings.minCooldownSeconds || DEFAULT_COOLDOWN_SECONDS;

    // Strict 1-minute (60s) cooldown check between any ads
    if (!this.isGlobalCooldownPassed(minCooldown)) {
      return { shouldShow: false, activeNetwork: chosenNetwork };
    }

    return { shouldShow: true, activeNetwork: chosenNetwork };
  },

  /**
   * Determine if a rewarded ad should be shown before copying a prompt:
   * 1. If master kill switch disabled, return false
   * 2. If daily quota (5 copies) exhausted OR cooldown passed (min 60s)
   */
  shouldShowRewardedAd(adSettings?: AdNetworkSettings): { shouldShow: boolean; activeNetwork: 'monetag' | 'adsterra'; isQuotaExceeded: boolean } {
    const devSettings = storage.getDevSettings();
    const settings = adSettings || devSettings.adNetworks;

    // 1. Kill Switch Check
    if (!settings || settings.globalAdsEnabled === false || settings.rewardedAdEnabled === false) {
      return { shouldShow: false, activeNetwork: 'monetag', isQuotaExceeded: false };
    }

    const stats = this.getStats();
    const remaining = this.getRemainingDailyCopies();
    const isQuotaExceeded = remaining <= 0;
    const chosenNetwork = this.getChosenNetwork(settings);

    // If quota exceeded, require rewarded ad
    if (isQuotaExceeded) {
      return { shouldShow: true, activeNetwork: chosenNetwork, isQuotaExceeded: true };
    }

    // Cooldown check (min 60s)
    const minCooldown = settings.minCooldownSeconds || DEFAULT_COOLDOWN_SECONDS;
    const cooldownPassed = this.isGlobalCooldownPassed(minCooldown);

    if (stats.dailyCopiesUsed >= 3 && cooldownPassed) {
      return { shouldShow: true, activeNetwork: chosenNetwork, isQuotaExceeded: false };
    }

    return { shouldShow: false, activeNetwork: chosenNetwork, isQuotaExceeded: false };
  },

  /**
   * Get remaining free copies for today
   */
  getRemainingDailyCopies(): number {
    const stats = this.getStats();
    return Math.max(0, DAILY_FREE_LIMIT - stats.dailyCopiesUsed);
  },

  /**
   * Record that an ad was shown (updates global 60s timestamp and network rotation counter)
   */
  recordAdShown(type: 'app_open' | 'navigation' | 'rewarded', network: 'monetag' | 'adsterra') {
    const stats = this.getStats();
    const now = Date.now();

    const updated: AdStats = {
      ...stats,
      totalAdsShown: stats.totalAdsShown + 1,
      appOpenAdsShown: type === 'app_open' ? stats.appOpenAdsShown + 1 : stats.appOpenAdsShown,
      navigationAdsShown: type === 'navigation' ? stats.navigationAdsShown + 1 : stats.navigationAdsShown,
      rewardedAdsShown: type === 'rewarded' ? stats.rewardedAdsShown + 1 : stats.rewardedAdsShown,
      lastGlobalAdTimestamp: now,
      lastRewardedAdTimestamp: type === 'rewarded' ? now : stats.lastRewardedAdTimestamp,
      currentNetwork: network === 'monetag' ? 'adsterra' : 'monetag' // alternate
    };

    this.saveStats(updated);
  },

  /**
   * Record prompt copy execution and decrement / increment counters
   */
  recordCopyExecuted(isRewarded: boolean = false) {
    const stats = this.getStats();
    const now = Date.now();
    const updated: AdStats = {
      ...stats,
      copyCount: stats.copyCount + 1,
      dailyCopiesUsed: isRewarded ? Math.max(0, stats.dailyCopiesUsed) : stats.dailyCopiesUsed + 1,
      lastRewardedAdTimestamp: isRewarded ? now : stats.lastRewardedAdTimestamp,
      lastGlobalAdTimestamp: isRewarded ? now : stats.lastGlobalAdTimestamp
    };
    this.saveStats(updated);

    // Background sync to Cloudflare D1
    apiService.syncDailyQuota(updated.userId, updated.dailyCopiesUsed).catch(() => {});
  },

  /**
   * Reward user with bonus attempts after watching an ad
   */
  rewardUserBonusAttempts(bonusCount: number = 3) {
    const stats = this.getStats();
    const updated: AdStats = {
      ...stats,
      dailyCopiesUsed: Math.max(0, stats.dailyCopiesUsed - bonusCount),
      lastRewardedAdTimestamp: Date.now(),
      lastGlobalAdTimestamp: Date.now()
    };
    this.saveStats(updated);
    apiService.syncDailyQuota(updated.userId, updated.dailyCopiesUsed).catch(() => {});
  }
};
