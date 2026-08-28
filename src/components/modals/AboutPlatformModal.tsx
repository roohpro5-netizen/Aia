import React from 'react';
import { Sparkles, X, Layers, Award, Zap, Cpu, CheckCircle2 } from 'lucide-react';
import { WINDOWS_INFO } from '../../data/defaultData';

interface AboutPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutPlatformModal: React.FC<AboutPlatformModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="about-platform-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-3xl border-2 border-emerald-500/60 bg-slate-950 text-white shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(16,185,129,0.3)] animate-in zoom-in-95 duration-200">
        
        {/* Dynamic Emerald/Green Accent Top Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 shrink-0" />

        {/* Header with Emerald Theme */}
        <div className="flex items-center justify-between border-b border-emerald-900/60 p-5 sm:p-6 shrink-0 bg-emerald-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-emerald-50">
                عن منصة Rooh الذكية (About Platform)
              </h3>
              <p className="text-xs text-emerald-300/80">
                منظومة متطورة لهندسة وتوليد برومبتات ووسائط الذكاء الاصطناعي بدقة مربعة 1:1
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-900/50 border border-emerald-700/50 text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
          
          {/* Main Description */}
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/50 p-4 space-y-2">
            <h4 className="font-black text-sm text-emerald-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>رؤية منصة Rooh وهندسة الأوامر</span>
            </h4>
            <p className="text-emerald-100/90 text-[11px] leading-relaxed">
              تم بناء منصة <strong>Rooh</strong> لتمكين المبدعين والمصممين وصناع المحتوى من الوصول الفوري لأقوى برومبتات الذكاء الاصطناعي الهندسية المعتمدة لنماذج Midjourney, FLUX, Stable Diffusion, Kling AI, Runway, Sora مع دعم المخرجات المربعة 1:1 بجودة 4K فائقة.
            </p>
          </div>

          {/* Portals Grid */}
          <div className="space-y-2.5">
            <h4 className="font-black text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>البوابات الست التفاعلية وأكوادها الرقمية:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 1, name: 'بوابة 1: الصور الواقعية', code: '101+', tag: 'Photorealistic' },
                { id: 2, name: 'بوابة 2: الفن الرقمي والأنمي', code: '201+', tag: '3D & Anime' },
                { id: 3, name: 'بوابة 3: الفيديو السينمائي 4K', code: '301+', tag: 'Cinematic 4K' },
                { id: 4, name: 'بوابة 4: الشعارات والهوية البصرية', code: '401+', tag: 'Logos & Brand' },
                { id: 5, name: 'بوابة 5: الإعلانات التجارية الموجهة', code: '501+', tag: 'Commercial Ads' },
                { id: 6, name: 'بوابة 6: الهندسة العكسية وتحليل الصور', code: '601+', tag: 'Vision AI' }
              ].map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-emerald-900/40 bg-slate-900/80 p-2.5 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-100 text-[11px] block">{p.name}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">{p.tag}</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-300 text-[10px] bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                    {p.code}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div className="rounded-xl border border-emerald-900/40 bg-slate-900/70 p-3.5 space-y-2">
            <h4 className="font-black text-sm text-emerald-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-400" />
              <span>البنية السحابية وشبكة الحافة العالمية</span>
            </h4>
            <p className="text-slate-300 text-[11px]">
              تعتمد المنصة على بنية تحتية سحابية متقدمة عبر سحابة <strong>Cloudflare Workers, R2 Storage, D1 SQL, KV Cache</strong> لتقديم أداء فائق السرعة وتحديثات لحظية ومزامنة فورية مع الدومين الرئيسي.
            </p>
          </div>

          <div className="border-t border-emerald-900/60 pt-3 text-[11px] text-emerald-400/80 flex items-center justify-between">
            <span>الإصدار: 2026</span>
            <span className="font-mono text-emerald-400">Rooh Engine • Powered by AI</span>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-emerald-900/60 p-4 bg-emerald-950/80 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
