import React from 'react';
import { useQuotaManager } from '../hooks/useQuotaManager';
import { Sparkles, AlertTriangle, ExternalLink, Copy, CheckCircle2, Zap } from 'lucide-react';

interface QuotaDisplayBannerProps {
  currentPrompt?: string;
  onGenerateAllowed?: () => void;
  className?: string;
  isActionArea?: boolean;
}

export const QuotaDisplayBanner: React.FC<QuotaDisplayBannerProps> = ({
  currentPrompt = '',
  onGenerateAllowed,
  className = '',
  isActionArea = false
}) => {
  const {
    maxQuota,
    usedCount,
    remainingQuota,
    isExhausted,
    useAttempt,
    handleExternalGemini
  } = useQuotaManager();

  const handleAction = () => {
    if (isExhausted) {
      handleExternalGemini(currentPrompt);
    } else {
      const allowed = useAttempt();
      if (allowed && onGenerateAllowed) {
        onGenerateAllowed();
      }
    }
  };

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        isExhausted
          ? 'border-amber-500/50 bg-amber-950/40 text-amber-200'
          : 'border-slate-200 bg-white text-slate-800 shadow-sm'
      } ${className}`}
      dir="rtl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              isExhausted
                ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                : 'border-blue-300 bg-blue-50 text-blue-600'
            }`}
          >
            {isExhausted ? <AlertTriangle className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black">
                {isExhausted ? 'نفدت الحصة اليومية المتاحة (0 محاولات)' : 'الحصة اليومية للاستخدام والتوليد'}
              </h4>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-black border ${
                  isExhausted
                    ? 'border-red-500 bg-red-950/80 text-red-300'
                    : 'border-emerald-400 bg-emerald-50 text-emerald-800'
                }`}
              >
                {remainingQuota} / {maxQuota} متبقية (24h)
              </span>
            </div>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isExhausted
                ? 'لقد استهلكت الـ 5 محاولات المجانية لليوم. يمكنك نسخ البرومبت والتوليد الخارجي فوراً عبر Gemini.'
                : `لديك ${remainingQuota} من أصل ${maxQuota} محاولات تجديد تلقائي كل 24 ساعة.`}
            </p>
          </div>
        </div>

        {/* Action Button Section if requested */}
        {isActionArea && (
          <div>
            {isExhausted ? (
              <button
                type="button"
                onClick={() => handleExternalGemini(currentPrompt)}
                className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 text-xs shadow-md transition-all active:scale-95 border-2 border-amber-300"
              >
                <ExternalLink className="h-4 w-4" />
                <span>نسخ البرومبت للتوليد الخارجي عبر Gemini</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAction}
                className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-2.5 text-xs shadow-md transition-all active:scale-95 border-2 border-yellow-400"
              >
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span>توليد بالذكاء الاصطناعي ({remainingQuota} متبقية)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Visual Progress Bar */}
      <div className="mt-3 w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isExhausted
              ? 'bg-red-500'
              : remainingQuota <= 1
              ? 'bg-amber-500'
              : 'bg-blue-600'
          }`}
          style={{ width: `${(remainingQuota / maxQuota) * 100}%` }}
        />
      </div>
    </div>
  );
};
