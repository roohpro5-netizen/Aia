import React, { useState, useEffect } from 'react';
import {
  Globe,
  FileCode,
  Image as ImageIcon,
  Video,
  FileText,
  Download,
  Copy,
  Check,
  RefreshCw,
  Send,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  Code2
} from 'lucide-react';
import { MediaItem } from '../../types';
import { storage } from '../../services/storage';
import {
  sitemapGenerator,
  SitemapSyncStats,
  BASE_DOMAIN,
  BASE_APP_PATH
} from '../../services/sitemapGenerator';
import { WINDOWS_INFO } from '../../data/defaultData';

export const SitemapManagerView: React.FC = () => {
  const [items, setItems] = useState<MediaItem[]>(() => storage.getItems());
  const [stats, setStats] = useState<SitemapSyncStats>(() =>
    sitemapGenerator.getSavedStats(items.length)
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeXmlPreview, setActiveXmlPreview] = useState<'master' | 'images' | 'videos' | 'robots' | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // Refresh stats
    const current = sitemapGenerator.getSavedStats(items.length);
    setStats(current);
  }, [items.length]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  const setToastMessage = (msg: string | null) => setToast(msg);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('📋 تم نسخ الرابط بنجاح إلى الحافظة');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleManualSyncAndTransmit = async () => {
    setIsSyncing(true);
    try {
      const updatedStats = await sitemapGenerator.syncSitemapsToCloudflareAndMainDomain(items);
      setStats(updatedStats);
      showToast('🚀 تم توليد الخرائط الديناميكية وإرسالها إلى الدومين الرئيسي roohpro.com وسحابة Cloudflare بنجاح');
    } catch (err) {
      showToast('⚠️ حدث تنبيه أثناء الإرسال، تم حفظ الخرائط محلياً');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadXml = (type: 'master' | 'images' | 'videos' | 'robots') => {
    let content = '';
    let filename = '';
    let mimeType = 'application/xml';

    if (type === 'master') {
      content = sitemapGenerator.generateMasterSitemapXml(items);
      filename = 'sitemap.xml';
    } else if (type === 'images') {
      content = sitemapGenerator.generateImageSitemapXml(items);
      filename = 'sitemap-images.xml';
    } else if (type === 'videos') {
      content = sitemapGenerator.generateVideoSitemapXml(items);
      filename = 'sitemap-videos.xml';
    } else if (type === 'robots') {
      content = sitemapGenerator.generateRobotsTxt();
      filename = 'robots.txt';
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`📥 تم تحميل ملف ${filename} بنجاح`);
  };

  const getXmlContent = (type: 'master' | 'images' | 'videos' | 'robots'): string => {
    if (type === 'master') return sitemapGenerator.generateMasterSitemapXml(items);
    if (type === 'images') return sitemapGenerator.generateImageSitemapXml(items);
    if (type === 'videos') return sitemapGenerator.generateVideoSitemapXml(items);
    if (type === 'robots') return sitemapGenerator.generateRobotsTxt();
    return '';
  };

  const videoItemsCount = items.filter(
    (i) => i.windowId === 3 || i.type === 'youtube_video' || !!i.videoUrl
  ).length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-2xl animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Header Banner & Architecture Card */}
      <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Globe className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span>منظومة خرائط الموقع والأرشفة الديناميكية (Dynamic Sitemaps & SEO)</span>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                    Live Auto-Sync
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  الدومين الرئيسي: <span className="text-emerald-400 font-bold">{BASE_DOMAIN}</span> | مسار تطبيق الذكاء الاصطناعي: <span className="text-blue-400 font-bold">{BASE_APP_PATH}/</span>
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              يتم توليد خرائط XML قياسية لمحركات البحث (Google و Bing) تلقائياً لكل صفحة، صورة، وفيديو يتم توليدها في البوابات الست، وحفظها وتحديثها سحابياً في Cloudflare R2 / D1 / KV وإرسالها للأرشفة عبر الدومين الرئيسي.
            </p>
          </div>

          {/* Master Generate & Sync Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleManualSyncAndTransmit}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 px-6 py-3.5 text-xs sm:text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'جارِ التوليد والمزامنة السحابية...' : '⚡ توليد وإرسال الخرائط فوراً إلى roohpro.com'}</span>
            </button>
          </div>
        </div>

        {/* Live Counters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80 mt-6">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>إجمالي الروابط المفهرسة</span>
              <FileCode className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">
              {items.length + 7} <span className="text-[11px] font-normal text-slate-400">صفحة ومسار</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">تتضمن الـ 6 بوابات والرئيسية</div>
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>الصور المندرجة بالأرشفة</span>
              <ImageIcon className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">
              {items.length} <span className="text-[11px] font-normal text-slate-400">صورة R2</span>
            </div>
            <div className="text-[10px] text-blue-400 mt-1">Google Image Schema</div>
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>الفيديوهات والسينما</span>
              <Video className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">
              {videoItemsCount} <span className="text-[11px] font-normal text-slate-400">فيديو 4K</span>
            </div>
            <div className="text-[10px] text-amber-400 mt-1">Google Video Schema</div>
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>حالة المزامنة والاستقبال</span>
              <Cloud className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-base font-black text-emerald-400 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>مفعلة وتعمل</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">
              {new Date(stats.lastGeneratedAt).toLocaleTimeString('ar-SA')}
            </div>
          </div>
        </div>
      </div>

      {/* Sitemaps XML File Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. Master Sitemap XML */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-lg hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <FileCode className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>خريطة الموقع الشاملة (Master Sitemap)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-300">
                    sitemap.xml
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  تضم مسارات البوابات الست وكافة صفحات البرومبتات الفردية
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="truncate text-emerald-400">{BASE_APP_PATH}/sitemap.xml</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => copyToClipboard(`${BASE_APP_PATH}/sitemap.xml`, 'master')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="نسخ الرابط"
              >
                {copiedKey === 'master' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleDownloadXml('master')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="تحميل الملف"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveXmlPreview(activeXmlPreview === 'master' ? null : 'master')}
                className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors"
                title="معاينة كود XML"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Google Images Sitemap */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-lg hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>خريطة صور الذكاء الاصطناعي (Images Sitemap)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-blue-300">
                    sitemap-images.xml
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  تضم صور كافة النوافذ مهيكلة بمعايير Google Image Schemas
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="truncate text-blue-400">{BASE_APP_PATH}/sitemap-images.xml</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => copyToClipboard(`${BASE_APP_PATH}/sitemap-images.xml`, 'images')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="نسخ الرابط"
              >
                {copiedKey === 'images' ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleDownloadXml('images')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="تحميل الملف"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveXmlPreview(activeXmlPreview === 'images' ? null : 'images')}
                className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-colors"
                title="معاينة كود XML"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Google Videos Sitemap */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-lg hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>خريطة الفيديو والسينما (Videos Sitemap)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-300">
                    sitemap-videos.xml
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  تضم مقاطع البوابة 3 ومشغلات الفيديو الآمنة مع بيانات Schema
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="truncate text-amber-400">{BASE_APP_PATH}/sitemap-videos.xml</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => copyToClipboard(`${BASE_APP_PATH}/sitemap-videos.xml`, 'videos')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="نسخ الرابط"
              >
                {copiedKey === 'videos' ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleDownloadXml('videos')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="تحميل الملف"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveXmlPreview(activeXmlPreview === 'videos' ? null : 'videos')}
                className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors"
                title="معاينة كود XML"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Robots.txt */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-lg hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>ملف توجيه العناكب (Robots.txt)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-purple-300">
                    robots.txt
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  توجيه روبوتات محركات البحث مباشرة إلى فهارس الدومين الرئيسي
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="truncate text-purple-400">{BASE_APP_PATH}/robots.txt</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => copyToClipboard(`${BASE_APP_PATH}/robots.txt`, 'robots')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="نسخ الرابط"
              >
                {copiedKey === 'robots' ? <Check className="w-3.5 h-3.5 text-purple-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleDownloadXml('robots')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="تحميل الملف"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveXmlPreview(activeXmlPreview === 'robots' ? null : 'robots')}
                className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-colors"
                title="معاينة كود Robots"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Live XML Code Viewer Modal / Drawer */}
      {activeXmlPreview && (
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-slate-950 p-5 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-400" />
              <h5 className="text-sm font-bold text-white">
                معاينة كود {activeXmlPreview.toUpperCase()} المباشر
              </h5>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(getXmlContent(activeXmlPreview), 'preview')}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-200 font-bold transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ الكود الكامل</span>
              </button>
              <button
                onClick={() => setActiveXmlPreview(null)}
                className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                إغلاق
              </button>
            </div>
          </div>

          <pre className="max-h-72 overflow-y-auto rounded-xl bg-slate-900 p-4 font-mono text-xs text-emerald-300 border border-slate-800 leading-relaxed select-all" dir="ltr">
            {getXmlContent(activeXmlPreview)}
          </pre>
        </div>
      )}

      {/* Indexable Items Audit Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>سجل الصفحات والوسائط المفهرسة ديناميكياً</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-emerald-400">
                {items.length} عنصر مفهرس
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              كل عنصر يملك مساراً مخصصاً برقم الكود مع أرشفة الصور في Cloudflare R2
            </p>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-800">
          <table className="w-full text-right text-xs">
            <thead className="sticky top-0 bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="p-3">كود العنصر</th>
                <th className="p-3">البوابة</th>
                <th className="p-3">العنوان والوصف</th>
                <th className="p-3">المسار على roohpro.com/ai</th>
                <th className="p-3">النوع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {items.slice(0, 30).map((item) => {
                const code = item.numericCode || item.id;
                const portalInfo = WINDOWS_INFO[item.windowId];
                const isVideo = item.windowId === 3 || !!item.videoUrl;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-400">#{code}</td>
                    <td className="p-3">
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-200">
                        بوابة {item.windowId}
                      </span>
                    </td>
                    <td className="p-3 max-w-[220px] truncate text-white font-medium">
                      {item.title}
                    </td>
                    <td className="p-3 font-mono text-blue-400 text-[11px] truncate max-w-[260px]">
                      {BASE_APP_PATH}/item/{code}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          isVideo
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {isVideo ? 'فيديو' : 'صورة'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
