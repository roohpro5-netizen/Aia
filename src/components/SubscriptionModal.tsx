import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Bell, BellRing, Check, Sparkles, X, Zap, ShieldCheck, Smartphone, CheckCircle2 } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [dailyPrompts, setDailyPrompts] = useState(true);
  const [newPortals, setNewPortals] = useState(true);
  const [flashIdeas, setFlashIdeas] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'granted') {
        setIsSubscribed(true);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubscribeOneSignal = async () => {
    try {
      // 1. Request browser notification permission
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      }

      // 2. Trigger OneSignal SDK if loaded
      if (typeof window !== 'undefined' && (window as any).OneSignal) {
        try {
          await (window as any).OneSignal.push(() => {
            (window as any).OneSignal.showSlidedownPrompt();
          });
        } catch (err) {
          console.log('OneSignal prompt trigger', err);
        }
      }

      // 3. Save local preference
      localStorage.setItem('onesignal_subscribed', 'true');
      localStorage.setItem(
        'onesignal_preferences',
        JSON.stringify({ dailyPrompts, newPortals, flashIdeas, timestamp: new Date().toISOString() })
      );

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.3 },
        colors: ['#F59E0B', '#3B82F6', '#EF4444', '#10B981']
      });

      setIsSubscribed(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (e) {
      console.error(e);
      setIsSubscribed(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-yellow-400 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.35),0_0_30px_rgba(250,204,21,0.3)] animate-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Top Accent Bar */}
        <div className="tricolor-bar">
          <span />
          <span />
          <span />
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7 text-right">
          {/* Header Badge */}
          <div className="text-center max-w-md mx-auto mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 text-amber-900 border border-yellow-300 text-xs font-black mb-2.5 shadow-2xs">
              <BellRing className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
              <span>اشتراك الإشعارات والتنبيهات اليومية (OneSignal)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              تفعيل الإشعارات والتحديثات اليومية
            </h2>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              اشترك مجاناً لتصلك أحدث برومبتات الذكاء الاصطناعي، النوافذ المضافة حديثاً، والأكواد البرمجية مباشرة على هاتفك أو متصفحك عبر نظام الإشعارات الفورية (OneSignal).
            </p>
          </div>

          {/* Feature Options */}
          <div className="space-y-2.5 mb-6">
            <div
              onClick={() => setDailyPrompts(!dailyPrompts)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                dailyPrompts
                  ? 'border-yellow-400 bg-yellow-50/60 shadow-xs'
                  : 'border-slate-200 bg-slate-50 opacity-70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">برومبتات ذكاء اصطناعي يومية حصرية</h4>
                  <p className="text-[11px] text-slate-600">إشعار يومي بأقوى البرومبتات لتوليد الصور والفيديو</p>
                </div>
              </div>
              <div className={`flex h-5 w-5 items-center justify-center rounded-lg border ${dailyPrompts ? 'bg-amber-500 border-amber-600 text-slate-950 font-black' : 'border-slate-300 bg-white'}`}>
                {dailyPrompts && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            <div
              onClick={() => setNewPortals(!newPortals)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                newPortals
                  ? 'border-yellow-400 bg-yellow-50/60 shadow-xs'
                  : 'border-slate-200 bg-slate-50 opacity-70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shrink-0 shadow-xs">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">تنبيهات البوابات والنوافذ الجديدة</h4>
                  <p className="text-[11px] text-slate-600">إشعار فوري عند إضافة نوافذ أو نماذج جديدة للذكاء الاصطناعي</p>
                </div>
              </div>
              <div className={`flex h-5 w-5 items-center justify-center rounded-lg border ${newPortals ? 'bg-amber-500 border-amber-600 text-slate-950 font-black' : 'border-slate-300 bg-white'}`}>
                {newPortals && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            <div
              onClick={() => setFlashIdeas(!flashIdeas)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                flashIdeas
                  ? 'border-yellow-400 bg-yellow-50/60 shadow-xs'
                  : 'border-slate-200 bg-slate-50 opacity-70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shrink-0 shadow-xs">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">استدعاء الأفكار والرسائل التفاعلية</h4>
                  <p className="text-[11px] text-slate-600">رسائل تنبيه مباشرة لتجربة أحدث الميزات البرمجية</p>
                </div>
              </div>
              <div className={`flex h-5 w-5 items-center justify-center rounded-lg border ${flashIdeas ? 'bg-amber-500 border-amber-600 text-slate-950 font-black' : 'border-slate-300 bg-white'}`}>
                {flashIdeas && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              id="confirm-onesignal-subscribe-btn"
              onClick={handleSubscribeOneSignal}
              className="w-full py-3 rounded-2xl bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 hover:brightness-105 active:translate-y-0.5 border border-yellow-200 border-b-[3.5px] border-b-amber-600 text-slate-950 font-black text-sm transition-all shadow-[0_4px_14px_rgba(245,158,11,0.45)] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubscribed ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-800" />
                  <span>تم تفعيل إشعارات OneSignal بنجاح! 🎉</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>تفعيل استقبال الإشعارات اليومية الآن (مجاناً)</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium text-center">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>اشتراك مجاني بالكامل لاستلام التنبيهات عبر OneSignal بدون أي رسوم</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

