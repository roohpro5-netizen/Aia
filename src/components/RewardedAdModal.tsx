import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, CheckCircle2, Clock, Volume2, ShieldAlert, Award, ExternalLink, X } from 'lucide-react';
import { AdNetworkSettings } from '../types';

interface RewardedAdModalProps {
  isOpen: boolean;
  onRewardGranted: () => void;
  onClose: () => void;
  adSettings: AdNetworkSettings;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onRewardGranted,
  onClose,
  adSettings
}) => {
  const duration = Math.max(3, Math.min(15, adSettings.rewardAdDurationSeconds || 5));
  const [timeLeft, setTimeLeft] = useState(duration);
  const [canSkip, setCanSkip] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Active Network choice (Monetag vs Adsterra or Direct Link)
  const currentNetwork = adSettings.activeNetwork === 'monetag'
    ? 'Monetag Premium Ads'
    : adSettings.activeNetwork === 'adsterra'
    ? 'Adsterra Smart Direct'
    : 'شبكة الإعلانات بمكافأة';

  const directUrl = adSettings.activeNetwork === 'monetag'
    ? adSettings.monetagDirectUrl || 'https://monetag.com'
    : adSettings.adsterraDirectUrl || 'https://adsterra.com';

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(duration);
      setCanSkip(false);
      setIsCompleted(false);
      return;
    }

    setTimeLeft(duration);
    setCanSkip(false);
    setIsCompleted(false);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, duration]);

  if (!isOpen) return null;

  const handleClaimAndCopy = () => {
    onRewardGranted();
  };

  const progressPercent = ((duration - timeLeft) / duration) * 100;

  return (
    <div
      id="rewarded-ad-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn"
      dir="rtl"
    >
      <div
        id="rewarded-ad-dialog"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-amber-400 bg-slate-950 p-5 sm:p-6 text-white shadow-2xl ring-4 ring-amber-500/20"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Trophy className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">إعلان بمكافأة لنسخ البرومبت</h3>
              <p className="text-[10px] text-slate-400 font-mono" dir="ltr">{currentNetwork}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-700 px-3 py-1 text-xs font-mono font-bold text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft > 0 ? `${timeLeft} ثانية` : 'اكتملت المكافأة!'}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Ad Video / Creative Canvas Frame */}
        <div className="relative my-4 flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 p-6 text-center shadow-inner min-h-[190px]">
          {/* Custom Network Script Tag or Embed if available */}
          {adSettings.monetagScript && adSettings.activeNetwork === 'monetag' ? (
            <div
              className="w-full h-full text-xs text-slate-300"
              dangerouslySetInnerHTML={{ __html: adSettings.monetagScript }}
            />
          ) : adSettings.adsterraBannerCode && adSettings.activeNetwork === 'adsterra' ? (
            <div
              className="w-full h-full text-xs text-slate-300"
              dangerouslySetInnerHTML={{ __html: adSettings.adsterraBannerCode }}
            />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-400 shadow-lg">
                <Sparkles className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-black text-amber-200">
                  {adSettings.activeNetwork === 'monetag' ? 'Monetag Smart Push / Pop' : 'Adsterra High CPM Ad Network'}
                </h4>
                <p className="mt-1 text-xs text-slate-300 max-w-xs leading-relaxed">
                  جارٍ إتمام المكافأة لفك قفل النسخ الفوري وحفظ البرومبت بأعلى دقة.
                </p>
              </div>

              {directUrl && (
                <a
                  href={directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-1 text-[11px] font-bold text-amber-300 hover:bg-slate-700 transition-all"
                >
                  <span>استكشف عروض الراعي</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {isCompleted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xs p-4 animate-fadeIn">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-1 animate-scaleIn" />
              <h4 className="text-sm font-black text-emerald-300">تم تفعيل مكافأة النسخ!</h4>
              <p className="text-xs text-slate-300 mt-0.5">يمكنك الآن نسخ البرومبت بحرية</p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-2 pt-1">
          {isCompleted ? (
            <button
              type="button"
              onClick={handleClaimAndCopy}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/25 border-2 border-emerald-400 active:scale-95 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>استلام المكافأة ونسخ البرومبت الآن</span>
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 py-3 text-xs font-bold text-slate-400">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <span>يتم تحضير كود النسخ... ({timeLeft})</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
