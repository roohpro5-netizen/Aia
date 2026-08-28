import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ExternalLink,
  X,
  Clock,
  ArrowLeft,
  Flame,
  ShieldCheck,
  Zap,
  Globe,
  Radio
} from 'lucide-react';
import { AdNetworkSettings } from '../types';
import { adManager } from '../services/adManager';

export interface InterstitialAdProps {
  isOpen: boolean;
  type: 'app_open' | 'navigation';
  network: 'monetag' | 'adsterra';
  destinationTitle?: string;
  adSettings: AdNetworkSettings;
  onProceed: () => void;
  onClose: () => void;
}

export const InterstitialAdModal: React.FC<InterstitialAdProps> = ({
  isOpen,
  type,
  network,
  destinationTitle,
  adSettings,
  onProceed,
  onClose
}) => {
  const duration = type === 'app_open'
    ? Math.max(3, Math.min(10, adSettings.appOpenDurationSeconds || 5))
    : Math.max(2, Math.min(8, adSettings.navigationAdDurationSeconds || 4));

  const [timeLeft, setTimeLeft] = useState(duration);
  const [canSkip, setCanSkip] = useState(false);

  // Network Specific Metadata
  const isMonetag = network === 'monetag';
  const networkTitle = isMonetag ? 'Monetag Direct Sponsor' : 'Adsterra Premium Partner';
  const networkBadge = isMonetag ? 'Monetag Network' : 'Adsterra Network';
  const directUrl = isMonetag
    ? adSettings.monetagDirectUrl || 'https://monetag.com'
    : adSettings.adsterraDirectUrl || 'https://adsterra.com';

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(duration);
      setCanSkip(false);
      return;
    }

    // Record ad shown when modal actually opens
    adManager.recordAdShown(type, network);

    setTimeLeft(duration);
    setCanSkip(false);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, duration, type, network]);

  if (!isOpen) return null;

  const progressPercent = ((duration - timeLeft) / duration) * 100;

  const handleActionProceed = () => {
    onProceed();
  };

  return (
    <div
      id={`interstitial-${type}-modal-overlay`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-3.5 sm:p-4 backdrop-blur-md animate-fadeIn"
      dir="rtl"
    >
      <div
        id="interstitial-ad-card"
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-yellow-400/90 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-5 sm:p-6 text-white shadow-2xl ring-4 ring-blue-500/20"
      >
        {/* Top 3D Gloss Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500" />

        {/* Header: App / Ad Info & Countdown */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm ${
              isMonetag
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-red-600 border-red-400 text-white'
            }`}>
              {isMonetag ? <Zap className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  {type === 'app_open' ? 'مرحباً بك في منصة Rooh Pro AI' : 'جارٍ الانتقال...'}
                </h3>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-black border ${
                  isMonetag
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-red-500/20 text-red-300 border-red-500/40'
                }`}>
                  {networkBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {type === 'app_open'
                  ? 'إعلان البداية الترويجي من الشركاء المعتمدين'
                  : destinationTitle
                  ? `الانتقال إلى: ${destinationTitle}`
                  : 'إعلان الراعي الرسمي أثناء التنقل السريع'}
              </p>
            </div>
          </div>

          {/* Countdown Pill */}
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-700 px-3 py-1 text-xs font-mono font-bold text-yellow-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft > 0 ? `${timeLeft}ث` : 'جاهز!'}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Ad Dynamic Content Frame */}
        <div className="relative my-4 flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-700 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/60 p-5 sm:p-6 text-center shadow-inner min-h-[210px]">
          {/* Custom Network Script Tag or Embed if available */}
          {isMonetag && adSettings.monetagScript ? (
            <div
              className="w-full h-full text-xs text-slate-300"
              dangerouslySetInnerHTML={{ __html: adSettings.monetagScript }}
            />
          ) : !isMonetag && adSettings.adsterraBannerCode ? (
            <div
              className="w-full h-full text-xs text-slate-300"
              dangerouslySetInnerHTML={{ __html: adSettings.adsterraBannerCode }}
            />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border shadow-lg ${
                isMonetag
                  ? 'bg-blue-500/20 border-blue-400/50 text-blue-300'
                  : 'bg-red-500/20 border-red-400/50 text-red-300'
              }`}>
                {isMonetag ? <Globe className="w-7 h-7 animate-pulse" /> : <Sparkles className="w-7 h-7 animate-pulse" />}
              </div>

              <div>
                <h4 className="text-base font-black text-white">
                  {networkTitle}
                </h4>
                <p className="mt-1 text-xs text-slate-300 max-w-sm leading-relaxed">
                  {isMonetag
                    ? 'شبكة إعلانات Monetag الذكية — عروض حصرية وتجارب رقمية مدعومة بالذكاء الاصطناعي.'
                    : 'شبكة Adsterra الدولية — اكتشف أفضل العروض والخدمات الموثوقة عالمياً.'}
                </p>
              </div>

              {/* Direct Sponsor CTA Button */}
              {directUrl && (
                <a
                  href={directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-black text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md active:scale-95 border border-blue-400"
                >
                  <span>استكشف عروض الراعي الآن</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation & Skip Actions */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>نظام تهدئة ذكي (دقيقة واحدة بين الإعلانات)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleActionProceed}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer ${
                canSkip
                  ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 ring-2 ring-yellow-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{canSkip ? (type === 'app_open' ? 'دخول التطبيق الآن' : 'متابعة الانتقال') : `انتظر (${timeLeft}ث)`}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
