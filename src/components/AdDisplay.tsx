import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ExternalLink, ShieldCheck, Tag, Info } from 'lucide-react';
import { AdBanner } from '../types';
import { storage } from '../services/storage';

interface AdDisplayProps {
  ad?: AdBanner;
  size?: '350x350' | 'responsive' | 'inline' | 'page_width';
  className?: string;
  slotIndex?: number;
}

export const AdDisplay: React.FC<AdDisplayProps> = ({
  ad: propAd,
  size = '350x350',
  className = '',
  slotIndex = 0
}) => {
  const [clicked, setClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const ads = storage.getAds();
  const devSettings = storage.getDevSettings();

  // 1. Core Web Vitals Optimization: Lazy-load using IntersectionObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Pre-load 200px before scrolling into viewport
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Kill Switch Check (Master Ads Toggle from Dev Panel)
  if (devSettings.adNetworks && devSettings.adNetworks.globalAdsEnabled === false) {
    return null;
  }

  // 3. Fallback / Rotating Stored Ads Selection
  const ad = propAd || (ads.length > 0 ? ads[slotIndex % ads.length] : undefined);
  const isSquare = size === '350x350' || size === 'responsive' || size === 'page_width';
  const minHeightClass = isSquare ? 'min-h-[350px]' : 'min-h-[50px]';

  // 4. Custom Developer HTML/Script Ad Injection with CLS Protection
  if (devSettings.enableCustomAdCode && devSettings.customAdCode350) {
    return (
      <div
        ref={containerRef}
        id={`custom-ad-slot-${slotIndex}`}
        className={`relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-slate-900/90 p-4 shadow-xl ${minHeightClass} ${
          size === '350x350' ? 'w-full max-w-[350px] mx-auto flex flex-col justify-center' : 'w-full'
        } ${className}`}
      >
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-700 text-[10px] text-indigo-300 font-medium">
          <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
          <span>إعلان مدمج (كود المطور)</span>
        </div>
        {isVisible && (
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: devSettings.customAdCode350 }}
          />
        )}
      </div>
    );
  }

  if (!ad) {
    return null;
  }

  const handleAdClick = () => {
    setClicked(true);
    storage.updateAd(ad.id, { clicks: (ad.clicks || 0) + 1 });
  };

  return (
    <div
      ref={containerRef}
      id={`ad-box-${ad.id}-${slotIndex}`}
      className={`group relative overflow-hidden rounded-2xl border-2 border-yellow-300 bg-yellow-50/80 transition-all duration-200 hover:border-yellow-400 hover:shadow-md ${minHeightClass} ${
        isSquare
          ? 'w-full aspect-square flex flex-col justify-between p-3.5 sm:p-4.5'
          : 'w-full flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-5'
      } ${className}`}
    >
      {/* Top Header Bar */}
      <div className="relative z-10 flex w-full items-center justify-between gap-2 border-b border-yellow-200/80 pb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="flex h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-[11px] font-black text-yellow-900">
            {ad.badgeText || 'إعلان مدمج (350×350)'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-yellow-900 font-bold">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          <span>{ad.sponsorName}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`relative z-10 my-auto flex flex-col gap-3 ${isSquare ? 'py-2 sm:py-3' : 'flex-1 py-1'}`}>
        {isVisible && ad.imageUrl && (
          <div className="relative h-28 w-full overflow-hidden rounded-xl border-2 border-yellow-200 bg-white">
            <img
              src={ad.imageUrl}
              alt={ad.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute bottom-1.5 right-2 flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-[10px] text-yellow-300 backdrop-blur-xs font-bold">
              <Tag className="h-2.5 w-2.5 text-yellow-400" />
              <span>مساحة إعلانية</span>
            </div>
          </div>
        )}

        <div>
          <h4 className="line-clamp-2 text-sm font-black leading-snug text-slate-900 group-hover:text-blue-700">
            {ad.title}
          </h4>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
            {ad.description}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="relative z-10 w-full pt-2">
        <a
          href={ad.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleAdClick}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-xs transition-all active:scale-[0.98] border-2 border-yellow-400 cursor-pointer"
        >
          <span>{ad.ctaText || 'زيارة العرض والموقع'}</span>
          <ExternalLink className="h-3.5 w-3.5 text-yellow-300" />
        </a>

        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
          <Info className="h-2.5 w-2.5" />
          <span>مساحة إعلانية مدمجة بنمط متناسق 1:1</span>
        </div>
      </div>
    </div>
  );
};
