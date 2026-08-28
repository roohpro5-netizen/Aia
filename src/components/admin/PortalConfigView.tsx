import React, { useState } from 'react';
import { WindowId, APISwitcherSource } from '../../types';
import { useAdminConfig } from '../../context/AdminConfigContext';
import { ApiStatusBadge } from './ApiStatusBadge';
import { AIProvider } from '../../services/apiVerification';
import { storage } from '../../services/storage';
import {
  Key,
  Shield,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Layers,
  Database,
  ExternalLink,
  Info,
  Zap,
  Code
} from 'lucide-react';

interface PortalConfigViewProps {
  windowId: WindowId;
}

const PORTAL_METADATA: Record<WindowId, {
  name: string;
  arabicName: string;
  defaultProvider: AIProvider;
  iconColor: string;
  themeGradient: string;
  description: string;
  defaultModel: string;
}> = {
  1: {
    name: 'Portal 1: Photorealistic',
    arabicName: 'بوابة 1: توليد الصور الواقعية والمتحركة',
    defaultProvider: 'lexica',
    iconColor: 'text-blue-400',
    themeGradient: 'from-blue-600 to-indigo-700',
    description: 'توليد وهندسة برومبتات واقعية فائقة الدقة بأسلوب كاميرات DSLR وإضاءة سينمائية حجم 1:1',
    defaultModel: 'Flux.1 Photoreal'
  },
  2: {
    name: 'Portal 2: Digital Art & 3D',
    arabicName: 'بوابة 2: الفن الرقمي والـ 3D والأنمي',
    defaultProvider: 'civitai',
    iconColor: 'text-purple-400',
    themeGradient: 'from-purple-600 to-pink-700',
    description: 'رندرة وتصميم الجرافيك ثلاثي الأبعاد والأنمي واللوحات السريالية عبر Octane و Unreal Engine',
    defaultModel: 'Midjourney v6.1 / Niji 6'
  },
  3: {
    name: 'Portal 3: Cinematic Video 4K',
    arabicName: 'بوابة 3: برومبتات الفيديو والسينما 4K',
    defaultProvider: 'pollinations',
    iconColor: 'text-amber-400',
    themeGradient: 'from-amber-600 to-red-700',
    description: 'توليد حركات الكاميرا والتصوير السينمائي للفيديوهات القصيرة واليوتيوب بدقة 60fps',
    defaultModel: 'Runway Gen-3 / Sora / Kling'
  },
  4: {
    name: 'Portal 4: Vector & Logos',
    arabicName: 'بوابة 4: الفيكتور والشعارات والأيقونات',
    defaultProvider: 'lexica',
    iconColor: 'text-emerald-400',
    themeGradient: 'from-emerald-600 to-teal-700',
    description: 'تصميم الشعارات النظيفة والرسومات الموجهة المعزولة والأيقونات عالية الوضوح SVG',
    defaultModel: 'VectorMaster Studio'
  },
  5: {
    name: 'Portal 5: Commercial & Ads',
    arabicName: 'بوابة 5: تصوير المنتجات والإعلانات التجارية',
    defaultProvider: 'gemini',
    iconColor: 'text-rose-400',
    themeGradient: 'from-rose-600 to-orange-700',
    description: 'تصوير المنتجات التجارية المفرغة، ملصقات التسويق الرقمي وتوزيع الإضاءة الاستوديو الفاخر',
    defaultModel: 'Commercial Studio Ultra'
  },
  6: {
    name: 'Portal 6: Vision & Reverse Engineering',
    arabicName: 'بوابة 6: التحليل البصري وهندسة البرومبت العكسي',
    defaultProvider: 'gemini',
    iconColor: 'text-cyan-400',
    themeGradient: 'from-cyan-600 to-blue-700',
    description: 'استخراج الأنماط، الكاميرا، العدسات والإضاءة من الصور وتوليد البرومبت المعاكس بدقة عالية',
    defaultModel: 'Gemini 2.5 Flash Vision'
  }
};

export const PortalConfigView: React.FC<PortalConfigViewProps> = ({ windowId }) => {
  const meta = PORTAL_METADATA[windowId];
  const {
    hiddenPrompts,
    setHiddenPrompt,
    apiSource,
    setApiSource,
    blacklistWords,
    addBlacklistWord,
    removeBlacklistWord,
    validatePrompt
  } = useAdminConfig();

  const [currentPromptInjection, setCurrentPromptInjection] = useState(hiddenPrompts[windowId] || '');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(() => {
    if (apiSource === 'gemini') return 'gemini';
    if (apiSource === 'civitai') return 'civitai';
    return meta.defaultProvider;
  });

  // Dedicated portal API key state (stored in local devSettings)
  const [devSettings, setDevSettings] = useState(() => storage.getDevSettings());
  const [customApiKey, setCustomApiKey] = useState(() => {
    if (selectedProvider === 'gemini') return devSettings.geminiApiKey || '';
    if (selectedProvider === 'groq') return devSettings.groqApiKey || '';
    return '';
  });

  const [newBlacklistWord, setNewBlacklistWord] = useState('');
  const [testSecurityPrompt, setTestSecurityPrompt] = useState('');
  const [securityTestResult, setSecurityTestResult] = useState<{ isValid: boolean; blockedWord?: string } | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const handleSaveConfig = () => {
    // 1. Save hidden prompt injection
    setHiddenPrompt(windowId, currentPromptInjection.trim());

    // 2. Save API key into devSettings
    const updated = { ...devSettings };
    if (selectedProvider === 'gemini') {
      updated.geminiApiKey = customApiKey.trim();
    } else if (selectedProvider === 'groq') {
      updated.groqApiKey = customApiKey.trim();
    }
    storage.saveDevSettings(updated);
    setDevSettings(updated);

    setSaveToast(`تم حفظ وتحديث إعدادات ${meta.arabicName} بنجاح!`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleProviderSwitch = (provider: AIProvider) => {
    setSelectedProvider(provider);
    if (provider === 'gemini' || provider === 'civitai' || provider === 'lexica') {
      setApiSource(provider as APISwitcherSource);
    }
    if (provider === 'gemini') {
      setCustomApiKey(devSettings.geminiApiKey || '');
    } else if (provider === 'groq') {
      setCustomApiKey(devSettings.groqApiKey || '');
    } else {
      setCustomApiKey('');
    }
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlacklistWord.trim()) return;
    addBlacklistWord(newBlacklistWord.trim());
    setNewBlacklistWord('');
  };

  const handleRunSecurityCheck = () => {
    const res = validatePrompt(testSecurityPrompt);
    setSecurityTestResult(res);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with Title and ApiStatusBadge */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full bg-gradient-to-r ${meta.themeGradient}`} />
              <h2 className="text-base sm:text-lg font-black text-white">{meta.arabicName}</h2>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-300 border border-slate-700">
                Window #{windowId}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl">{meta.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveConfig}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 px-4 py-2 text-xs font-black text-white shadow-md transition-all"
            >
              <Save className="h-4 w-4" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </div>

        {/* TOP STATUS BADGE (Required by prompt: ApiStatusBadge.jsx at top of every portal page) */}
        <div className="mt-4">
          <ApiStatusBadge
            provider={selectedProvider}
            apiKey={customApiKey}
            className="w-full"
          />
        </div>

        {saveToast && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 p-3 text-xs font-bold text-emerald-200 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{saveToast}</span>
          </div>
        )}
      </div>

      {/* Grid: API Switcher & Credentials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 1: API Switcher & Provider Selection */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ToggleRight className="h-5 w-5 text-blue-400" />
              <h3 className="text-sm font-black text-white">1. مبدل الـ API ومصدر التغذية (API Switcher)</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Active: {selectedProvider}</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            اختر مصدر تغذية البرومبتات وتوليد الوسائط لهذه البوابة بنقرة واحدة:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'lexica', label: 'Lexica.art API', desc: 'تغذية سريعة ومجانية', badge: 'Public' },
              { id: 'civitai', label: 'Civitai Engine', desc: 'نماذج SDXL و LoRA', badge: 'Fast' },
              { id: 'gemini', label: 'Google Gemini', desc: 'ذكاء متقدم وهندسة برومبت', badge: 'Recommended' },
              { id: 'pollinations', label: 'Pollinations AI', desc: 'توليد مباشر بدون مفتاح', badge: 'Free' },
              { id: 'groq', label: 'Groq Llama-3', desc: 'سرعة فائقة <200ms', badge: 'Ultra-Fast' },
              { id: 'huggingface', label: 'HuggingFace Flux', desc: 'نماذج FLUX المفتوحة', badge: 'Cloud' }
            ].map((p) => {
              const isSelected = selectedProvider === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProviderSwitch(p.id as AIProvider)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-right transition-all active:scale-95 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-600/20 text-white shadow-md ring-1 ring-blue-400/30'
                      : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs">{p.label}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {p.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">{p.desc}</span>
                </button>
              );
            })}
          </div>

          {/* API Key Input for Selected Provider */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
              <span>مفتاح الـ API الخاص بـ ({selectedProvider}):</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {selectedProvider === 'lexica' || selectedProvider === 'pollinations'
                  ? 'لا يتطلب مفتاحاً خاصاً (Public Endpoint)'
                  : 'مطلوب للمصادقة'}
              </span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder={
                  selectedProvider === 'gemini'
                    ? 'AIzaSy...'
                    : selectedProvider === 'groq'
                    ? 'gsk_...'
                    : 'اختياري أو أدخل مفتاحك الخاص...'
                }
                disabled={selectedProvider === 'lexica' || selectedProvider === 'pollinations'}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Hidden Prompt Injection */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-400" />
              <h3 className="text-sm font-black text-white">2. الحقن المخفي للبرومبت (Hidden Prompt Injection)</h3>
            </div>
            <span className="rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5">
              Auto-Injected
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            كلمات مفتاحية وتقنيات إضاءة وكاميرا يتم دمجها سراً مع برومبت المستخدم تلقائياً قبل إرساله للمحرك لضمان أعلى جودة في بوابة {windowId}:
          </p>

          <textarea
            value={currentPromptInjection}
            onChange={(e) => setCurrentPromptInjection(e.target.value)}
            rows={4}
            dir="ltr"
            placeholder="e.g. 8k, photorealistic, cinematic lighting, masterpiece, Hasselblad 85mm f/1.4..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-emerald-300 font-mono leading-relaxed placeholder-slate-600 focus:border-purple-500 focus:outline-none resize-y"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>عدد الكلمات المحقونة: {currentPromptInjection.split(/\s+/).filter(Boolean).length}</span>
            <button
              type="button"
              onClick={() => {
                const presets: Record<WindowId, string> = {
                  1: '8k, ultra-photorealistic, masterpiece, high dynamic range, Hasselblad 85mm f/1.4, clean volumetric lighting',
                  2: 'Unreal Engine 5 render, Octane 3D, ultra detailed, vibrant lighting, intricate textures, masterpiece',
                  3: 'cinematic 4k motion, 60fps, smooth camera tracking, dramatic lighting, movie grading, high bitrate',
                  4: 'clean vector graphics, minimalist aesthetic, isolated on solid background, scalable high resolution, sharp edges',
                  5: 'commercial studio lighting, advertising photography, high-end product showcase, 8k resolution, crisp mockup',
                  6: 'high precision optical vision analysis, detailed style extraction, visual reverse-engineering parameters'
                };
                setCurrentPromptInjection(presets[windowId]);
              }}
              className="text-purple-400 hover:text-purple-300 font-sans font-bold transition-colors"
            >
              استرجاع الحقن الافتراضي للبوابة
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Security Filter (Blacklist Words Manager & Live Validator) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-400" />
            <h3 className="text-sm font-black text-white">3. فلتر الأمان والكلمات المحظورة (Security Filter Blacklist)</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{blacklistWords.length} كلمات محظورة مسجلة</span>
        </div>

        <p className="text-xs text-slate-400">
          أي برومبت يحتوي على أي من هذه الكلمات يتم اعتراضه وفحصه أمنياً قبل المعالجة أو الإرسال.
        </p>

        {/* Add Blacklist Word Form */}
        <form onSubmit={handleAddWord} className="flex gap-2">
          <input
            type="text"
            value={newBlacklistWord}
            onChange={(e) => setNewBlacklistWord(e.target.value)}
            placeholder="أدخل كلمة بالإنجليزية أو العربية لحظظرها (مثل: spam, nsfw)..."
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none font-mono"
            dir="ltr"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة للقائمة السوداء</span>
          </button>
        </form>

        {/* Current Blacklist Words Badges */}
        <div className="flex flex-wrap gap-2 pt-1 max-h-40 overflow-y-auto p-1">
          {blacklistWords.map((word) => (
            <span
              key={word}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-950/60 border border-red-800/60 px-2.5 py-1 text-xs font-mono text-red-300"
              dir="ltr"
            >
              <span>{word}</span>
              <button
                type="button"
                onClick={() => removeBlacklistWord(word)}
                className="hover:text-red-100 transition-colors p-0.5"
                title="إزالة الكلمة"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Security Filter Live Tester */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 mt-3">
          <label className="block text-xs font-bold text-slate-300">
            فاحص الأمان الفوري (Live Blacklist Tester):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={testSecurityPrompt}
              onChange={(e) => {
                setTestSecurityPrompt(e.target.value);
                setSecurityTestResult(null);
              }}
              placeholder="اكتب نصاً لاختبار اعتراض الفلتر الأمني..."
              className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleRunSecurityCheck}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 border border-slate-700"
            >
              فحص
            </button>
          </div>

          {securityTestResult && (
            <div
              className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
                securityTestResult.isValid
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                  : 'bg-red-950/60 text-red-300 border border-red-800'
              }`}
            >
              {securityTestResult.isValid ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>النص آمن وسليم، لا يحتوي على أي كلمات محظورة.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span>
                    تم اعتراض النص! يحتوي على الكلمة المحظورة: <strong className="font-mono underline">{securityTestResult.blockedWord}</strong>
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
