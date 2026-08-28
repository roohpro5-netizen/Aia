import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Home, Bell, Check } from 'lucide-react';
import { WindowId } from '../types';

interface NavbarProps {
  currentView: 'home' | 'window' | 'item';
  activeWindowId: WindowId | null;
  onGoHome: () => void;
  onSelectWindow: (winId: WindowId) => void;
  onOpenDevPanel: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  activeWindowId,
  onGoHome,
  onSelectWindow,
  onOpenDevPanel
}) => {
  const [logoClicks, setLogoClicks] = useState<number>(0);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('user_subscribed_notifications') === 'true' ||
        (typeof Notification !== 'undefined' && Notification.permission === 'granted')
      );
    }
    return false;
  });
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Instant one-click subscription without any modal
  const handleDirectSubscribe = async () => {
    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.15 },
      colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']
    });

    // Update state to Subscribed
    setIsSubscribed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_subscribed_notifications', 'true');

      // Request browser notification permission silently
      if ('Notification' in window && Notification.permission !== 'granted') {
        try {
          await Notification.requestPermission();
        } catch (e) {
          console.log('Notification permission request', e);
        }
      }

      // Trigger OneSignal if available
      if ((window as any).OneSignal) {
        try {
          (window as any).OneSignal.push(() => {
            (window as any).OneSignal.showSlidedownPrompt?.();
          });
        } catch (e) {
          console.log('OneSignal trigger', e);
        }
      }
    }
  };

  // 5 clicks on the Logo image triggers the developer control panel
  const handleLogoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    const nextClicks = logoClicks + 1;

    if (nextClicks >= 5) {
      setLogoClicks(0);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.1 },
        colors: ['#2563EB', '#EAB308', '#EF4444']
      });
      onOpenDevPanel();
    } else {
      setLogoClicks(nextClicks);
      resetTimerRef.current = setTimeout(() => {
        setLogoClicks(0);
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full header-3d-frame text-slate-800 backdrop-blur-md">
      {/* Primary Tri-Color Accent Line (Blue, Yellow, Red) with 3D Gloss */}
      <div className="tricolor-bar">
        <span />
        <span />
        <span />
      </div>

      {/* 3D Inner Bezel & Lighting Container */}
      <div className="mx-auto flex h-16 sm:h-[4.5rem] max-w-7xl items-center justify-between px-3.5 sm:px-8">
        {/* Right side (in RTL): Brand & 5-Click Secret Logo with 3D styling */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-right">
            {/* The 3D Logo Box (5-Click developer trigger) */}
            <button
              type="button"
              id="brand-logo-secret-trigger"
              onClick={handleLogoClick}
              title="المساعد الذكي (انقر 5 مرات للدخول للمطور)"
              className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 text-white font-black text-xl shadow-[0_4px_10px_rgba(37,99,235,0.45),inset_0_1px_1px_rgba(255,255,255,0.6)] border border-blue-400 border-b-[3px] border-b-blue-900 hover:scale-105 active:translate-y-0.5 active:shadow-xs transition-all cursor-pointer select-none"
            >
              <span className="drop-shadow-xs">A</span>
              {/* 3D Badge Indicator */}
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-gradient-to-tr from-red-600 to-rose-400 border-2 border-white shadow-xs" />
            </button>

            {/* App title that returns home on click */}
            <button
              type="button"
              onClick={onGoHome}
              className="text-right hover:opacity-90 transition-opacity group"
            >
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  المساعد الذكي
                </h1>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 hidden md:block">
                مكتبة وسائط الذكاء الاصطناعي بنمط متناسق وهندسة البرومبت
              </p>
            </button>
          </div>
        </div>

        {/* Center / Left Navigation Action Slot (Direct 3D Subscribe or Home Button) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentView === 'home' ? (
            /* ON HOME VIEW: Instant Direct 3D Subscribe / Subscribed Toggle Button */
            <button
              type="button"
              id="nav-subscribe-btn"
              onClick={handleDirectSubscribe}
              className={isSubscribed ? 'btn-3d-subscribed' : 'btn-3d-subscribe'}
              title={isSubscribed ? 'أنت مشترك بالفعل في إشعارات OneSignal اليومية' : 'انقر للاشتراك المباشر في الإشعارات والتنبيهات اليومية'}
            >
              {isSubscribed ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950 stroke-[3]" />
                  <span>مشترك ✓</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-amber-900 fill-amber-900 animate-bounce-subtle" />
                  <span>اشتراك</span>
                </>
              )}
            </button>
          ) : (
            /* ON OTHER VIEWS: Attractive 3D Home Button in the EXACT same slot */
            <button
              type="button"
              id="nav-home-btn"
              onClick={onGoHome}
              className="btn-3d-home"
              title="الرجوع إلى الصفحة الرئيسية"
            >
              <Home className="w-4 h-4 text-white" />
              <span>الرئيسية</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


