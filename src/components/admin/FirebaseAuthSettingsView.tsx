import React, { useState } from 'react';
import {
  Flame,
  Shield,
  Key,
  Database,
  Users,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Code,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { firebaseService } from '../../services/firebaseConfig';

export const FirebaseAuthSettingsView: React.FC = () => {
  const { user, guestAttemptsRemaining, resetGuestQuota, openAuthModal, logout } = useAuth();
  const [copiedEnv, setCopiedEnv] = useState(false);
  const isConfigured = firebaseService.isFirebaseConfigured();

  const ENV_SNIPPET = `# Firebase Authentication & Firestore Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=rooh-ai-hub.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=rooh-ai-hub
VITE_FIREBASE_STORAGE_BUCKET=rooh-ai-hub.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(ENV_SNIPPET);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" dir="rtl">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  منظومة المصادقة السحابية وجاهزية Firebase (Firebase Auth Engine)
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    isConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {isConfigured ? 'Firebase Live Connected' : 'Mock / Local Mode Active (جاهز للربط)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                تجهيز كامل لكود المصادقة بحساب جوجل أو البريد الإلكتروني مع إتاحة 5 محاولات تجريبية كضيف ثم المطالبة بتسجيل الدخول.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetGuestQuota}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>إعادة ضبط عداد الضيف (5 محاولات)</span>
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
            <span className="text-[11px] text-slate-400">حالة مستخدم الجلسة:</span>
            <div className="text-sm font-bold text-white">
              {user ? user.displayName : 'مستخدم ضيف (غير مسجل)'}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">
              {user ? `UID: ${user.uid}` : 'جلسة مؤقتة في المتصفح'}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
            <span className="text-[11px] text-slate-400">المحاولات المتبقية كضيف:</span>
            <div className="text-sm font-bold text-amber-400 font-mono">
              {guestAttemptsRemaining} / 5 محاولات
            </div>
            <div className="text-[10px] text-slate-500">تتجدد تلقائياً كل 24 ساعة</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
            <span className="text-[11px] text-slate-400">ميزة ربط الحسابات:</span>
            <div className="text-sm font-bold text-blue-400">
              Google OAuth 2.0 & Email
            </div>
            <div className="text-[10px] text-slate-500">منبثقة تلقائياً بعد استنفاد الـ 5</div>
          </div>
        </div>
      </div>

      {/* Developer Environment & Migration Guide */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-400" />
            <h4 className="text-sm font-bold text-white">
              تعليمات المطور لربط مشروع Firebase الحقيقي مستقبلاً (.env Keys)
            </h4>
          </div>

          <button
            type="button"
            onClick={handleCopyEnv}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
          >
            {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>نسخ متغيرات البيئة</span>
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          عندما تقوم بنقل المشروع وترغب في ربطه بمشروع Firebase الحقيقي، يكفي إضافة المفاتيح التالية إلى ملف <code className="text-amber-300 font-mono">.env</code> أو إعدادات المنصة دون الحاجة لتغيير هيكل الكود:
        </p>

        <pre className="rounded-xl bg-slate-950 p-4 text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800" dir="ltr">
          {ENV_SNIPPET}
        </pre>

        <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/80 text-xs text-slate-400 space-y-1">
          <div className="font-bold text-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>الميزات المفعلة في الكود الحالي:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pr-2 pt-1 text-[11px]">
            <li>دعم تسجيل الدخول الفوري بـ Google Pop-up و Email/Password.</li>
            <li>نافذة مصادقة مودال ذكية تظهر تلقائياً عندما تنفد الـ 5 محاولات من الضيف.</li>
            <li>قائمة الحساب الشخصي (UserAccountMenu) في شريط التنقل العلوي لمتابعة الرصيد.</li>
            <li>تخزين محلي آمن في الـ Storage مع دعم جاهز للمزامنة مع Firestore و Cloudflare D1.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
