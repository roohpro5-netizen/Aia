import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ShieldAlert, Sparkles, Key } from 'lucide-react';

interface SecretDotProps {
  onUnlock: () => void;
}

export const SecretDot: React.FC<SecretDotProps> = ({ onUnlock }) => {
  const [clicks, setClicks] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    const next = clicks + 1;

    if (next >= 5) {
      // Trigger celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.1 },
        colors: ['#f59e0b', '#fbbf24', '#fef08a', '#6366f1']
      });
      setClicks(0);
      setShowHint(false);
      onUnlock();
    } else {
      setClicks(next);
      setShowHint(true);
      resetTimerRef.current = setTimeout(() => {
        setClicks(0);
        setShowHint(false);
      }, 3500);
    }
  };

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* The 5-click secret yellow dot */}
      <button
        id="developer-secret-yellow-dot"
        onClick={handleClick}
        title="نقطة المطور السرية (5 نقرات)"
        aria-label="Secret Developer Dot"
        className="group relative flex h-7 w-7 items-center justify-center rounded-full transition-transform active:scale-90 focus:outline-none"
      >
        {/* Glow halo */}
        <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-amber-400 opacity-40 duration-1000" />
        
        {/* Yellow Dot Core */}
        <span
          className={`relative inline-flex h-3 w-3 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-md shadow-amber-500/50 transition-all duration-300 ${
            clicks > 0 ? 'scale-125 ring-4 ring-amber-400/40 bg-amber-300' : 'hover:scale-110'
          }`}
        />
      </button>

      {/* Progress Popup for developer */}
      {clicks > 0 && (
        <div className="absolute top-9 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap rounded-lg border border-yellow-300 bg-white px-3 py-1.5 shadow-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-800">
            <Key className="w-3.5 h-3.5 text-yellow-600" />
            <span>نقرة {clicks} من 5 لفتح لوحة التحكم</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-yellow-500 transition-all duration-200"
              style={{ width: `${(clicks / 5) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
