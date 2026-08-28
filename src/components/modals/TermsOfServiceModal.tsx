import React from 'react';
import { FileText, X, ShieldCheck, Scale, Award, AlertCircle } from 'lucide-react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="terms-of-service-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-3xl border-2 border-amber-500/60 bg-slate-950 text-white shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(245,158,11,0.3)] animate-in zoom-in-95 duration-200">
        
        {/* Dynamic Yellow/Amber Accent Top Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 shrink-0" />

        {/* Header with Amber/Yellow Theme */}
        <div className="flex items-center justify-between border-b border-amber-900/60 p-5 sm:p-6 shrink-0 bg-amber-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/25 text-amber-300 border border-amber-400/40 shadow-inner">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-50">
                شروط الاستخدام والترخيص (Terms of Service)
              </h3>
              <p className="text-xs text-amber-300/80">
                الحقوق والالتزامات المنظمة لاستخدام وتوليد البرومبتات والوسائط
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-900/50 border border-amber-700/50 text-amber-200 hover:bg-amber-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
          
          {/* Highlight Badge */}
          <div className="rounded-2xl border border-amber-500/40 bg-amber-950/50 p-4 space-y-1.5">
            <h4 className="font-black text-sm text-amber-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>الاستخدام المجاني المفتوح 100%</span>
            </h4>
            <p className="text-amber-100/90 text-[11px]">
              تمنحك منصة Rooh ترخيصاً مجانياً وغير حصري لاستخدام ونسخ وتطبيق كافة البرومبتات في مشاريعك وتصاميمك الشخصية والتجارية دون أي مقابل مادي.
            </p>
          </div>

          {/* Term 1 */}
          <div className="rounded-xl border border-amber-900/40 bg-slate-900/70 p-3.5 space-y-1.5">
            <h4 className="font-black text-sm text-amber-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>1. حدود الاستخدام والمحاولات اليومية</span>
            </h4>
            <p className="text-slate-300 text-[11px]">
              يحصل كل مستخدم على رصيد مجاني يتجدد تلقائياً كل 24 ساعة لنسخ وتوليد البرومبتات وتصفح البوابات الست، بهدف توفير الخدمة بسلاسة لجميع الزوار.
            </p>
          </div>

          {/* Term 2 */}
          <div className="rounded-xl border border-amber-900/40 bg-slate-900/70 p-3.5 space-y-1.5">
            <h4 className="font-black text-sm text-amber-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-yellow-400" />
              <span>2. حقوق الملكية الفكرية للبرومبتات</span>
            </h4>
            <p className="text-slate-300 text-[11px]">
              تخضع البرومبتات الهندسية والصور المرجعية للمراجعة والتحسين المستمر من قِبل المشرفين والمطور، وتتاح للعامة للإلهام والتطوير والإبداع.
            </p>
          </div>

          {/* Term 3 */}
          <div className="rounded-xl border border-amber-900/40 bg-slate-900/70 p-3.5 space-y-1.5">
            <h4 className="font-black text-sm text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              <span>3. المحتوى المحظور وسياسة الاستخدام العادل</span>
            </h4>
            <p className="text-slate-300 text-[11px]">
              يُمنع استخدام المنصة في محاولة استخراج أو هندسة برومبتات تتضمن محتوى ضار أو مسيء أو مخالف للقيم الأخلاقية، وتُحظر الهجمات البرمجية أو محاولات إغراق الخوادم.
            </p>
          </div>

          <div className="border-t border-amber-900/60 pt-3 text-[11px] text-amber-400/80 flex items-center justify-between">
            <span>سارية المفعول: 2026</span>
            <span className="font-mono text-yellow-400">Terms of Service • Rooh</span>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-amber-900/60 p-4 bg-amber-950/80 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/30 transition-all cursor-pointer"
          >
            موافق وإغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
