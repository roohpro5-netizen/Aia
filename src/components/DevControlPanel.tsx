import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Key,
  FileJson,
  Upload,
  Download,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Wand2,
  Video,
  Award,
  ShoppingBag,
  ScanEye,
  Layers,
  Code2,
  ExternalLink,
  Megaphone,
  Shield,
  Sliders,
  Database,
  Globe,
  Lock,
  Search,
  Eye,
  Cloud,
  Activity,
  BarChart3,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Zap,
  Check,
  Flame
} from 'lucide-react';
import { MediaItem, AdBanner, DevSettings, WindowId, APISwitcherSource } from '../types';
import { storage } from '../services/storage';
import { DEFAULT_AI_BRAIN_JSON, WINDOWS_INFO, INITIAL_DEV_SETTINGS } from '../data/defaultData';
import { generateAIPromptFromDescription } from '../services/aiService';
import { useAdminConfig } from '../context/AdminConfigContext';
import { getNumericCode } from '../utils/idHelper';
import { AspectRatioSelectorBar } from './AspectRatioSelectorBar';
import { CloudflareEcosystemDashboard } from './cloudflare/CloudflareEcosystemDashboard';
import { PortalConfigView } from './admin/PortalConfigView';
import { LiveAnalyticsView } from './admin/LiveAnalyticsView';
import { ApiStatusBadge } from './admin/ApiStatusBadge';
import { PortalBatchGenerationView } from './admin/PortalBatchGenerationView';
import { FirebaseAuthSettingsView } from './admin/FirebaseAuthSettingsView';
import { SitemapManagerView } from './admin/SitemapManagerView';

interface DevControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUpdated?: () => void;
  onDataChanged?: () => void;
}

export const DevControlPanel: React.FC<DevControlPanelProps> = ({
  isOpen,
  onClose,
  onDataUpdated,
  onDataChanged
}) => {
  // Tabs: 1..6 = The 6 Portal Pages, 7 = Live Analytics, 8 = Cloudflare, 9 = Firebase Auth, 10 = Ad Manager, 11 = AI Brain JSON
  const [activeTab, setActiveTab] = useState<number>(1);

  // Authentication State for /admin route
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('rooh_admin_authenticated') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [items, setItems] = useState<MediaItem[]>(() => storage.getItems());
  const [ads, setAds] = useState<AdBanner[]>(() => storage.getAds());
  const [devSettings, setDevSettings] = useState<DevSettings>(() => storage.getDevSettings());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sub-view within portal tab: 'batch' (5-item daily AI pipeline & approval), 'config' (API status, injection, switcher, blacklist), or 'items' (manual CRUD)
  const [portalSubView, setPortalSubView] = useState<'batch' | 'config' | 'items'>('batch');

  // Form states for adding a new item
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MediaItem>>({
    title: '',
    description: '',
    url: '',
    videoUrl: '',
    prompt: '',
    negativePrompt: '',
    model: 'Midjourney v6.0',
    tags: [],
    aspectRatio: '1:1'
  });
  const [tagsInput, setTagsInput] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  // Form state for adding an Ad
  const [isAddingAd, setIsAddingAd] = useState(false);
  const [adFormData, setAdFormData] = useState<Partial<AdBanner>>({
    title: '',
    sponsorName: '',
    badgeText: 'إعلان مدمج 350×350',
    description: '',
    imageUrl: '',
    targetUrl: 'https://',
    ctaText: 'زيارة الموقع'
  });

  // JSON Brain file editor state
  const [jsonBrainText, setJsonBrainText] = useState(devSettings.aiBrainJson);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Notify parent component about changes
  const notifyDataChanged = () => {
    if (onDataUpdated) onDataUpdated();
    if (onDataChanged) onDataChanged();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!isOpen) return null;

  // Handle password login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passwordInput.trim();
    if (cleanPass === 'admin123' || cleanPass === 'rooh2025' || cleanPass === 'admin') {
      setIsAuthenticated(true);
      localStorage.setItem('rooh_admin_authenticated', 'true');
      setPasswordError(null);
    } else {
      setPasswordError('كلمة المرور غير صحيحة. جرب: admin123 أو rooh2025');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('rooh_admin_authenticated');
  };

  // Helper to get items for specific window
  const getWindowItems = (winId: WindowId) => {
    return items.filter((item) => item.windowId === winId);
  };

  // Open add modal for current active window
  const handleOpenAddModal = (winId: WindowId) => {
    setEditingItemId(null);
    const defaultModel =
      winId === 1
        ? 'Flux.1 Photoreal'
        : winId === 2
        ? 'Midjourney v6.1'
        : winId === 3
        ? 'Runway Gen-3'
        : winId === 4
        ? 'VectorMaster Studio'
        : winId === 5
        ? 'Commercial Studio Ultra'
        : 'Gemini 2.5 Flash Vision';

    setFormData({
      title: '',
      description: '',
      url: '',
      videoUrl: '',
      prompt: '',
      negativePrompt: '',
      model: defaultModel,
      tags: [],
      aspectRatio: '1:1'
    });
    setTagsInput('');
    setIsAddingItem(true);
  };

  // Open edit modal for an item
  const handleEditItem = (item: MediaItem) => {
    setEditingItemId(item.id);
    setFormData({
      title: item.title,
      description: item.description,
      url: item.url,
      videoUrl: item.videoUrl || '',
      prompt: item.prompt,
      negativePrompt: item.negativePrompt || '',
      model: item.model,
      tags: item.tags || [],
      aspectRatio: item.aspectRatio || '1:1'
    });
    setTagsInput(item.tags ? item.tags.join(', ') : '');
    setIsAddingItem(true);
  };

  // Save new or edited item
  const handleSaveItem = () => {
    if (!formData.title?.trim() || !formData.prompt?.trim() || !formData.url?.trim()) {
      showToast('⚠️ يرجى تعبئة العنوان والبرومبت ورابط الصورة');
      return;
    }

    const currentWinId = (activeTab >= 1 && activeTab <= 6 ? activeTab : 1) as WindowId;
    const parsedTags = tagsInput
      .split(/[,،]/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    const isVideoWindow = currentWinId === 3;

    if (editingItemId) {
      // Update existing item
      const updated = storage.updateItem(editingItemId, {
        title: formData.title,
        description: formData.description,
        url: formData.url,
        videoUrl: formData.videoUrl || undefined,
        prompt: formData.prompt,
        negativePrompt: formData.negativePrompt || undefined,
        model: formData.model || 'Midjourney v6.0',
        tags: parsedTags,
        aspectRatio: formData.aspectRatio || '1:1',
        type: isVideoWindow ? 'youtube_video' : 'image'
      });
      setItems(updated);
      showToast('✅ تم تعديل البرومبت بنجاح');
    } else {
      // Create new item
      const newItem: MediaItem = {
        id: `item-${Date.now()}`,
        windowId: currentWinId,
        title: formData.title,
        description: formData.description || formData.title,
        url: formData.url,
        videoUrl: formData.videoUrl || (isVideoWindow ? formData.url : undefined),
        prompt: formData.prompt,
        negativePrompt: formData.negativePrompt || undefined,
        model: formData.model || 'Midjourney v6.0',
        tags: parsedTags.length > 0 ? parsedTags : ['ai', 'masterpiece'],
        aspectRatio: formData.aspectRatio || '1:1',
        type: isVideoWindow ? 'youtube_video' : 'image',
        views: 1,
        copies: 0,
        createdAt: new Date().toISOString()
      };
      const updated = storage.addItem(newItem);
      setItems(updated);
      showToast('✨ تم إضافة عنصر وبرومبت جديد');
    }

    setIsAddingItem(false);
    setEditingItemId(null);
    notifyDataChanged();
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      const updated = storage.deleteItem(id);
      setItems(updated);
      showToast('🗑️ تم حذف العنصر');
      notifyDataChanged();
    }
  };

  // AI Prompt Generation Helper inside Item modal
  const handleAIAssistPrompt = async () => {
    if (!formData.description && !formData.title) {
      showToast('⚠️ يرجى كتابة عنوان أو وصف مختصر أولاً');
      return;
    }
    setIsGeneratingPrompt(true);
    try {
      const query = `${formData.title} - ${formData.description}`;
      const itemType = activeTab === 3 ? 'youtube_video' : 'image';
      const generated = await generateAIPromptFromDescription(itemType, query, devSettings);
      setFormData((prev) => ({
        ...prev,
        prompt: generated
      }));
      showToast('✨ تم توليد برومبت احترافي بالذكاء الاصطناعي');
    } catch (e) {
      showToast('تعذر توليد البرومبت آلياً');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Save Settings
  const handleSaveDevSettings = () => {
    try {
      const parsedBrain = JSON.parse(jsonBrainText);
      const updated = {
        ...devSettings,
        aiBrainJson: JSON.stringify(parsedBrain, null, 2)
      };
      storage.saveDevSettings(updated);
      setDevSettings(updated);
      setJsonError(null);
      showToast('💾 تم حفظ كافة الإعدادات والـ API بنجاح');
      notifyDataChanged();
    } catch (e: any) {
      setJsonError(`خطأ في صيغة الـ JSON: ${e.message}`);
      showToast('❌ خطأ في تنسيق ملف JSON');
    }
  };

  // Import JSON Brain File
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const formatted = JSON.stringify(parsed, null, 2);
        setJsonBrainText(formatted);
        setJsonError(null);
        showToast('📥 تم استيراد وقراءة ملف JSON بنجاح!');
      } catch (err: any) {
        setJsonError('الملف المرفوع ليس بتنسيق JSON صحيح');
        showToast('❌ فشل قراءة ملف JSON');
      }
    };
    reader.readAsText(file);
  };

  // Export JSON Brain
  const handleExportJsonFile = () => {
    const blob = new Blob([jsonBrainText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-brain-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📤 تم تحميل ملف عقل الذكاء الاصطناعي JSON');
  };

  // Reset to default brain
  const handleResetBrainToDefault = () => {
    if (window.confirm('هل تريد استعادة عقل الذكاء الاصطناعي الافتراضي؟')) {
      const def = JSON.stringify(DEFAULT_AI_BRAIN_JSON, null, 2);
      setJsonBrainText(def);
      setJsonError(null);
      showToast('🔄 تمت استعادة عقل الذكاء الاصطناعي الافتراضي');
    }
  };

  // Add custom ad
  const handleSaveAd = () => {
    if (!adFormData.title?.trim()) {
      showToast('⚠️ يرجى كتابة عنوان الإعلان');
      return;
    }
    const newAd: AdBanner = {
      id: `ad-${Date.now()}`,
      title: adFormData.title || '',
      sponsorName: adFormData.sponsorName || 'راعي معتمد',
      badgeText: adFormData.badgeText || 'إعلان مدمج 350×350',
      description: adFormData.description || '',
      imageUrl: adFormData.imageUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
      targetUrl: adFormData.targetUrl || 'https://',
      ctaText: adFormData.ctaText || 'زيارة العرض',
      impressions: 0,
      clicks: 0
    };
    const updated = storage.addAd(newAd);
    setAds(updated);
    setIsAddingAd(false);
    showToast('📢 تم إضافة الإعلان المدمج بنجاح');
    notifyDataChanged();
  };

  const handleDeleteAd = (id: string) => {
    if (window.confirm('حذف هذا الإعلان المدمج؟')) {
      const updated = storage.deleteAd(id);
      setAds(updated);
      showToast('تم حذف الإعلان');
      notifyDataChanged();
    }
  };

  const handleWipeAllTestItems = () => {
    if (window.confirm('⚠️ تحذير نهائي: هل ترغب في مسح وتنظيف كافة العناصر الحالية من جميع البوابات للبدء بصفحة بيضاء؟\n\nيمكنك بعد ذلك التوليد بالنقر على زر (⚡ توليد شامل لجميع البوابات) واعتمادها ونشرها للمستخدمين.')) {
      storage.wipeAllTestItems();
      setItems([]);
      showToast('🗑️ تم تنظيف ومسح كافة العناصر بنجاح - البوابات جاهزة للدفعات الجديدة');
      notifyDataChanged();
    }
  };

  const SIDEBAR_ITEMS = [
    { id: 1, name: 'بوابة 1: الصور الواقعية', icon: <ImageIcon className="w-4 h-4 text-blue-400" />, badge: `${getWindowItems(1).length}` },
    { id: 2, name: 'بوابة 2: الفن الرقمي و 3D', icon: <Wand2 className="w-4 h-4 text-purple-400" />, badge: `${getWindowItems(2).length}` },
    { id: 3, name: 'بوابة 3: الفيديو والسينما 4K', icon: <Video className="w-4 h-4 text-amber-400" />, badge: `${getWindowItems(3).length}` },
    { id: 4, name: 'بوابة 4: الفيكتور والشعارات', icon: <Award className="w-4 h-4 text-emerald-400" />, badge: `${getWindowItems(4).length}` },
    { id: 5, name: 'بوابة 5: الإعلانات والمنتجات', icon: <ShoppingBag className="w-4 h-4 text-rose-400" />, badge: `${getWindowItems(5).length}` },
    { id: 6, name: 'بوابة 6: التحليل البصري (Vision)', icon: <ScanEye className="w-4 h-4 text-cyan-400" />, badge: `${getWindowItems(6).length}` },
    { id: 7, name: 'إحصائيات المنصة الحية (Analytics)', icon: <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />, badge: '5s Live' },
    { id: 8, name: 'سحابة Cloudflare (R2, D1, KV)', icon: <Cloud className="w-4 h-4 text-orange-400" />, badge: 'Ecosystem' },
    { id: 9, name: 'المصادقة وحسابات Firebase', icon: <Flame className="w-4 h-4 text-amber-400" />, badge: 'Auth Ready' },
    { id: 10, name: 'إدارة الإعلانات ومفتاح الإيقاف', icon: <Megaphone className="w-4 h-4 text-yellow-400" />, badge: devSettings.adNetworks?.globalAdsEnabled !== false ? 'ON' : 'OFF' },
    { id: 11, name: 'عقل الـ AI وقاعدة البيانات', icon: <FileJson className="w-4 h-4 text-emerald-400" />, badge: 'JSON' },
    { id: 12, name: 'خرائط الموقع والأرشفة الديناميكية (Sitemaps SEO)', icon: <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />, badge: 'roohpro.com/ai' }
  ];

  return (
    <div
      id="dev-control-panel-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative flex h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl shadow-blue-500/10" dir="rtl">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-xl animate-in slide-in-from-top-4 duration-300">
            <Sparkles className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  لوحة تحكم المطور وإدارة المنصة المتقدمة (Admin Dashboard)
                </h3>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  v2.5 Full-Stack
                </span>
              </div>
              <p className="text-xs text-slate-400">
                إدارة البوابات الست، التوليد والاعتماد اليومي، مفاتيح APIs، الإحصائيات الحية وسحابة Cloudflare و Firebase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={handleWipeAllTestItems}
                  title="مسح وتنظيف كافة العناصر التجريبية"
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">مسح وتنظيف العناصر</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="تسجيل الخروج"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">قفل اللوحة</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PASSWORD PROTECTED LOGIN SCREEN IF NOT AUTHENTICATED */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl space-y-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 mx-auto border border-blue-500/30">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-white">صفحة الإدارة محمية بكلمة مرور</h3>
                <p className="text-xs text-slate-400 mt-1">
                  يرجى إدخال كلمة مرور المطور للدخول إلى لوحة الإدارة والأدوات السحابية
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-right">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    كلمة المرور (Admin Password):
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError(null);
                    }}
                    placeholder="أدخل كلمة المرور (افتراضي: admin123 أو rooh2025)..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none font-mono"
                    dir="ltr"
                    autoFocus
                  />
                </div>

                {passwordError && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-950/80 border border-red-500/40 p-3 text-xs text-red-300 text-right">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-3 text-sm font-black text-white transition-all shadow-lg active:scale-95 border-2 border-yellow-400"
                >
                  <Unlock className="w-4 h-4 text-yellow-300" />
                  <span>فتح لوحة التحكم (Login)</span>
                </button>
              </form>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                <span>تلميح سريع: كلمة المرور الافتراضية هي </span>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordInput('admin123');
                    setIsAuthenticated(true);
                    localStorage.setItem('rooh_admin_authenticated', 'true');
                  }}
                  className="font-mono text-blue-400 underline hover:text-blue-300"
                >
                  admin123
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED DASHBOARD BODY WITH SIDEBAR NAVIGATION (7 Pages + Tools) */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 border-b md:border-b-0 md:border-l border-slate-800 bg-slate-900/60 p-3 flex md:flex-col overflow-x-auto md:overflow-y-auto gap-1.5 shrink-0">
              <span className="text-[11px] font-bold text-slate-500 px-3 py-1 hidden md:block">
                القائمة الرئيسية (7 صفحات):
              </span>

              {SIDEBAR_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all whitespace-nowrap text-right ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-black'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.name}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
              {/* 1..6: PORTAL PAGES (With Daily AI Batch Generation & Approval, API Config & Items CRUD) */}
              {activeTab >= 1 && activeTab <= 6 && (
                <div className="space-y-6">
                  {/* Switch between Batch Generator, API Configuration and Manual Items Management */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPortalSubView('batch')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          portalSubView === 'batch'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        ⚡ توليد 5 عناصر واعتمادها (Daily Pipeline)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPortalSubView('config')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          portalSubView === 'config'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        ⚙️ إعدادات الـ API، الحقن وفلتر الأمان
                      </button>
                      <button
                        type="button"
                        onClick={() => setPortalSubView('items')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          portalSubView === 'items'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        🖼️ إدارة العناصر المنشورة ({getWindowItems(activeTab as WindowId).length})
                      </button>
                    </div>

                    {portalSubView === 'items' && (
                      <button
                        onClick={() => handleOpenAddModal(activeTab as WindowId)}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition-all active:scale-95 border border-yellow-400"
                      >
                        <Plus className="w-3.5 h-3.5 text-yellow-300" />
                        <span>إضافة عنصر يدوي لبوابة {activeTab}</span>
                      </button>
                    )}
                  </div>

                  {/* Subview 0: Batch Generator & Review Staging */}
                  {portalSubView === 'batch' && (
                    <PortalBatchGenerationView
                      windowId={activeTab as WindowId}
                      onDataChanged={() => {
                        setItems(storage.getItems());
                        notifyDataChanged();
                      }}
                      onShowToast={showToast}
                    />
                  )}

                  {/* Subview 1: Full Portal Config (ApiStatusBadge, API Key, Injection, Switcher, Blacklist) */}
                  {portalSubView === 'config' && (
                    <PortalConfigView windowId={activeTab as WindowId} />
                  )}

                  {/* Subview 2: Media Items CRUD Management for this Portal */}
                  {portalSubView === 'items' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getWindowItems(activeTab as WindowId).map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition-all hover:border-slate-700"
                          >
                            <div>
                              <div className="relative mb-3 aspect-square w-full max-w-[240px] mx-auto overflow-hidden rounded-xl bg-slate-950 border border-slate-800">
                                <img
                                  src={item.url}
                                  alt={item.title}
                                  referrerPolicy="no-referrer"
                                  className="h-full w-full object-cover"
                                />
                                <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                                  {item.model}
                                </span>
                                <span className="absolute top-2 right-2 rounded-md bg-yellow-400 text-black px-2 py-0.5 text-[10px] font-black">
                                  #{getNumericCode(item)}
                                </span>
                              </div>

                              <h5 className="font-bold text-sm text-slate-100 line-clamp-1">{item.title}</h5>
                              <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description || item.prompt}</p>

                              <div className="mt-2.5 rounded-lg bg-slate-950/80 p-2 border border-slate-800/80">
                                <p className="text-[11px] font-mono text-emerald-400 line-clamp-2 select-all">
                                  {item.prompt}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                              <span className="text-[10px] text-slate-500">
                                {item.views || 0} مشاهدة • {item.copies || 0} نسخ
                              </span>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleEditItem(item)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                                  title="تعديل"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                                  title="حذف"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 7. LIVE PLATFORM ANALYTICS (7th Page: Real-time 5s interval active users per portal) */}
              {activeTab === 7 && <LiveAnalyticsView />}

              {/* 8. CLOUDFLARE ECOSYSTEM DASHBOARD (R2, D1, KV) */}
              {activeTab === 8 && <CloudflareEcosystemDashboard />}

              {/* 9. FIREBASE AUTH CONFIGURATION & MIGRATION READY */}
              {activeTab === 9 && <FirebaseAuthSettingsView />}

              {/* 10. AD MANAGER & GLOBAL KILL SWITCH */}
              {activeTab === 10 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                        <Megaphone className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">إدارة شبكات الإعلانات والإعلانات بمكافأة (Monetag & Adsterra)</h4>
                        <p className="text-xs text-slate-400">
                          تحكم في تفعيل أو إيقاف جميع الإعلانات، إعلانات المكافأة عند نسخ البرومبت، والتبديل التلقائي بين Monetag و Adsterra.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsAddingAd(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة راعي / إعلان مدمج 350×350</span>
                    </button>
                  </div>

                  {/* Main Kill Switch */}
                  <div className="rounded-2xl bg-gradient-to-r from-red-950/40 to-slate-950 p-4 border-2 border-red-500/30 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-black text-white">
                          زر الإغلاق الشامل لجميع الإعلانات (Global Ads Kill Switch)
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        عند إيقاف هذا الخيار، سيتم تعطيل وإخفاء جميع مساحات الإعلانات المدمجة وإعلانات المكافأة تلقائياً من كامل صفحات وتطبيقات البوابات الست.
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={devSettings.adNetworks?.globalAdsEnabled ?? true}
                        onChange={(e) => {
                          const updated = {
                            ...devSettings,
                            adNetworks: {
                              ...(devSettings.adNetworks || INITIAL_DEV_SETTINGS.adNetworks!),
                              globalAdsEnabled: e.target.checked
                            }
                          };
                          setDevSettings(updated);
                          storage.saveDevSettings(updated);
                          notifyDataChanged();
                          showToast(e.target.checked ? '📢 تم تفعيل الإعلانات' : '🚫 تم إغلاق وتعطيل كافة الإعلانات بالكامل');
                        }}
                        className="peer sr-only"
                      />
                      <div className="h-7 w-12 rounded-full bg-slate-800 peer-checked:bg-emerald-500 after:absolute after:top-[3px] after:left-[3px] after:h-5.5 after:w-5.5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>

                  {/* App Open & Page Navigation Ads Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* App Open Ad Box */}
                    <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-bold text-yellow-300 flex items-center gap-2">
                            <span>🚀 إعلان فتح التطبيق (App Open Ad)</span>
                          </h5>
                          <p className="text-xs text-slate-400 mt-0.5">
                            عرض إعلان كامل الشاشة لمرة واحدة عند تشغيل المنصة (بشرط مرور 60 ثانية).
                          </p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={devSettings.adNetworks?.appOpenAdEnabled ?? true}
                            onChange={(e) => {
                              const updated = {
                                ...devSettings,
                                adNetworks: {
                                  ...(devSettings.adNetworks || INITIAL_DEV_SETTINGS.adNetworks!),
                                  appOpenAdEnabled: e.target.checked
                                }
                              };
                              setDevSettings(updated);
                              storage.saveDevSettings(updated);
                              notifyDataChanged();
                            }}
                            className="peer sr-only"
                          />
                          <div className="h-6 w-11 rounded-full bg-slate-800 peer-checked:bg-yellow-500 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                        </label>
                      </div>
                    </div>

                    {/* Page Navigation Ad Box */}
                    <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-bold text-blue-300 flex items-center gap-2">
                            <span>🔄 إعلان الانتقال بين الصفحات (Page Transition)</span>
                          </h5>
                          <p className="text-xs text-slate-400 mt-0.5">
                            عرض إعلان بيني عند التنقل بين البوابات والصفحات كل دقيقة كحد أدنى.
                          </p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={devSettings.adNetworks?.navigationAdEnabled ?? true}
                            onChange={(e) => {
                              const updated = {
                                ...devSettings,
                                adNetworks: {
                                  ...(devSettings.adNetworks || INITIAL_DEV_SETTINGS.adNetworks!),
                                  navigationAdEnabled: e.target.checked
                                }
                              };
                              setDevSettings(updated);
                              storage.saveDevSettings(updated);
                              notifyDataChanged();
                            }}
                            className="peer sr-only"
                          />
                          <div className="h-6 w-11 rounded-full bg-slate-800 peer-checked:bg-blue-500 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Cooldown and Network Switching Rules */}
                  <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                          <span>⏱️ قواعد التهدئة والتبديل الذكي بين Monetag و Adsterra</span>
                        </h5>
                        <p className="text-xs text-slate-400 mt-0.5">
                          تحديد الفاصل الزمني الإلزامي بين أي إعلان والآخر (الحد الأدنى 60 ثانية لحماية تجربة المستخدم).
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          الحد الأدنى للتهدئة العامة (ثوانٍ):
                        </label>
                        <input
                          type="number"
                          min={60}
                          max={300}
                          value={devSettings.adNetworks?.minCooldownSeconds ?? 60}
                          onChange={(e) => {
                            const val = Math.max(60, parseInt(e.target.value, 10) || 60);
                            const updated = {
                              ...devSettings,
                              adNetworks: {
                                ...(devSettings.adNetworks || INITIAL_DEV_SETTINGS.adNetworks!),
                                minCooldownSeconds: val
                              }
                            };
                            setDevSettings(updated);
                            storage.saveDevSettings(updated);
                          }}
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white"
                        />
                        <span className="text-[10px] text-emerald-400 mt-1 block">مضبوط على 60 ثانية على الأقل</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          الشبكة الإعلانية النشطة:
                        </label>
                        <select
                          value={devSettings.adNetworks?.activeNetwork || 'auto_switch'}
                          onChange={(e) => {
                            const updated = {
                              ...devSettings,
                              adNetworks: {
                                ...(devSettings.adNetworks || INITIAL_DEV_SETTINGS.adNetworks!),
                                activeNetwork: e.target.value as any
                              }
                            };
                            setDevSettings(updated);
                            storage.saveDevSettings(updated);
                          }}
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white"
                        >
                          <option value="auto_switch">تبديل تلقائي ذكي (Monetag ⮂ Adsterra)</option>
                          <option value="monetag">Monetag فقط</option>
                          <option value="adsterra">Adsterra فقط</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          حفظ الإعدادات:
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            storage.saveDevSettings(devSettings);
                            showToast('💾 تم حفظ كافة إعدادات الإعلانات وشبكات التبديل');
                          }}
                          className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95"
                        >
                          تثبيت التعديلات
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Rewarded Ad Settings */}
                  <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                          <span>🎁 إعلانات بمكافأة عند نسخ البرومبت (Rewarded Ads on Copy)</span>
                        </h5>
                        <p className="text-xs text-slate-400 mt-0.5">
                          تشغيل إعلان بمكافأة للمستخدم عند الضغط على زر النسخ بعد انتهاء فترة التهدئة.
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={devSettings.adNetworks?.rewardedAdEnabled ?? true}
                          onChange={(e) => {
                            const updated = {
                              ...devSettings,
                              adNetworks: {
                                ...(devSettings.adNetworks || INITIAL_DEV_SETTINGS.adNetworks!),
                                rewardedAdEnabled: e.target.checked
                              }
                            };
                            setDevSettings(updated);
                            storage.saveDevSettings(updated);
                            notifyDataChanged();
                          }}
                          className="peer sr-only"
                        />
                        <div className="h-6 w-11 rounded-full bg-slate-800 peer-checked:bg-amber-500 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  </div>

                  {/* List of custom sponsored ads */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-300">قائمة الإعلانات المدمجة المسجلة (350×350):</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {ads.map((ad) => (
                        <div key={ad.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={ad.imageUrl} alt={ad.title} className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <span className="font-bold text-xs text-white block truncate max-w-[140px]">{ad.title}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{ad.sponsorName}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteAd(ad.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 11. AI BRAIN JSON & DB BACKUP */}
              {activeTab === 11 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                        <FileJson className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">ملف عقل المنصة والذكاء الاصطناعي (AI Brain JSON)</h4>
                        <p className="text-xs text-slate-400">
                          التحكم في برومبتات النظام، نماذج التوليد، معلمات CFG والنسخ الاحتياطي الكامل.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>استيراد JSON</span>
                        <input type="file" accept=".json" onChange={handleImportJsonFile} className="hidden" />
                      </label>

                      <button
                        onClick={handleExportJsonFile}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-400" />
                        <span>تصدير JSON</span>
                      </button>

                      <button
                        onClick={handleResetBrainToDefault}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>الافتراضي</span>
                      </button>

                      <button
                        onClick={handleSaveDevSettings}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-black text-white transition-all shadow-md active:scale-95"
                      >
                        <Save className="w-4 h-4" />
                        <span>حفظ التعديلات</span>
                      </button>
                    </div>
                  </div>

                  {jsonError && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{jsonError}</span>
                    </div>
                  )}

                  <div className="mt-4">
                    <textarea
                      rows={14}
                      value={jsonBrainText}
                      onChange={(e) => {
                        setJsonBrainText(e.target.value);
                        setJsonError(null);
                      }}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 focus:border-indigo-500 focus:outline-none"
                      spellCheck={false}
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              {/* 12. DYNAMIC SITEMAPS & MASTER DOMAIN SEO ARCHIVAL */}
              {activeTab === 12 && <SitemapManagerView />}
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT ITEM */}
        {isAddingItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-base text-white">
                  {editingItemId ? 'تعديل عنصر وبرومبت' : `إضافة عنصر جديد لبوابة ${activeTab}`}
                </h4>
                <button
                  onClick={() => setIsAddingItem(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">عنوان العنصر / الفكرة:</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: لقطة استوديو سينمائية لسيارة رياضية..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">رابط الصورة (مربعة 1:1 أو فيديو):</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://images.unsplash.com/... أو رابط مباشر"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white font-mono placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>

                {activeTab === 3 && (
                  <div>
                    <label className="block font-bold text-amber-300 mb-1">رابط الفيديو (YouTube Embed / Direct MP4):</label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/embed/... أو فيديو MP4"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white font-mono placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-300">نص البرومبت (Prompt):</label>
                    <button
                      type="button"
                      onClick={handleAIAssistPrompt}
                      disabled={isGeneratingPrompt}
                      className="flex items-center gap-1 text-[11px] font-bold text-yellow-400 hover:text-yellow-300 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30 transition-colors"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>{isGeneratingPrompt ? 'جاري التوليد...' : 'توليد بالذكاء الاصطناعي ✨'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    placeholder="اكتب البرومبت الكامل بالإنجليزية أو العربية..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-emerald-400 placeholder-slate-600 focus:border-blue-500 focus:outline-none leading-relaxed"
                    dir="ltr"
                  />
                </div>

                {/* Aspect ratio selector inside add item modal */}
                <AspectRatioSelectorBar
                  currentPrompt={formData.prompt || ''}
                  onApplyRatio={(updated) => setFormData((prev) => ({ ...prev, prompt: updated }))}
                  theme="dark"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">اسم النموذج (Model):</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">الوسوم (مفصولة بفواصل):</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="photorealistic, 8k, studio"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingItem(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveItem}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-bold text-white shadow-md active:scale-95 border border-yellow-400"
                >
                  <Save className="w-4 h-4 text-yellow-300" />
                  <span>حفظ العنصر</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD AD */}
        {isAddingAd && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-base text-white">إضافة راعي / إعلان مدمج 350×350</h4>
                <button
                  onClick={() => setIsAddingAd(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">عنوان الإعلان:</label>
                  <input
                    type="text"
                    value={adFormData.title}
                    onChange={(e) => setAdFormData({ ...adFormData, title: e.target.value })}
                    placeholder="عرض خاص على اشتراك استضافة السحاب..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">اسم الراعي / الشركة المعلنة:</label>
                  <input
                    type="text"
                    value={adFormData.sponsorName}
                    onChange={(e) => setAdFormData({ ...adFormData, sponsorName: e.target.value })}
                    placeholder="Cloudflare / HostMaster"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">رابط صورة الإعلان (350×350 مربع):</label>
                  <input
                    type="url"
                    value={adFormData.imageUrl}
                    onChange={(e) => setAdFormData({ ...adFormData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">رابط الوجهة عند النقر (Target URL):</label>
                  <input
                    type="url"
                    value={adFormData.targetUrl}
                    onChange={(e) => setAdFormData({ ...adFormData, targetUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingAd(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveAd}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950 shadow-md active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ الإعلان</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
