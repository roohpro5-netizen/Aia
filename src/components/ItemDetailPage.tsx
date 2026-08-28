import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  Play,
  Maximize2,
  ExternalLink,
  Shield,
  Layers,
  Camera,
  Sliders,
  Hash,
  Download,
  Info,
  Link as LinkIcon,
  RotateCcw,
  Edit3,
  Lock,
  Share2,
  AlertCircle
} from 'lucide-react';
import { MediaItem, AdBanner } from '../types';
import { AdDisplay } from './AdDisplay';
import { AspectRatioSelectorBar } from './AspectRatioSelectorBar';
import { RewardedAdModal } from './RewardedAdModal';
import { PortalNeonBadge } from './PortalNeonBadge';
import { storage } from '../services/storage';
import { adManager } from '../services/adManager';
import { getNumericCode, getItemFullUrl } from '../utils/idHelper';

interface ItemDetailPageProps {
  item: MediaItem;
  ads: AdBanner[];
  onBack: () => void;
  onSelectWindow: (winId: any) => void;
}

export const ItemDetailPage: React.FC<ItemDetailPageProps> = ({
  item,
  ads,
  onBack,
  onSelectWindow
}) => {
  // Local real-time editable state (Temporary, only in current user's session, never persisted to storage/other users)
  const [editablePrompt, setEditablePrompt] = useState(item.prompt);
  const [editableNegative, setEditableNegative] = useState(item.negativePrompt || '');

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);
  const [isResetToast, setIsResetToast] = useState(false);

  // Rewarded Ad Modal State
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);
  const [activeAdNetwork, setActiveAdNetwork] = useState<'monetag' | 'adsterra'>('monetag');
  const [copyRestrictionWarning, setCopyRestrictionWarning] = useState<string | null>(null);

  const numericCode = getNumericCode(item);
  const fullUrl = getItemFullUrl(item);
  const devSettings = storage.getDevSettings();

  // Sync state if item changes
  useEffect(() => {
    setEditablePrompt(item.prompt);
    setEditableNegative(item.negativePrompt || '');
  }, [item.id, item.prompt, item.negativePrompt]);

  // Increment view on mount & smoothly position to top
  useEffect(() => {
    storage.incrementView(item.id);
    // Smooth, natural alignment to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [item.id]);

  // Direct clipboard execution
  const executeCopyPromptToClipboard = (isRewarded: boolean = false) => {
    navigator.clipboard.writeText(editablePrompt);
    storage.incrementCopy(item.id);
    adManager.recordCopyExecuted(isRewarded);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  // Safe handler triggered by "نسخ البرومبت" button
  const handleCopyPrompt = () => {
    const check = adManager.shouldShowRewardedAd(devSettings.adNetworks);

    if (check.shouldShow) {
      setActiveAdNetwork(check.activeNetwork);
      setIsRewardedAdOpen(true);
    } else {
      executeCopyPromptToClipboard(false);
    }
  };

  // Called when user finishes rewarded ad countdown
  const handleRewardGranted = () => {
    adManager.rewardUserBonusAttempts(2);
    setIsRewardedAdOpen(false);
    executeCopyPromptToClipboard(true);
  };

  // Prevent manual selection / highlight copy attempts on screen
  const handleSelectionAttempt = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setCopyRestrictionWarning('الرجاء الضغط على زر "نسخ البرومبت" للنسخ الرسمي');
    setTimeout(() => setCopyRestrictionWarning(null), 3500);
  };

  const handleCopyNegativePrompt = () => {
    if (!editableNegative) return;
    navigator.clipboard.writeText(editableNegative);
    setCopiedNegative(true);
    setTimeout(() => setCopiedNegative(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(numericCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleResetPrompt = () => {
    setEditablePrompt(item.prompt);
    setEditableNegative(item.negativePrompt || '');
    setIsResetToast(true);
    setTimeout(() => setIsResetToast(false), 2000);
  };

  const handleApplyRatio = (updatedPrompt: string, selectedRatio: string) => {
    setEditablePrompt(updatedPrompt);
    setIsResetToast(true);
    setTimeout(() => setIsResetToast(false), 2000);
  };

  const isModified = editablePrompt !== item.prompt || editableNegative !== (item.negativePrompt || '');

  const isVideo = item.type === 'youtube_video' || item.type === 'shorts_video';
  const isShorts = item.type === 'shorts_video';
  const isYouTube = item.type === 'youtube_video';

  return (
    <div id={`item-detail-page-${item.id}`} className="w-full space-y-6 pb-12">
      {/* Top Header Bar & Navigation with Tri-Color stripe */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="absolute top-0 left-0 right-0 tricolor-bar">
          <span />
          <span />
          <span />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors shadow-2xs"
              title="الرجوع للقائمة"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <PortalNeonBadge
                  windowId={item.windowId}
                  size="sm"
                />
                <h2 className="text-base sm:text-lg font-black text-slate-900 line-clamp-1">
                  {item.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Action Icons Bar: Compact Icons (🔗, 📋, ↗️) */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            {/* Copy Window Code Icon Button (📋) */}
            <button
              onClick={handleCopyCode}
              title={copiedCode ? 'تم نسخ رقم النافذة!' : 'نسخ رقم النافذة (📋)'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-90 shadow-2xs border ${
                copiedCode
                  ? 'bg-yellow-400 text-black border-yellow-500'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-yellow-50 hover:border-yellow-400'
              }`}
            >
              {copiedCode ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <Copy className="w-4 h-4 text-yellow-600" />}
              <span className="hidden sm:inline">{copiedCode ? 'تم النسخ!' : 'نسخ الرقم'}</span>
            </button>

            {/* Copy Direct Page URL Icon Button (🔗) */}
            <button
              onClick={handleShareLink}
              title={copiedLink ? 'تم نسخ الرابط المباشر!' : 'نسخ رابط الصفحة (🔗)'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-90 shadow-2xs border ${
                copiedLink
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50 hover:border-blue-500'
              }`}
            >
              {copiedLink ? <Check className="w-4 h-4 text-white stroke-[3]" /> : <LinkIcon className="w-4 h-4 text-blue-600" />}
              <span className="hidden sm:inline">{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Copy Restriction Alert Banner if user attempts to highlight/copy text manually */}
      {copyRestrictionWarning && (
        <div className="flex items-center gap-2 rounded-2xl bg-amber-500/15 border-2 border-amber-400 p-3 text-xs font-bold text-amber-900 shadow-sm animate-bounce">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{copyRestrictionWarning}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. DESKTOP / BROWSER LAYOUT (Hidden on mobile, Shown on sm+) */}
      {/* ========================================================= */}
      <div className="hidden sm:block space-y-6">
        {/* Top Section: Media alongside Integrated Ad (350x350) */}
        <div className={`grid grid-cols-1 ${devSettings.adNetworks?.globalAdsEnabled !== false ? 'lg:grid-cols-12' : 'lg:grid-cols-8'} gap-6 items-start`}>
          {/* Framed Media Player / Image Viewer (col 1..7 or 8) */}
          <div className={`${devSettings.adNetworks?.globalAdsEnabled !== false ? 'lg:col-span-8' : 'lg:col-span-8 mx-auto w-full'} overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm`}>
            {/* STRICT SQUARE ASPECT RATIO (aspect-square) */}
            <div className="relative overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-100 w-full max-w-[480px] mx-auto aspect-square shadow-2xs">
              {/* Floating Action Icon over media (📋 Code only, link is in top header) */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1.5 rounded-xl border border-white/20 shadow-lg z-10">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  title="نسخ رقم النافذة"
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all active:scale-90 ${
                    copiedCode ? 'bg-yellow-400 text-black' : 'bg-white/20 text-yellow-300 hover:bg-white/40'
                  }`}
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* If YouTube video embed */}
              {isYouTube && item.videoUrl ? (
                <iframe
                  src={item.videoUrl}
                  title={item.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full rounded-lg border-0"
                />
              ) : isShorts && item.videoUrl?.endsWith('.mp4') ? (
                <video
                  src={item.videoUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover rounded-lg"
                />
              )}
            </div>

            {/* Media Metadata under player */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">النموذج:</span>
                <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-blue-700 font-mono text-[11px] font-bold">
                  {item.model}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 font-medium">
                <span>{item.views || 100} مشاهدة</span>
                <span>•</span>
                <span>{item.copies || 0} مرات نسخ</span>
              </div>
            </div>
          </div>

          {/* Integrated Ad 1 (350x350) right alongside Media (only if ads enabled) */}
          {devSettings.adNetworks?.globalAdsEnabled !== false && (
            <div className="lg:col-span-4 flex justify-center">
              <AdDisplay size="350x350" slotIndex={1} className="w-full max-w-[350px]" />
            </div>
          )}
        </div>

        {/* Middle Section: Real-time Editable Prompt Playground */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shadow-2xs">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    محرر وتعديل البرومبت (AI Prompt Playground)
                  </h3>
                  {isModified && (
                    <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-400 animate-pulse">
                      مُعدَّل لحظياً
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  يمكنك قراءة وتعديل وإضافة أو حذف أي تفاصيل في البرومبت لحظياً ونسخه مباشرة عبر زر النسخ المخصص.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Reset to Original Button if modified */}
              {isModified && (
                <button
                  type="button"
                  onClick={handleResetPrompt}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 transition-all active:scale-95 shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-700" />
                  <span>استعادة الأصلي</span>
                </button>
              )}

              {/* Copy Prompt Button with High Impact Visual */}
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs sm:text-sm font-black text-white transition-all shadow-md active:scale-95 border-2 border-yellow-400"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                    <span>تم نسخ البرومبت بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-yellow-300" />
                    <span>{isModified ? 'نسخ البرومبت المعدل' : 'نسخ البرومبت الكامل'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Privacy & Transient Notice */}
          <div className="mb-3 flex items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>تعديلاتك فورية وخاصة بك، ويتم النسخ الآمن حصرياً عبر زر النسخ.</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
              <span className="bg-slate-200/80 px-2 py-0.5 rounded font-bold text-slate-800">
                {editablePrompt.trim().split(/\s+/).filter(Boolean).length} كلمة
              </span>
              <span className="bg-slate-200/80 px-2 py-0.5 rounded font-bold text-slate-800">
                {editablePrompt.length} حرف
              </span>
            </div>
          </div>

          {/* High-Legibility Colorful Dark Code Studio */}
          <div className="overflow-hidden rounded-2xl border-2 border-slate-800 bg-[#0d1117] shadow-xl">
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-[#161b22] px-4 py-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/90 inline-block shadow-2xs" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/90 inline-block shadow-2xs" />
                <span className="h-3 w-3 rounded-full bg-green-500/90 inline-block shadow-2xs" />
                <span className="mr-2 font-mono text-[11px] font-bold text-slate-300">
                  prompt.ai • {item.model}
                </span>
              </div>
              <div className="flex items-center gap-2 font-sans text-[11px]">
                <span className="text-emerald-400 font-bold">● النسخ محمي بالزر الرسمي</span>
              </div>
            </div>

            {/* Real-time Interactive Editable Textarea with High-Legibility Font & Colors */}
            <div
              className="p-4"
              onCopy={handleSelectionAttempt}
              onCut={handleSelectionAttempt}
            >
              <textarea
                value={editablePrompt}
                onChange={(e) => setEditablePrompt(e.target.value)}
                onCopy={handleSelectionAttempt}
                rows={5}
                placeholder="اكتب أو عدّل على نص البرومبت هنا بحرية..."
                className="w-full bg-transparent font-mono text-sm sm:text-base leading-relaxed tracking-wide text-emerald-300 placeholder-slate-600 focus:outline-hidden resize-y select-none"
                dir="ltr"
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  textShadow: '0 0 1px rgba(52, 211, 153, 0.4)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                }}
              />
            </div>
          </div>

          {/* Aspect Ratio & Size Selector Bar below prompt */}
          <div className="mt-4">
            <AspectRatioSelectorBar
              currentPrompt={editablePrompt}
              onApplyRatio={handleApplyRatio}
            />
          </div>

          {/* Negative Prompt (if available or editable) */}
          <div className="mt-4 rounded-xl border-2 border-red-200 bg-red-50/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-600 inline-block" />
                <span className="text-xs font-bold text-red-900">
                  البرومبت السلبي (Negative Prompt - للتفاصيل غير المرغوبة):
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyNegativePrompt}
                className="text-xs font-bold text-red-700 hover:text-red-900 bg-red-100 hover:bg-red-200 border border-red-300 px-2.5 py-1 rounded-lg transition-all active:scale-95"
              >
                {copiedNegative ? 'تم نسخ السلبي!' : 'نسخ السلبي'}
              </button>
            </div>
            <textarea
              value={editableNegative}
              onChange={(e) => setEditableNegative(e.target.value)}
              rows={2}
              placeholder="البرومبت السلبي (مثل: blurry, deformed, low quality)..."
              className="w-full rounded-lg bg-white p-3 font-mono text-xs sm:text-sm text-red-950 border border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-400 focus:outline-hidden leading-relaxed"
              dir="ltr"
            />
          </div>

          {/* Parameters & Tags */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600">الكلمات المفتاحية والوسوم:</span>
            {item.tags?.map((tag, idx) => (
              <span
                key={idx}
                className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200 shadow-2xs"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Analysis Data if Window 3 */}
          {item.analysisData && (
            <div className="mt-4 rounded-xl border-2 border-yellow-300 bg-yellow-50/60 p-4 space-y-2">
              <span className="text-xs font-bold text-yellow-900 block">
                تفاصيل التحليل البصري المسجل:
              </span>
              <p className="text-xs text-slate-700">
                <strong className="text-slate-900">الإضاءة:</strong> {item.analysisData.lighting}
              </p>
              {item.analysisData.cameraLens && (
                <p className="text-xs text-slate-700">
                  <strong className="text-slate-900">العدسة والكاميرا:</strong> {item.analysisData.cameraLens}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Section: Integrated Ad 2 (350x350) below the prompt */}
        <div className="flex flex-col items-center justify-center pt-2">
          <span className="text-xs font-bold text-slate-600 mb-2">إعلان مدمج أسفل البرومبت (350×350)</span>
          <AdDisplay size="350x350" slotIndex={2} className="w-full max-w-[350px]" />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MOBILE VIEW (Shown on mobile, Hidden on sm+) */}
      {/* ========================================================= */}
      <div className="sm:hidden space-y-6 w-full">
        {/* 1. Full-width Square Media Window Card */}
        <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-3.5 shadow-sm w-full aspect-square flex flex-col justify-between">
          <div className="relative overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-100 flex-1 w-full shadow-inner">
            {/* Top Floating Action Icon (📋 Code only, link is in top header) */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1.5 rounded-xl border border-white/20 shadow-lg z-10">
              <button
                type="button"
                onClick={handleCopyCode}
                title="نسخ رقم النافذة"
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all active:scale-90 ${
                  copiedCode ? 'bg-yellow-400 text-black font-bold' : 'bg-white/20 text-yellow-300'
                }`}
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {isYouTube && item.videoUrl ? (
              <iframe
                src={item.videoUrl}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full rounded-lg border-0"
              />
            ) : isShorts && item.videoUrl?.endsWith('.mp4') ? (
              <video
                src={item.videoUrl}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover rounded-lg"
              />
            ) : (
              <img
                src={item.url}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover rounded-lg"
              />
            )}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold text-blue-600">{item.model}</span>
            <span className="font-medium text-slate-500">{item.views || 100} مشاهدة</span>
          </div>
        </div>

        {/* 2. Integrated Ad 1 (Full-width Square) below image (only if ads enabled) */}
        {devSettings.adNetworks?.globalAdsEnabled !== false && (
          <div className="w-full aspect-square">
            <AdDisplay size="page_width" slotIndex={1} className="w-full aspect-square shadow-sm" />
          </div>
        )}

        {/* 3. Box with Real-time Editable Prompt */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900">محرر ونسخ البرومبت:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {isModified && (
                <button
                  type="button"
                  onClick={handleResetPrompt}
                  className="rounded-lg bg-slate-100 px-2 py-1 text-slate-700 hover:bg-slate-200 text-[10px] font-bold flex items-center gap-1 border border-slate-300"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>الأصلي</span>
                </button>
              )}
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-black text-white active:scale-95 shadow-xs border border-yellow-400"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-yellow-300" />}
                <span>{copiedPrompt ? 'تم النسخ!' : 'نسخ البرومبت'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span>🔒 النسخ الآمن محمي بالزر الرسمي.</span>
            <span className="font-mono font-bold text-slate-700">
              {editablePrompt.trim().split(/\s+/).filter(Boolean).length} كلمة • {editablePrompt.length} حرف
            </span>
          </div>

          {/* High-Legibility Dark Code Terminal for Mobile */}
          <div
            className="overflow-hidden rounded-xl border-2 border-slate-800 bg-[#0d1117] shadow-md"
            onCopy={handleSelectionAttempt}
            onCut={handleSelectionAttempt}
          >
            <div className="flex items-center justify-between border-b border-slate-800 bg-[#161b22] px-3 py-1.5 text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                <span className="h-2 w-2 rounded-full bg-yellow-500 inline-block" />
                <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                <span className="mr-1.5 font-mono text-slate-300 font-bold">prompt.ai</span>
              </div>
              <span className="text-emerald-400 font-bold">● النسخ عبر الزر فقط</span>
            </div>
            <div className="p-3">
              <textarea
                value={editablePrompt}
                onChange={(e) => setEditablePrompt(e.target.value)}
                onCopy={handleSelectionAttempt}
                rows={5}
                className="w-full bg-transparent font-mono text-xs sm:text-sm leading-relaxed text-emerald-300 placeholder-slate-600 focus:outline-hidden resize-y select-none"
                dir="ltr"
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                }}
              />
            </div>
          </div>

          {/* Aspect Ratio & Size Selector Bar below prompt in Mobile */}
          <AspectRatioSelectorBar
            currentPrompt={editablePrompt}
            onApplyRatio={handleApplyRatio}
          />

          {editableNegative && (
            <div className="rounded-xl bg-red-50/70 p-3 border border-red-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-red-800">البرومبت السلبي (Negative):</span>
                <button
                  type="button"
                  onClick={handleCopyNegativePrompt}
                  className="text-[10px] font-bold text-red-700 bg-red-100 hover:bg-red-200 px-2 py-0.5 rounded border border-red-300"
                >
                  {copiedNegative ? 'تم النسخ!' : 'نسخ'}
                </button>
              </div>
              <textarea
                value={editableNegative}
                onChange={(e) => setEditableNegative(e.target.value)}
                rows={2}
                className="w-full rounded-lg bg-white p-2.5 font-mono text-xs text-red-950 border border-red-300 focus:outline-hidden select-none"
                dir="ltr"
                style={{ userSelect: 'none' }}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-1 pt-1">
            {item.tags?.map((tag, idx) => (
              <span key={idx} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* 4. Integrated Ad 2 (350x350) below the prompt (only if ads enabled) */}
        {devSettings.adNetworks?.globalAdsEnabled !== false && (
          <div className="w-full pt-1">
            <span className="text-[11px] font-bold text-slate-500 mb-2 block text-center">
              إعلان مدمج 350×350 أسفل البرومبت
            </span>
            <AdDisplay size="350x350" slotIndex={2} className="w-full max-w-[350px] mx-auto" />
          </div>
        )}
      </div>

      {/* Rewarded Ad Modal Triggered on Copy Button */}
      {devSettings.adNetworks && (
        <RewardedAdModal
          isOpen={isRewardedAdOpen}
          onRewardGranted={handleRewardGranted}
          onClose={() => setIsRewardedAdOpen(false)}
          adSettings={devSettings.adNetworks}
        />
      )}
    </div>
  );
};
