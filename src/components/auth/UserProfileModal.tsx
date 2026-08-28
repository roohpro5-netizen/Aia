import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  LogOut,
  Sparkles,
  Shield,
  Key,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Gift,
  HeartHandshake,
  Mail,
  Zap,
  Flame,
  Check,
  Bell,
  BellRing,
  ExternalLink,
  Sliders,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    isAuthenticated,
    guestAttemptsRemaining,
    resetGuestQuota,
    openAuthModal,
    logout
  } = useAuth();

  const [confirmWipe, setConfirmWipe] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Notification Subscription states inside the Profile Modal
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('user_subscribed_notifications') === 'true' ||
        localStorage.getItem('onesignal_subscribed') === 'true' ||
        (typeof Notification !== 'undefined' && Notification.permission === 'granted')
      );
    }
    return false;
  });

  const [dailyPrompts, setDailyPrompts] = useState(true);
  const [newPortals, setNewPortals] = useState(true);
  const [flashIdeas, setFlashIdeas] = useState(true);
  const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPref = localStorage.getItem('onesignal_preferences');
      if (savedPref) {
        try {
          const parsed = JSON.parse(savedPref);
          if (parsed.dailyPrompts !== undefined) setDailyPrompts(parsed.dailyPrompts);
          if (parsed.newPortals !== undefined) setNewPortals(parsed.newPortals);
          if (parsed.flashIdeas !== undefined) setFlashIdeas(parsed.flashIdeas);
        } catch (_) {}
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSubscription = async () => {
    if (!isSubscribed) {
      // Trigger confetti
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.35 },
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']
      });

      setIsSubscribed(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_subscribed_notifications', 'true');
        localStorage.setItem('onesignal_subscribed', 'true');
        localStorage.setItem(
          'onesignal_preferences',
          JSON.stringify({ dailyPrompts, newPortals, flashIdeas, timestamp: new Date().toISOString() })
        );

        if ('Notification' in window && Notification.permission !== 'granted') {
          try {
            await Notification.requestPermission();
          } catch (e) {
            console.log('Notification permission request', e);
          }
        }

        if ((window as any).OneSignal) {
          try {
            (window as any).OneSignal.push(() => {
              (window as any).OneSignal.showSlidedownPrompt?.();
            });
          } catch (e) {
            console.log('OneSignal prompt error', e);
          }
        }
      }

      setSuccessMsg('تم تفعيل وتأكيد اشتراكك في إشعارات البرومبتات والتحديثات بنجاح!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setIsSubscribed(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_subscribed_notifications');
        localStorage.removeItem('onesignal_subscribed');
      }
      setSuccessMsg('تم إيقاف الاشتراك في الإشعارات والتنبيهات.');
      setTimeout(() => setSuccessMsg(null), 2500);
    }
  };

  const handleSavePreferences = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'onesignal_preferences',
        JSON.stringify({ dailyPrompts, newPortals, flashIdeas, timestamp: new Date().toISOString() })
      );
    }
    setSuccessMsg('تم حفظ تفضيلات التنبيهات المخصصة');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleResetAttempts = () => {
    resetGuestQuota();
    setSuccessMsg('تم تجديد وتصفير عداد المحاولات إلى 5/5 بنجاح');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleWipeAccount = () => {
    if (isAuthenticated) {
      logout();
    }
    resetGuestQuota();
    localStorage.removeItem('rooh_user_history');
    localStorage.removeItem('user_subscribed_notifications');
    localStorage.removeItem('onesignal_subscribed');
    setConfirmWipe(false);
    setSuccessMsg('تم مسح وإعادة تعيين بيانات الجلسة بالكامل');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1500);
  };

  const remaining = isAuthenticated ? 5 : guestAttemptsRemaining;
  const percentage = (remaining / 5) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-yellow-400 bg-slate-950 text-white shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_30px_rgba(250,204,21,0.35)] animate-in zoom-in-95 duration-200">
        
        {/* Tricolor Neon Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 sm:p-7 space-y-5">
          
          {/* Header with Avatar & User Identity */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  user?.photoURL ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80'
                }
                alt={user?.displayName || 'المستخدم'}
                referrerPolicy="no-referrer"
                className="h-16 w-16 rounded-2xl object-cover border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
              />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold border-2 border-slate-950">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  {isAuthenticated ? user?.displayName : 'حساب المستخدم (User Profile)'}
                </h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isAuthenticated
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isAuthenticated ? 'عضو موثق' : 'تجربة مجانية'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {isAuthenticated ? user?.email : 'جلسة محلية آمنة في المتصفح'}
              </p>
            </div>
          </div>

          {/* PROMINENT BANNER: التطبيق بالكامل مجاني 100% */}
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 p-4 text-center shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-sm sm:text-base">
              <Gift className="w-5 h-5 text-emerald-300 animate-bounce" />
              <span>التطبيق بالكامل مجاني 100% مدى الحياة</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              جميع البوابات الست، استخراج وهندسة البرومبتات، وتحليلات الذكاء الاصطناعي متاحة مجاناً بدون أي اشتراكات أو بطاقات بنكية.
            </p>
          </div>

          {/* DAILY ATTEMPTS QUOTA COUNTER (5/5 per 24h) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  الحصة اليومية للتوليد والنسخ (Daily Quota):
                </span>
              </div>
              <span className="text-sm font-black text-amber-400 font-mono">
                {remaining} / 5 محاولات
              </span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  remaining > 2
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    : 'bg-gradient-to-r from-amber-500 to-red-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>تتجدد المحاولات تلقائياً كل 24 ساعة</span>
              <button
                type="button"
                onClick={handleResetAttempts}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة ضبط العداد</span>
              </button>
            </div>
          </div>

          {/* INTEGRATED SUBSCRIPTION & NOTIFICATION LINKING SECTION (نافذة الربط الخاصة بالاشتراك) */}
          <div className="rounded-2xl border-2 border-yellow-400/50 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/20 p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <BellRing className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>ربط اشتراك الإشعارات والتنبيهات اليومية</span>
                    {isSubscribed && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        مشترك ✓
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    استلم أحدث برومبتات الذكاء الاصطناعي والبوابات الجديدة فور إطلاقها
                  </p>
                </div>
              </div>
            </div>

            {/* Direct 3D Subscribe Toggle inside Profile Modal */}
            <div className="pt-1 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleToggleSubscription}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md ${
                  isSubscribed
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50'
                    : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 border border-yellow-200'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                    <span>أنت مشترك في الإشعارات (انقر للإلغاء)</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 text-slate-950 fill-slate-950 animate-bounce" />
                    <span>تفعيل وربط اشتراك الإشعارات الآن مجاناً</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowSubscriptionDetails(!showSubscriptionDetails)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 border border-slate-700 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showSubscriptionDetails ? 'إخفاء التفضيلات' : 'تخصيص'}</span>
              </button>
            </div>

            {/* Expandable Notification Preferences */}
            {showSubscriptionDetails && (
              <div className="pt-2 border-t border-slate-800/80 space-y-2.5 animate-in fade-in duration-150 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-slate-200 text-[11px]">برومبتات اليوم المختارة بدقة عالية</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={dailyPrompts}
                    onChange={(e) => setDailyPrompts(e.target.checked)}
                    className="accent-yellow-400 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-slate-200 text-[11px]">إشعارات البوابات والتحديثات الجديدة</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newPortals}
                    onChange={(e) => setNewPortals(e.target.checked)}
                    className="accent-yellow-400 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-slate-200 text-[11px]">تنبيهات الأفكار السريعة والتريند</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={flashIdeas}
                    onChange={(e) => setFlashIdeas(e.target.checked)}
                    className="accent-yellow-400 w-4 h-4 cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold border border-slate-700 transition-colors"
                >
                  حفظ التفضيلات
                </button>
              </div>
            )}
          </div>

          {/* Success Message Toast */}
          {successMsg && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ACTION BUTTONS (Login / Link Account / Delete) */}
          <div className="space-y-2 pt-1">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal('تسجيل الدخول يتيح لك ربط حسابك السحابي وحفظ برومبتاتك المفضلة');
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all active:scale-98 border border-white/20 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>تسجيل الدخول / ربط الحساب الشخصي السحابي</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setSuccessMsg('تم تسجيل الخروج بنجاح');
                  setTimeout(() => {
                    setSuccessMsg(null);
                    onClose();
                  }, 1200);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 py-2.5 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-slate-400" />
                <span>تسجيل الخروج من الحساب</span>
              </button>
            )}

            {/* Delete / Reset Account Action */}
            {!confirmWipe ? (
              <button
                type="button"
                onClick={() => setConfirmWipe(true)}
                className="w-full flex items-center justify-center gap-2 text-[11px] text-rose-400/80 hover:text-rose-400 py-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف الحساب وإعادة تعيين البيانات المحلية</span>
              </button>
            ) : (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-center space-y-2 animate-in fade-in">
                <p className="text-xs text-rose-300 font-bold">
                  هل أنت متأكد من رغبتك في حذف الحساب ومسح جميع البيانات المحلية؟
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleWipeAccount}
                    className="rounded-lg bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    نعم، احذف البيانات
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmWipe(false)}
                    className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
