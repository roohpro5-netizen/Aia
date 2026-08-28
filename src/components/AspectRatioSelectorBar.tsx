import React, { useRef, useState, useEffect } from 'react';
import {
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Film,
  Tv,
  Smartphone,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';

export interface AspectRatioOption {
  id: string;
  ratio: string; // e.g. "1:1", "16:9"
  name: string; // short name e.g. "مربع", "عريض"
  icon: React.ReactNode;
  param: string; // e.g. "--ar 16:9"
  shapeClass: string; // CSS style for mini aspect ratio shape box
}

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  {
    id: 'ar-1-1',
    ratio: '1:1',
    name: '1:1 مربع',
    icon: <Square className="w-3.5 h-3.5" />,
    param: '--ar 1:1',
    shapeClass: 'w-4 h-4'
  },
  {
    id: 'ar-16-9',
    ratio: '16:9',
    name: '16:9 عريض (Landscape)',
    icon: <RectangleHorizontal className="w-3.5 h-3.5" />,
    param: '--ar 16:9',
    shapeClass: 'w-5 h-3'
  },
  {
    id: 'ar-9-16',
    ratio: '9:16',
    name: '9:16 طولي (Reels/TikTok)',
    icon: <Smartphone className="w-3.5 h-3.5" />,
    param: '--ar 9:16',
    shapeClass: 'w-3 h-5'
  },
  {
    id: 'ar-4-5',
    ratio: '4:5',
    name: '4:5 بوست طولي',
    icon: <RectangleVertical className="w-3.5 h-3.5" />,
    param: '--ar 4:5',
    shapeClass: 'w-3.5 h-4.5'
  },
  {
    id: 'ar-3-4',
    ratio: '3:4',
    name: '3:4 بورتريه',
    icon: <RectangleVertical className="w-3.5 h-3.5" />,
    param: '--ar 3:4',
    shapeClass: 'w-3.5 h-4.5'
  },
  {
    id: 'ar-4-3',
    ratio: '4:3',
    name: '4:3 كلاسيكي',
    icon: <Tv className="w-3.5 h-3.5" />,
    param: '--ar 4:3',
    shapeClass: 'w-4.5 h-3.5'
  },
  {
    id: 'ar-3-2',
    ratio: '3:2',
    name: '3:2 كاميرا DSLR',
    icon: <RectangleHorizontal className="w-3.5 h-3.5" />,
    param: '--ar 3:2',
    shapeClass: 'w-4.5 h-3'
  },
  {
    id: 'ar-2-3',
    ratio: '2:3',
    name: '2:3 تصوير عمودي',
    icon: <RectangleVertical className="w-3.5 h-3.5" />,
    param: '--ar 2:3',
    shapeClass: 'w-3 h-4.5'
  },
  {
    id: 'ar-21-9',
    ratio: '21:9',
    name: '21:9 سينمائي فائق',
    icon: <Film className="w-3.5 h-3.5" />,
    param: '--ar 21:9',
    shapeClass: 'w-6 h-2.5'
  }
];

interface AspectRatioSelectorBarProps {
  currentPrompt: string;
  onApplyRatio: (updatedPrompt: string, selectedRatio: string) => void;
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
  label?: string;
}

export const AspectRatioSelectorBar: React.FC<AspectRatioSelectorBarProps> = ({
  currentPrompt,
  onApplyRatio,
  className = '',
  theme = 'light',
  label = 'شريط اختيار وتطبيق مقاس الصورة والفيديو'
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  // Detect currently active ratio from prompt
  const detectedMatch = currentPrompt.match(/(?:--ar|--aspect|-ar)\s+([0-9]+:[0-9]+)/i);
  const currentActiveRatio = detectedMatch ? detectedMatch[1] : null;

  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    // In RTL scrollLeft can be negative or positive depending on browser, standardizing check:
    const maxScroll = scrollWidth - clientWidth;
    const absScroll = Math.abs(scrollLeft);
    setCanScrollLeft(absScroll < maxScroll - 4);
    setCanScrollRight(absScroll > 4);
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const distance = 240;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth'
    });
    setTimeout(updateScrollButtons, 300);
  };

  // Mouse drag scrolling support
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
    updateScrollButtons();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleSelectRatio = (option: AspectRatioOption) => {
    let updated = currentPrompt.trim();

    // Check if prompt already has an --ar or --aspect flag
    const arRegex = /(--ar|--aspect|-ar)\s+[0-9]+:[0-9]+/gi;
    if (arRegex.test(updated)) {
      updated = updated.replace(arRegex, option.param);
    } else {
      updated = updated ? `${updated} ${option.param}` : option.param;
    }

    onApplyRatio(updated, option.ratio);
  };

  const isDark = theme === 'dark';

  return (
    <div
      id="aspect-ratio-selector-bar"
      className={`rounded-2xl transition-colors ${
        isDark
          ? 'border border-slate-800 bg-slate-950/90 p-3 text-slate-200'
          : 'border-2 border-slate-200 bg-slate-50/80 p-3 text-slate-800 shadow-xs'
      } ${className}`}
    >
      {/* Bar Top Header / Info */}
      <div className="flex items-center justify-between gap-2 pb-2 px-1">
        <div className="flex items-center gap-1.5">
          <Maximize2 className={`w-3.5 h-3.5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <span className="text-[11px] sm:text-xs font-black">
            {label}
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            (اسحب يميناً وشمالاً لاختيار مقاس البرومبت)
          </span>
        </div>

        {currentActiveRatio ? (
          <div
            className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-black ${
              isDark
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>المقاس المطبق: </span>
            <span className="font-mono" dir="ltr">--ar {currentActiveRatio}</span>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400">انقر على أي مقاس لإدراجه تلقائياً</span>
        )}
      </div>

      {/* Horizontally Scrollable Slider Container with Left/Right navigation buttons */}
      <div className="relative group/slider flex items-center">
        {/* Scroll Right Button (In RTL moves towards right) */}
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="تمرير لليمين"
          className={`absolute right-0 z-10 hidden sm:flex h-8 w-8 -translate-x-1 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all ${
            isDark
              ? 'bg-slate-900/90 text-slate-200 border border-slate-700 hover:bg-indigo-600 hover:text-white'
              : 'bg-white/95 text-slate-700 border border-slate-300 hover:bg-indigo-600 hover:text-white'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Scrollable Track */}
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollButtons}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex items-center gap-2 overflow-x-auto py-1 px-1 select-none scrollbar-none cursor-grab active:cursor-grabbing w-full scroll-smooth`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {ASPECT_RATIO_OPTIONS.map((opt) => {
            const isActive = currentActiveRatio === opt.ratio;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectRatio(opt)}
                title={`تطبيق المقاس ${opt.name} (${opt.param})`}
                className={`shrink-0 flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all active:scale-95 border-2 shadow-2xs ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/40 scale-102'
                    : isDark
                    ? 'border-slate-800 bg-slate-900/90 text-slate-300 hover:border-indigo-500 hover:bg-slate-800 hover:text-white'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/80 hover:text-indigo-950'
                }`}
              >
                {/* Visual Ratio Icon */}
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isDark
                      ? 'bg-slate-800 text-indigo-400'
                      : 'bg-slate-100 text-indigo-600'
                  }`}
                >
                  {opt.icon}
                </span>

                {/* Ratio Name / Dimension (Clean & Compact without description) */}
                <span className="font-black whitespace-nowrap text-xs">
                  {opt.name}
                </span>

                {/* Aspect ratio param badge */}
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-800 text-indigo-100'
                      : isDark
                      ? 'bg-slate-800 text-emerald-400'
                      : 'bg-slate-100 text-indigo-700'
                  }`}
                  dir="ltr"
                >
                  {opt.ratio}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scroll Left Button */}
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="تمرير لليسار"
          className={`absolute left-0 z-10 hidden sm:flex h-8 w-8 translate-x-1 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all ${
            isDark
              ? 'bg-slate-900/90 text-slate-200 border border-slate-700 hover:bg-indigo-600 hover:text-white'
              : 'bg-white/95 text-slate-700 border border-slate-300 hover:bg-indigo-600 hover:text-white'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
