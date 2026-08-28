import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Send,
  Cloud,
  Layers,
  Eye,
  Copy,
  Check,
  AlertTriangle,
  Play,
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react';
import { MediaItem, WindowId } from '../../types';
import { storage } from '../../services/storage';
import { generatePortalBatch, generateAllPortalsBatches } from '../../services/batchGenerator';
import { WINDOWS_INFO } from '../../data/defaultData';
import { getNumericCode } from '../../utils/idHelper';

interface PortalBatchGenerationViewProps {
  windowId: WindowId;
  onDataChanged?: () => void;
  onShowToast?: (msg: string) => void;
}

export const PortalBatchGenerationView: React.FC<PortalBatchGenerationViewProps> = ({
  windowId,
  onDataChanged,
  onShowToast
}) => {
  const [drafts, setDrafts] = useState<MediaItem[]>(() => storage.getDraftItemsByWindow(windowId));
  const [publishedItems, setPublishedItems] = useState<MediaItem[]>(() => storage.getItemsByWindow(windowId));
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const portalInfo = WINDOWS_INFO[windowId];

  // Refresh data when windowId changes
  useEffect(() => {
    setDrafts(storage.getDraftItemsByWindow(windowId));
    setPublishedItems(storage.getItemsByWindow(windowId));
  }, [windowId]);

  const notifyUpdate = (msg?: string) => {
    setDrafts(storage.getDraftItemsByWindow(windowId));
    setPublishedItems(storage.getItemsByWindow(windowId));
    if (onDataChanged) onDataChanged();
    if (msg && onShowToast) onShowToast(msg);
  };

  // Generate 5 items for this portal
  const handleGenerate5 = async () => {
    setIsGenerating(true);
    try {
      const generated = await generatePortalBatch({ windowId, count: 5 });
      storage.addDraftItems(generated);
      notifyUpdate(`✨ تم توليد 5 عناصر جديدة لبوابة ${windowId} وحفظها في المسودات بانتظار موافقتك`);
    } catch (e: any) {
      console.error(e);
      if (onShowToast) onShowToast('تعذر توليد الدفعة، يرجى المحاولة ثانية');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate 5 for all 6 portals (30 items total)
  const handleGenerateAllPortals = async () => {
    if (!window.confirm('هل ترغب في توليد 5 عناصر جديدة لجميع البوابات الست (إجمالي 30 عنصراً) وحفظها في المسودات للمراجعة؟')) {
      return;
    }
    setIsGeneratingAll(true);
    try {
      const allGenerated = await generateAllPortalsBatches();
      const allList: MediaItem[] = [];
      Object.values(allGenerated).forEach((list) => allList.push(...list));
      storage.addDraftItems(allList);
      notifyUpdate('🚀 تم توليد 30 عنصراً (5 لكل بوابة) ومزامنتها مع Cloudflare R2 بانتظار اعتمادك');
    } catch (e) {
      console.error(e);
      if (onShowToast) onShowToast('حدث خطأ أثناء التوليد الشامل');
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // Approve single draft item
  const handleApproveOne = (draftId: string) => {
    const { publishedItem } = storage.approveDraftItem(draftId);
    if (publishedItem) {
      notifyUpdate(`✅ تم اعتماد ونشر: "${publishedItem.title}" للمستخدمين بنجاح`);
    }
  };

  // Approve all drafts for current window
  const handleApproveAllCurrent = () => {
    if (drafts.length === 0) return;
    const { approvedCount } = storage.approveAllDraftsForWindow(windowId);
    notifyUpdate(`🎉 تم اعتماد ونشر جميع المسودات (${approvedCount} عناصر) لبوابة ${windowId} مباشرة إلى المستخدمين!`);
  };

  // Reject single draft
  const handleRejectOne = (draftId: string) => {
    storage.rejectDraftItem(draftId);
    notifyUpdate('🗑️ تم استبعاد المسودة');
  };

  // Clear all drafts for current window
  const handleClearAllDrafts = () => {
    if (window.confirm('هل تريد إلغاء جميع المسودات المعلقة لهذه البوابة؟')) {
      storage.clearAllDraftsForWindow(windowId);
      notifyUpdate('تم مسح المسودات المعلقة');
    }
  };

  // Wipe published items for this window
  const handleClearPublishedForThisWindow = () => {
    if (window.confirm(`⚠️ تحذير: هل أنت متأكد من مسح كافة العناصر الحالية المنشورة لبوابة ${windowId} للبدء بصفحة بيضاء؟`)) {
      storage.clearAllItemsForWindow(windowId);
      notifyUpdate(`تم تفريغ بوابة ${windowId} بالكامل وتجهيزها للدفعة الجديدة`);
    }
  };

  // Copy prompt helper
  const handleCopyPrompt = (id: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
    if (onShowToast) onShowToast('📋 تم نسخ البرومبت إلى الحافظة');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Mega All-Portals Generator */}
      <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-blue-950/40 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
            </span>
            <h4 className="text-sm font-black text-white">
              نظام التوليد اليومي التلقائي والاعتماد (Daily AI Generation & Approval Pipeline)
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            يتم توليد 5 تصميمات/برومبتات/فيديوهات لكل بوابة ومزامنتها تلقائياً مع <strong>Cloudflare R2</strong>، وتوضع في قائمة <em>"المسودات بانتظار موافقة المطور"</em> لتقوم بمراجعتها والموافقة عليها قبل إتاحتها للمستخدمين.
          </p>
        </div>

        <button
          type="button"
          disabled={isGeneratingAll}
          onClick={handleGenerateAllPortals}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 px-4 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 shrink-0 border border-white/20"
        >
          {isGeneratingAll ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>جاري توليد 30 عنصراً لكل البوابات...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>⚡ توليد شامل لجميع البوابات (30 عنصراً: 5 لكل بوابة)</span>
            </>
          )}
        </button>
      </div>

      {/* Portal Specific Controls Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 text-lg">
              {windowId === 1 && '📸'}
              {windowId === 2 && '🎨'}
              {windowId === 3 && '🎬'}
              {windowId === 4 && '✒️'}
              {windowId === 5 && '🛍️'}
              {windowId === 6 && '👁️'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  البوابة #{windowId}: {portalInfo?.arabicName || portalInfo?.name || `بوابة #${windowId}`}
                </h3>
                <span className="rounded-full bg-blue-500/20 border border-blue-500/40 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                  {publishedItems.length} منشور حالياً
                </span>
                {drafts.length > 0 && (
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300 animate-pulse">
                    {drafts.length} مسودات بانتظار موافقتك
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {portalInfo?.shortDesc || 'توليد وسائط احترافية مربعة 1:1'} • النمط: {portalInfo?.aspectRatioLabel || '1:1'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate5}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-black text-white transition-all shadow-md active:scale-95 disabled:opacity-50 border border-yellow-400/40"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري التوليد والرفع إلى R2...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>⚡ توليد دفعة جديدة (5 عناصر للبوابة)</span>
                </>
              )}
            </button>

            {drafts.length > 0 && (
              <button
                type="button"
                onClick={handleApproveAllCurrent}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-black text-white transition-all shadow-md active:scale-95 border border-emerald-400/40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>الموافقة ونشر الـ {drafts.length} مسودات دفعة واحدة</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClearPublishedForThisWindow}
              title="مسح العناصر المنشورة الحالية للبدء بصفحة بيضاء"
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 text-xs font-bold text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>تفريغ البوابة</span>
            </button>
          </div>
        </div>

        {/* CLOUDFLARE R2 STATUS BADGE */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-950/80 p-3 border border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-orange-400" />
            <span>
              مسار التخزين السحابي: <code className="text-orange-300 font-mono">r2://media-hub-storage/windows/win-{windowId}/</code>
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              R2 Bucket: Connected
            </span>
            <span className="text-slate-500">معدل التوليد: 5 عناصر / دورة</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: DRAFTS WAITING FOR DEVELOPER APPROVAL */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-black text-white">
              المسودات بانتظار موافقة المطور ({drafts.length})
            </h4>
            <span className="text-xs text-slate-400">
              (لن تظهر للمستخدمين حتى تنقر على زر "الموافقة والنشر")
            </span>
          </div>

          {drafts.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllDrafts}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              إلغاء كل المسودات المعلقة
            </button>
          )}
        </div>

        {drafts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-500 mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <h5 className="text-sm font-bold text-slate-200">لا توجد مسودات معلقة للبوابة #{windowId}</h5>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              اضغط على زر <strong>"توليد دفعة جديدة (5 عناصر للبوابة)"</strong> أعلاه لإنشاء 5 تصميمات ذكاء اصطناعي احترافية وحفظها في سحابة R2 للمراجعة.
            </p>
            <button
              type="button"
              onClick={handleGenerate5}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>توليد 5 عناصر الآن</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map((draft, idx) => (
              <div
                key={draft.id}
                className="flex flex-col justify-between rounded-2xl border-2 border-amber-500/50 bg-slate-900/90 p-4 shadow-xl relative overflow-hidden transition-all hover:border-amber-400"
              >
                {/* Draft Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-black text-slate-950 shadow-md">
                  <span>مسودة #{idx + 1}</span>
                </div>

                <div>
                  {/* Thumbnail */}
                  <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800">
                    <img
                      src={draft.url}
                      alt={draft.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                      {draft.model}
                    </span>
                    <span className="absolute top-2 right-2 rounded-md bg-yellow-400 text-black px-2 py-0.5 text-[10px] font-black">
                      #{getNumericCode(draft)}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h5 className="font-bold text-sm text-white line-clamp-1">{draft.title}</h5>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{draft.description}</p>

                  {/* R2 Cloudflare Object Path */}
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-orange-300 font-mono bg-orange-950/40 border border-orange-500/20 px-2 py-1 rounded-lg">
                    <Cloud className="w-3 h-3 shrink-0" />
                    <span className="truncate">r2: windows/win-{windowId}/item-{getNumericCode(draft)}.jpg</span>
                  </div>

                  {/* Prompt Preview */}
                  <div className="mt-2.5 rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-emerald-400">البرومبت المولد:</span>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(draft.id, draft.prompt)}
                        className="text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedPromptId === draft.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>نسخ</span>
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-emerald-300 line-clamp-3 select-all leading-relaxed">
                      {draft.prompt}
                    </p>
                  </div>
                </div>

                {/* Developer Approval Decision Footer */}
                <div className="mt-4 flex items-center gap-2 border-t border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => handleApproveOne(draft.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-black text-white transition-all shadow-md active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>موافقة ونشر</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRejectOne(draft.id)}
                    className="flex items-center justify-center rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-3 py-2.5 text-xs font-bold text-rose-400 transition-colors"
                    title="رفض واستبعاد"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: CURRENTLY PUBLISHED LIVE ITEMS */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-black text-white">
              العناصر المنشورة حالياً في البوابة للمستخدمين ({publishedItems.length})
            </h4>
          </div>
        </div>

        {publishedItems.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-center text-xs text-slate-500">
            لا توجد عناصر منشورة حالياً في هذه البوابة. قم بتوليد مسودات واعتمادها للنشر.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {publishedItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 transition-all hover:border-slate-700"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-950 border border-slate-800/80 mb-2">
                  <img
                    src={item.url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-1 right-1 rounded bg-yellow-400 text-black px-1.5 py-0.5 text-[9px] font-black">
                    #{getNumericCode(item)}
                  </span>
                </div>
                <div>
                  <h6 className="font-bold text-xs text-white truncate">{item.title}</h6>
                  <span className="text-[10px] text-slate-400 block truncate font-mono">{item.model}</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-800/60 pt-1.5 text-[10px] text-slate-500">
                  <span>{item.views || 0} مشاهدة</span>
                  <button
                    type="button"
                    onClick={() => {
                      storage.deleteItem(item.id);
                      notifyUpdate('تم حذف العنصر المنشور');
                    }}
                    className="text-rose-400 hover:text-rose-300 p-1"
                    title="حذف"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
