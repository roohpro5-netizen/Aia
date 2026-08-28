import React from 'react';
import { Shield, X, Lock, Eye, Database, Globe, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="privacy-policy-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-3xl border-2 border-blue-500/60 bg-slate-950 text-white shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(59,130,246,0.3)] animate-in zoom-in-95 duration-200">
        
        {/* Dynamic Blue Accent Top Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-500 shrink-0" />

        {/* Header with Blue Theme */}
        <div className="flex items-center justify-between border-b border-blue-900/60 p-5 sm:p-6 shrink-0 bg-blue-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/25 text-blue-300 border border-blue-400/40 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-blue-50">
                سياسة الخصوصية وأمان البيانات (Privacy Policy)
              </h3>
              <p className="text-xs text-blue-300/80">
                منصة Rooh - حماية بياناتك وتجربة استخدام خالية من التعقب غير المصرح به
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-900/50 border border-blue-700/50 text-blue-200 hover:bg-blue-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
          
          <div className="rounded-2xl border border-blue-500/40 bg-blue-950/50 p-4 space-y-1.5">
            <h4 className="font-bold text-sm text-blue-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>التزامنا الكامل بالخصوصية والأمان</span>
            </h4>
            <p className="text-blue-100/90 text-[11px]">
              نحن في منصة "Rooh" نضع خصوصية وأمان مستخدمينا في صميم أولوياتنا. لا نقوم ببيع أو مشاركة بياناتك الشخصية مع أي جهات خارجية لأغراض تسويقية أو تجارية.
            </p>
          </div>

          <div className="rounded-xl border border-blue-900/40 bg-slate-900/70 p-3.5 space-y-1.5">
            <h4 className="font-black text-sm text-blue-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-400" />
              <span>1. البيانات التي يتم التعامل معها</span>
            </h4>
            <p className="text-slate-300 text-[11px]">
              يقوم التطبيق بتخزين بعض البيانات محلياً على متصفحك (LocalStorage) مثل عدد المحاولات اليومية وقائمة البرومبتات المفضلة لضمان استجابة المنصة فورياً. عند استخدام ميزة تسجيل الدخول، يتم حفظ البريد الإلكتروني بشكل مشفر لتأمين وتوثيق حسابك.
            </p>
          </div>

          <div className="rounded-xl border border-blue-900/40 bg-slate-900/70 p-3.5 space-y-1.5">
            <h4 className="font-black text-sm text-blue-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>2. تخزين الوسائط السحابي الآمن</span>
            </h4>
            <p className="text-slate-300 text-[11px]">
              يتم استضافة ومعالجة صور وصفحات البوابات الست عبر سحابة <strong>Cloudflare Edge</strong> الموزعة عالمياً، مما يمنحك سرعة فائقة وتشفير SSL/TLS آمن للاتصالات بين متصفحك وخوادم المنصة.
            </p>
          </div>

          <div className="rounded-xl border border-blue-900/40 bg-slate-900/70 p-3.5 space-y-1.5">
            <h4 className="font-black text-sm text-blue-300 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>3. الشبكات الإعلانية وشروط العرض</span>
            </h4>
            <p className="text-slate-300 text-[11px]">
              لتوفير التطبيق مجاناً بنسبة 100% لجميع المستخدمين، نعتمد على مساحات إعلانية مدمجة وإعلانات بمكافأة غير متطفلة عند نسخ البرومبتات، وتخضع لمعايير الخصوصية القياسية.
            </p>
          </div>

          <div className="rounded-xl border border-blue-900/40 bg-slate-900/70 p-3.5 space-y-1.5">
            <h4 className="font-black text-sm text-blue-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>4. حقوقك وإمكانية مسح البيانات</span>
            </h4>
            <p className="text-slate-300 text-[11px]">
              يمكنك في أي وقت ومن خلال نافذة إدارة الحساب النقر على "حذف الحساب وإعادة تعيين البيانات" لمسح كافة السجلات والمعلومات المخزنة على متصفحك فوراً.
            </p>
          </div>

          <div className="border-t border-blue-900/60 pt-3 text-[11px] text-blue-400/80 flex items-center justify-between">
            <span>آخر تحديث: 2026</span>
            <span className="font-mono text-sky-400">Rooh Privacy Engine • Secure</span>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-blue-900/60 p-4 bg-blue-950/80 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
