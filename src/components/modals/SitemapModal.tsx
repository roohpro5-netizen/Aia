import React, { useState } from 'react';
import {
  X,
  Globe,
  FileCode,
  Image as ImageIcon,
  Video,
  FileText,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';
import { MediaItem } from '../../types';
import { storage } from '../../services/storage';
import {
  sitemapGenerator,
  BASE_DOMAIN,
  BASE_APP_PATH
} from '../../services/sitemapGenerator';
import { WINDOWS_INFO } from '../../data/defaultData';

interface SitemapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SitemapModal: React.FC<SitemapModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [items] = useState<MediaItem[]>(() => storage.getItems());

  if (!isOpen) return null;

  const copyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (type: 'master' | 'images' | 'videos' | 'robots') => {
    let content = '';
    let filename = '';
    let mimeType = 'application/xml';

    if (type === 'master') {
      content = sitemapGenerator.generateMasterSitemapXml(items);
      filename = 'sitemap.xml';
    } else if (type === 'images') {
      content = sitemapGenerator.generateImageSitemapXml(items);
      filename = 'sitemap-images.xml';
    } else if (type === 'videos') {
      content = sitemapGenerator.generateVideoSitemapXml(items);
      filename = 'sitemap-videos.xml';
    } else if (type === 'robots') {
      content = sitemapGenerator.generateRobotsTxt();
      filename = 'robots.txt';
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sitemaps = [
    {
      key: 'master',
      title: 'خريطة الموقع الرئيسية (Master XML)',
      filename: 'sitemap.xml',
      url: `${BASE_APP_PATH}/sitemap.xml`,
      desc: 'فهرس شامل لجميع الصفحات والبوابات والبرومبتات التفاعلية',
      icon: <FileCode className="w-5 h-5 text-emerald-500" />
    },
    {
      key: 'images',
      title: 'خريطة صور الذكاء الاصطناعي (Images XML)',
      filename: 'sitemap-images.xml',
      url: `${BASE_APP_PATH}/sitemap-images.xml`,
      desc: 'أرشفة صور البوابات الواقعية والرقمية والإعلانية مع برومبتاتها',
      icon: <ImageIcon className="w-5 h-5 text-blue-500" />
    },
    {
      key: 'videos',
      title: 'خريطة الفيديو والسينما (Videos XML)',
      filename: 'sitemap-videos.xml',
      url: `${BASE_APP_PATH}/sitemap-videos.xml`,
      desc: 'أرشفة مقاطع البوابة 3 السينمائية 4K المتوافقة مع Google Video Schema',
      icon: <Video className="w-5 h-5 text-amber-500" />
    },
    {
      key: 'robots',
      title: 'ملف توجيه العناكب (Robots.txt)',
      filename: 'robots.txt',
      url: `${BASE_APP_PATH}/robots.txt`,
      desc: 'توجيه روبوتات محركات البحث مباشرة إلى فهارس الدومين الرئيسي',
      icon: <FileText className="w-5 h-5 text-purple-500" />
    }
  ];

  return (
    <div
      id="sitemap-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm animate-in fade-in duration-150"
      dir="rtl"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                خرائط الموقع والأرشفة الديناميكية (Sitemaps)
              </h3>
              <p className="text-xs text-slate-500">
                فهارس معتمدة لمحركات البحث ترتبط بالدومين الرئيسي {BASE_DOMAIN}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 overflow-y-auto p-6 text-xs text-slate-600">
          <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-200/80 space-y-1">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>أرشفة حية وتوليد تلقائي فوري</span>
            </div>
            <p className="text-emerald-800 leading-relaxed text-xs">
              جميع عناصر الصور والفيديوهات والبرومبتات المنشأة على منصة <strong className="font-mono text-emerald-950">{BASE_APP_PATH}/</strong> تضاف وتحدّث فورياً داخل ملفات الـ XML وتُربط بالأرشفة المركزية في الدومين الرئيسي.
            </p>
          </div>

          <div className="space-y-3">
            {sitemaps.map((sm) => (
              <div
                key={sm.key}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-2.5 hover:border-emerald-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {sm.icon}
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{sm.title}</h4>
                      <p className="text-[11px] text-slate-500">{sm.desc}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600 border border-slate-200">
                    {sm.filename}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white p-2 border border-slate-200">
                  <span className="truncate font-mono text-[11px] text-emerald-700 select-all" dir="ltr">
                    {sm.url}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => copyUrl(sm.url, sm.key)}
                      className="flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 transition-colors"
                      title="نسخ الرابط"
                    >
                      {copiedKey === sm.key ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === sm.key ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                    <button
                      onClick={() => handleDownload(sm.key as any)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2.5 py-1 text-[11px] font-bold transition-colors"
                      title="تحميل الملف"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-500 flex items-center justify-between">
            <span>مسارات التطبيق الرسمية:</span>
            <span className="font-mono text-slate-700 font-bold">{BASE_APP_PATH}/*</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
