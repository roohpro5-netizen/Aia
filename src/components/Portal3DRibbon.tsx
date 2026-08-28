import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  Wand2,
  Video,
  Award,
  ShoppingBag,
  ScanEye,
  Sparkles,
  Pause
} from 'lucide-react';
import { WindowId, WindowInfo } from '../types';
import { WINDOWS_INFO } from '../data/defaultData';
import { PortalNeonBadge } from './PortalNeonBadge';

interface Portal3DRibbonProps {
  activeWindowId: WindowId;
  onSelectWindow: (winId: WindowId) => void;
  className?: string;
}

// Icon mapping for 3D windows
const portalIcons: Record<number, React.ReactNode> = {
  1: <Camera className="w-4 h-4" />,
  2: <Wand2 className="w-4 h-4" />,
  3: <Video className="w-4 h-4" />,
  4: <Award className="w-4 h-4" />,
  5: <ShoppingBag className="w-4 h-4" />,
  6: <ScanEye className="w-4 h-4" />
};

// Distinct vibrant dynamic colors (Yellow, Red, Blue, White) paired for each portal
const portalShortNames: Record<number, {
  title: string;
  subtitle: string;
  badgeBg: string;
  badgeText: string;
  accentBorder: string;
  cardBg: string;
  iconBg: string;
  iconColor: string;
  tagColor: string;
}> = {
  1: {
    title: 'بوابة الصور الواقعية',
    subtitle: 'Ultra 8K & Portraits',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    accentBorder: 'border-blue-500 hover:border-blue-600',
    cardBg: 'from-blue-50 via-white to-sky-50',
    iconBg: 'bg-blue-600',
    iconColor: '#FFFFFF',
    tagColor: 'text-blue-700'
  },
  2: {
    title: 'بوابة الفن الرقمي والأنيمي',
    subtitle: '3D Anime & Cyberpunk',
    badgeBg: 'bg-yellow-400',
    badgeText: 'text-slate-950 font-black',
    accentBorder: 'border-yellow-400 hover:border-yellow-500',
    cardBg: 'from-amber-50 via-white to-yellow-50',
    iconBg: 'bg-yellow-400',
    iconColor: '#1e293b',
    tagColor: 'text-yellow-800'
  },
  3: {
    title: 'بوابة الفيديو والرسوم الحركية',
    subtitle: 'Cinematic Motion AI',
    badgeBg: 'bg-red-600',
    badgeText: 'text-white',
    accentBorder: 'border-red-500 hover:border-red-600',
    cardBg: 'from-red-50 via-white to-rose-50',
    iconBg: 'bg-red-600',
    iconColor: '#FFFFFF',
    tagColor: 'text-red-700'
  },
  4: {
    title: 'بوابة الشعارات والهويات',
    subtitle: 'Vector & Brand Marks',
    badgeBg: 'bg-blue-700',
    badgeText: 'text-white',
    accentBorder: 'border-blue-400 hover:border-blue-600',
    cardBg: 'from-sky-50 via-white to-indigo-50',
    iconBg: 'bg-blue-700',
    iconColor: '#FFFFFF',
    tagColor: 'text-blue-800'
  },
  5: {
    title: 'بوابة الإعلانات والموك أب',
    subtitle: 'Commercial & Studio 3D',
    badgeBg: 'bg-yellow-500',
    badgeText: 'text-slate-950 font-black',
    accentBorder: 'border-yellow-500 hover:border-yellow-600',
    cardBg: 'from-yellow-50 via-white to-amber-50',
    iconBg: 'bg-yellow-500',
    iconColor: '#0f172a',
    tagColor: 'text-amber-800'
  },
  6: {
    title: 'بوابة الهندسة العكسية',
    subtitle: 'Reverse Vision & Prompt AI',
    badgeBg: 'bg-red-700',
    badgeText: 'text-white',
    accentBorder: 'border-red-400 hover:border-red-600',
    cardBg: 'from-rose-50 via-white to-red-50',
    iconBg: 'bg-red-700',
    iconColor: '#FFFFFF',
    tagColor: 'text-red-800'
  }
};

export const Portal3DRibbon: React.FC<Portal3DRibbonProps> = ({
  activeWindowId,
  onSelectWindow,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Speed: pixels per second, direction: 1 (left-to-right) or -1 (right-to-left)
  const [direction, setDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [pauseCountdown, setPauseCountdown] = useState<number>(0);
  
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);
  
  // Drag & Swipe handling
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const scrollStartRef = useRef<number>(0);
  const dragDeltaRef = useRef<number>(0);

  // Duplicate items 4 times to ensure seamless infinite looping marquee
  const loopList: WindowInfo[] = [
    ...WINDOWS_INFO,
    ...WINDOWS_INFO,
    ...WINDOWS_INFO,
    ...WINDOWS_INFO
  ];

  // Pause for exactly 3 seconds on user interaction and resume in selected direction
  const triggerThreeSecondPause = useCallback((newDirection?: number) => {
    if (newDirection !== undefined && newDirection !== 0) {
      setDirection(newDirection);
    }

    setIsPaused(true);
    setPauseCountdown(3);

    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Countdown 3 -> 2 -> 1 -> 0
    countdownIntervalRef.current = setInterval(() => {
      setPauseCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
      setPauseCountdown(0);
    }, 3000);
  }, []);

  // Continuous 60fps marquee engine
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (scrollRef.current && !isPaused && !isDraggingRef.current) {
        const speed = 36; // Pixels per second
        const scrollAmount = speed * delta * direction;
        scrollRef.current.scrollLeft += scrollAmount;

        const maxScroll = scrollRef.current.scrollWidth / 2;
        // Infinite wrap-around check
        if (scrollRef.current.scrollLeft >= maxScroll) {
          scrollRef.current.scrollLeft -= maxScroll / 2;
        } else if (scrollRef.current.scrollLeft <= 0) {
          scrollRef.current.scrollLeft += maxScroll / 2;
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isPaused, direction]);

  // Center initial view comfortably
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth / 4;
    }
  }, []);

  // Mouse & Touch Drag Event Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    dragDeltaRef.current = 0;
    if (scrollRef.current) {
      scrollStartRef.current = scrollRef.current.scrollLeft;
    }
    triggerThreeSecondPause();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    const currentX = e.clientX;
    const diff = currentX - startXRef.current;
    dragDeltaRef.current = diff;
    
    // Invert difference for intuitive natural touch scrolling
    scrollRef.current.scrollLeft = scrollStartRef.current - diff;
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const diff = dragDeltaRef.current;
    if (Math.abs(diff) > 10) {
      const newDir = diff > 0 ? -1 : 1; // Natural momentum direction
      triggerThreeSecondPause(newDir);
    } else {
      triggerThreeSecondPause();
    }
  };

  const handlePortalClick = (winId: WindowId) => {
    triggerThreeSecondPause();
    onSelectWindow(winId);
  };

  return (
    <div
      ref={containerRef}
      id="dynamic-3d-portal-ribbon"
      className={`relative w-full overflow-hidden rounded-2xl border-2 border-yellow-300/80 bg-gradient-to-r from-blue-50 via-white to-amber-50 p-2.5 sm:p-3.5 shadow-md ${className}`}
      dir="ltr"
    >
      {/* Dynamic Pause Notice Indicator */}
      {isPaused && (
        <div className="absolute top-2 left-3 z-30 flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-black text-yellow-300 shadow-md border border-yellow-400/50 animate-bounce" dir="rtl">
          <Pause className="w-3 h-3 text-yellow-400" />
          <span>توقف مؤقت: {pauseCountdown}ث</span>
        </div>
      )}

      {/* 3D Ribbon Scroll Viewport with Fade Overlays */}
      <div className="relative w-full overflow-hidden">
        {/* Left & Right Soft Dynamic Fog Gradients */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-8 sm:w-12 bg-gradient-to-r from-blue-50/90 via-blue-50/40 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-8 sm:w-12 bg-gradient-to-l from-amber-50/90 via-amber-50/40 to-transparent" />

        <div
          ref={scrollRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex items-center gap-3.5 overflow-x-hidden py-2 px-3 cursor-grab active:cursor-grabbing select-none"
          style={{
            perspective: '1200px',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {loopList.map((win, idx) => {
            const isActive = win.id === activeWindowId;
            const meta = portalShortNames[win.id] || {
              title: win.arabicName,
              subtitle: win.name,
              badgeBg: 'bg-blue-600',
              badgeText: 'text-white',
              accentBorder: 'border-blue-500',
              cardBg: 'from-blue-50 via-white to-sky-50',
              iconBg: 'bg-blue-600',
              iconColor: '#FFFFFF',
              tagColor: 'text-blue-700'
            };

            return (
              <button
                key={`portal-3d-card-${win.id}-${idx}`}
                type="button"
                onClick={() => handlePortalClick(win.id)}
                dir="rtl"
                className={`group relative shrink-0 text-right transition-all duration-300 transform-gpu cursor-pointer ${
                  isActive
                    ? 'scale-105 -translate-y-1 shadow-xl ring-2 ring-yellow-400'
                    : 'hover:scale-102 hover:-translate-y-0.5 opacity-95 hover:opacity-100 shadow-sm'
                }`}
                style={{
                  width: '235px',
                  borderRadius: '16px'
                }}
              >
                {/* 3D Dynamic Colorful Window Container */}
                <div
                  className={`relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br ${meta.cardBg} p-3.5 transition-all ${
                    isActive
                      ? 'border-yellow-400 shadow-md ring-1 ring-yellow-300'
                      : `border-slate-200 hover:${meta.accentBorder} hover:shadow-md`
                  }`}
                  style={{
                    boxShadow: isActive
                      ? '0 10px 24px -4px rgba(234, 179, 8, 0.35), 0 4px 8px rgba(37, 99, 235, 0.15), inset 0 1px 1px rgba(255,255,255,0.9)'
                      : '0 4px 12px -2px rgba(0,0,0,0.06), inset 0 1px 1px rgba(255,255,255,0.8)'
                  }}
                >
                  {/* Top Glossy Light Reflection Bar */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent" />

                  {/* Header Row: Real Portal Icon + Status Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl border border-white/60 shadow-xs transition-transform group-hover:scale-110 ${meta.iconBg}`}
                      style={{ color: meta.iconColor }}
                    >
                      {portalIcons[win.id] || <Sparkles className="w-4 h-4" />}
                    </div>

                    <div className="flex items-center gap-1">
                      <PortalNeonBadge
                        windowId={win.id}
                        isActive={isActive}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Real Portal Title (Arabic) */}
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-1 group-hover:text-blue-700">
                      {meta.title}
                    </h4>
                    <p className="text-[10px] font-semibold text-slate-500 line-clamp-1">
                      {meta.subtitle}
                    </p>
                  </div>

                  {/* 3D Bottom Action Bar */}
                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/90 pt-2 text-[10px]">
                    <span className="font-mono font-bold text-slate-500 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/70">
                      {win.codeRange}
                    </span>
                    <span
                      className={`font-bold transition-colors ${
                        isActive ? 'text-red-600 font-black' : `${meta.tagColor} group-hover:underline`
                      }`}
                    >
                      {isActive ? 'تتصفح الآن ✓' : 'دخول البوابة ←'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
