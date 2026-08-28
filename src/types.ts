export type WindowId = 1 | 2 | 3 | 4 | 5 | 6;

export type MediaType = 'image' | 'youtube_video' | 'analysis' | 'shorts_video' | 'commercial_ad' | 'reverse_vision';

export type APISwitcherSource = 'lexica' | 'civitai' | 'gemini';

export interface AnalysisData {
  detectedElements: string[];
  styleKeywords: string[];
  lighting: string;
  cameraLens?: string;
  colorPalette: string[];
  extractedPrompt: string;
  suggestedVariations: string[];
  confidenceScore: number;
}

export interface MediaItem {
  id: string;
  numericCode?: string; // 3 or 4 digit code (e.g. "101", "205", "301", "401", "501", "601")
  windowId: WindowId;
  type: MediaType;
  title: string;
  description?: string;
  url: string; // Image URL or Poster URL
  videoUrl?: string; // YouTube embed link, MP4 or Shorts link
  prompt: string; // The primary copyable prompt
  negativePrompt?: string;
  model: string; // Midjourney, Flux.1, Runway, Kling, Sora, etc.
  tags: string[];
  aspectRatio?: string; // "1:1", "16:9", "9:16", "4:3"
  parameters?: {
    aspectRatio?: string;
    seed?: number | string;
    cfgScale?: number;
    steps?: number;
    sampler?: string;
    version?: string;
    duration?: string;
    fps?: number;
    motionIntensity?: number;
    commercialProduct?: string;
  };
  analysisData?: AnalysisData;
  views?: number;
  copies?: number;
  createdAt: string;
}

export interface AdBanner {
  id: string;
  title: string;
  sponsorName: string;
  badgeText: string;
  description: string;
  imageUrl?: string;
  targetUrl: string;
  ctaText: string;
  customHtmlCode?: string;
  category?: string;
  impressions?: number;
  clicks?: number;
}

export type AdNetworkProvider = 'monetag' | 'adsterra' | 'auto_switch';

export interface AdNetworkSettings {
  globalAdsEnabled: boolean; // Master kill switch for ALL ads
  appOpenAdEnabled: boolean; // App Open ad on initial app load
  navigationAdEnabled: boolean; // Interstitial ad on page/portal navigation
  rewardedAdEnabled: boolean; // Rewarded ad on copy prompt
  minCooldownSeconds: number; // Minimum wait time between ANY ads (default 60s)
  rewardAdCooldownSeconds: number; // Minimum wait time between rewarded ads
  rewardAdDurationSeconds: number; // Modal countdown duration (e.g. 5s)
  appOpenDurationSeconds: number; // App open ad countdown (e.g. 5s)
  navigationAdDurationSeconds: number; // Navigation ad countdown (e.g. 4s)
  activeNetwork: AdNetworkProvider; // Monetag vs Adsterra vs Auto-switch
  switchFrequency: number; // Switch network every N user interactions/copies
  // Monetag config
  monetagDirectUrl: string;
  monetagScript: string;
  monetagZoneId: string;
  // Adsterra config
  adsterraDirectUrl: string;
  adsterraBannerCode: string;
  adsterraPlacementId: string;
}

export interface DevSettings {
  groqApiKey: string;
  groqModel: string;
  geminiApiKey: string;
  aiBrainJson: string;
  customAdCode350: string;
  customAdCodeBanner: string;
  enableCustomAdCode: boolean;
  activeAdTheme: 'tech' | 'creative' | 'dark' | 'gradient';
  // New Admin Features
  apiSource: APISwitcherSource;
  blacklistWords: string[];
  hiddenPromptInjection: Record<WindowId, string>;
  dailyQuotaLimit: number;
  // Ad Networks & Global Toggle
  adNetworks: AdNetworkSettings;
  // Cloudflare Ecosystem
  cloudflare?: CloudflareConfig;
}

// ==========================================
// Cloudflare Ecosystem Types (R2, D1, KV)
// ==========================================

export interface CloudflareR2Config {
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicDomain: string; // e.g. https://cdn.rooh.media
  endpoint?: string;
  corsEnabled: boolean;
}

export interface CloudflareD1Config {
  databaseId: string;
  databaseName: string;
  syncIntervalMinutes: number;
  autoSync: boolean;
  lastBackupAt?: string;
}

export interface CloudflareKVConfig {
  namespaceId: string;
  namespaceName: string;
  edgeTtlSeconds: number;
  autoCachePrompts: boolean;
}

export interface CloudflareConfig {
  accountId: string;
  apiToken: string;
  zoneId?: string;
  workerUrl?: string; // e.g. https://api.rooh.workers.dev
  isConnected: boolean;
  lastSyncTimestamp?: number;
  r2: CloudflareR2Config;
  d1: CloudflareD1Config;
  kv: CloudflareKVConfig;
}

export interface R2ObjectItem {
  key: string;
  size: number;
  contentType: string;
  uploadedAt: string;
  publicUrl: string;
  etag?: string;
  windowId?: WindowId;
  metadata?: Record<string, string>;
}

export interface D1QueryResult {
  success: boolean;
  query: string;
  results: any[];
  meta: {
    durationMs: number;
    rowsRead: number;
    rowsWritten: number;
    lastRowId?: number;
    changes?: number;
  };
  error?: string;
  timestamp: string;
}

export interface D1TableInfo {
  name: string;
  rowCount: number;
  columns: Array<{ name: string; type: string; pk?: boolean }>;
}

export interface KVEntryItem {
  key: string;
  value: string;
  size: number;
  updatedAt: string;
  ttlSeconds?: number;
  expiresAt?: string;
  metadata?: {
    type: 'json' | 'string' | 'cache' | 'config';
    source?: string;
  };
}

export interface CloudflareTelemetry {
  r2StorageUsedBytes: number;
  r2ObjectCount: number;
  d1TotalRows: number;
  d1DbSizeBytes: number;
  kvKeysCount: number;
  edgeRequests24h: number;
  cacheHitRatio: number;
  avgLatencyMs: number;
  workerHealth: 'healthy' | 'degraded' | 'offline';
}

export interface WindowInfo {
  id: WindowId;
  name: string;
  arabicName: string;
  shortDesc: string;
  fullDesc: string;
  type: MediaType;
  aspectRatioLabel: string;
  badgeColor: string;
  gradient: string;
  iconName: string;
  codeRange: string;
  themeColor: string;
}


