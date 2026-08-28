import React, { useState, useRef } from 'react';
import { useCloudflare } from '../../context/CloudflareContext';
import { R2ObjectItem, WindowId } from '../../types';
import {
  HardDrive,
  Upload,
  Search,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  Folder,
  FileImage,
  FileCode,
  FileVideo,
  FileText,
  RefreshCw,
  Sparkles,
  Eye,
  Plus
} from 'lucide-react';

export const R2StorageManager: React.FC = () => {
  const { config, r2Objects, uploadR2File, deleteR2Object, syncItemsToR2 } = useCloudflare();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewObj, setPreviewObj] = useState<R2ObjectItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Upload Form Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadFolder, setUploadFolder] = useState('media-assets');
  const [targetWindowId, setTargetWindowId] = useState<WindowId | undefined>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folders = ['all', 'covers', '3d-assets', 'prompts-archive', 'windows', 'media-assets'];

  const filteredObjects = r2Objects.filter((obj) => {
    const matchesSearch = obj.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (obj.metadata?.author && obj.metadata.author.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedFolder === 'all') return matchesSearch;
    return matchesSearch && obj.key.startsWith(selectedFolder);
  });

  const handleCopyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDelete = (key: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الملف "${key}" من مستودع R2؟`)) {
      deleteR2Object(key);
      if (previewObj?.key === key) setPreviewObj(null);
    }
  };

  const handleSyncAll = () => {
    const count = syncItemsToR2();
    setUploadNotice(`تم فحص وسائط النوافذ ومزامنة ${count} ملف جديد مع R2 بنجاح!`);
    setTimeout(() => setUploadNotice(null), 4000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        await uploadR2File(
          {
            name: file.name,
            size: file.size,
            type: file.type,
            base64OrUrl: base64
          },
          uploadFolder,
          targetWindowId
        );
        setIsUploading(false);
        setShowUploadModal(false);
        setUploadNotice(`تم رفع الملف "${file.name}" إلى مستودع Cloudflare R2 بنجاح!`);
        setTimeout(() => setUploadNotice(null), 4000);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim() || !uploadFileName.trim()) return;

    setIsUploading(true);
    try {
      await uploadR2File(
        {
          name: uploadFileName.trim(),
          size: 250000,
          type: 'image/jpeg',
          base64OrUrl: uploadUrl.trim()
        },
        uploadFolder,
        targetWindowId
      );
      setIsUploading(false);
      setShowUploadModal(false);
      setUploadUrl('');
      setUploadFileName('');
      setUploadNotice(`تم ربط وحفظ الملف "${uploadFileName}" في مستودع R2 بنجاح!`);
      setTimeout(() => setUploadNotice(null), 4000);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return <FileImage className="w-4 h-4 text-orange-400" />;
    if (contentType.startsWith('video/')) return <FileVideo className="w-4 h-4 text-red-400" />;
    if (contentType.includes('json') || contentType.includes('sql')) return <FileCode className="w-4 h-4 text-blue-400" />;
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with R2 Bucket Info */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>مستودع الكائنات Cloudflare R2</span>
                <span className="text-xs font-mono bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">
                  Bucket: {config.r2.bucketName}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تخزين سحابي متوافق مع S3 للوسائط والصور والفيديوهات مع روابط CDN سريعة بدون رسوم Egress.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAll}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 text-xs font-bold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
              <span>مزامنة النوافذ</span>
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 font-black px-4 py-2 text-xs transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>رفع ملف جديد</span>
            </button>
          </div>
        </div>

        {uploadNotice && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 p-3 text-xs font-bold text-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadNotice}</span>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث في ملفات R2..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {folders.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFolder(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
                  selectedFolder === f
                    ? 'bg-orange-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Folder className="w-3 h-3" />
                <span>{f === 'all' ? 'جميع الملفات' : f}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* R2 Objects Grid / Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">
            النتائج المعروضة: <span className="text-orange-400 font-mono">{filteredObjects.length}</span> عنصر
          </span>
          <span className="text-xs text-slate-500 font-mono">
            CDN Domain: {config.r2.publicDomain || 'https://cdn.rooh.media'}
          </span>
        </div>

        {filteredObjects.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            لا توجد ملفات مطابقة في مستودع R2. يمكنك الضغط على "رفع ملف جديد" أو "مزامنة النوافذ".
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredObjects.map((obj) => (
              <div
                key={obj.key}
                className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 border border-slate-800">
                    {getFileIcon(obj.contentType)}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-mono font-bold text-slate-200 truncate" dir="ltr">
                      {obj.key}
                    </span>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                      <span>{formatBytes(obj.size)}</span>
                      <span>•</span>
                      <span className="font-mono">{new Date(obj.uploadedAt).toLocaleDateString('ar-EG')}</span>
                      {obj.windowId && (
                        <>
                          <span>•</span>
                          <span className="text-orange-300">نافذة {obj.windowId}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setPreviewObj(obj)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="معاينة الملف"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleCopyUrl(obj.publicUrl, obj.key)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
                    title="نسخ رابط الـ CDN المباشر"
                  >
                    {copiedKey === obj.key ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">نسخ CDN</span>
                      </>
                    )}
                  </button>

                  <a
                    href={obj.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="فتح الرابط الخارجي"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleDelete(obj.key)}
                    className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors"
                    title="حذف من R2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white font-mono truncate" dir="ltr">
                {previewObj.key}
              </h4>
              <button
                onClick={() => setPreviewObj(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-lg"
              >
                إغلاق
              </button>
            </div>

            <div className="flex justify-center bg-slate-950 rounded-xl p-2 border border-slate-800 max-h-80 overflow-hidden">
              {previewObj.contentType.startsWith('image/') ? (
                <img
                  src={previewObj.publicUrl}
                  alt={previewObj.key}
                  className="max-h-72 object-contain rounded-lg"
                />
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 font-mono">
                  {previewObj.contentType}
                </div>
              )}
            </div>

            <div className="text-xs text-slate-400 space-y-1 font-mono">
              <p>Direct Public URL: <span className="text-orange-300 break-all">{previewObj.publicUrl}</span></p>
              <p>Size: {formatBytes(previewObj.size)} • ETag: {previewObj.etag}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-orange-400" />
                <span>رفع وتخزين في Cloudflare R2</span>
              </h4>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-lg"
              >
                إلغاء
              </button>
            </div>

            {/* Drag and Drop Local File */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                1. اختيار ملف من جهازك:
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,video/*,application/json"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full border-2 border-dashed border-slate-700 hover:border-orange-500 bg-slate-950 rounded-xl p-6 text-center text-xs text-slate-400 hover:text-slate-200 transition-colors flex flex-col items-center gap-2 cursor-pointer"
              >
                <Upload className="w-6 h-6 text-orange-400" />
                <span>انقر لاختيار ملف من جهازك (صور / فيديوهات / JSON)</span>
                <span className="text-[10px] text-slate-500">يتم الرفع وتوليد رابط R2 CDN تلقائياً</span>
              </button>
            </div>

            {/* Or Direct URL Input */}
            <form onSubmit={handleUrlSubmit} className="space-y-3 pt-2 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-300">
                2. أو إدخال رابط خارجي وتخزينه في R2:
              </label>
              <input
                type="text"
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
                placeholder="اسم الملف مع الامتداد (مثال: cyber-samurai.webp)"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
              />
              <input
                type="url"
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                placeholder="رابط الصورة / الفيديو (https://...)"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-orange-300 focus:border-orange-500 focus:outline-none font-mono"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">المجلد داخل R2:</label>
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
                  >
                    <option value="covers">covers/</option>
                    <option value="3d-assets">3d-assets/</option>
                    <option value="prompts-archive">prompts-archive/</option>
                    <option value="media-assets">media-assets/</option>
                    <option value="windows">windows/</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">ربط بالنافذة:</label>
                  <select
                    value={targetWindowId || ''}
                    onChange={(e) => setTargetWindowId(e.target.value ? parseInt(e.target.value) as WindowId : undefined)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="1">نافذة 1 (صور بورتريه ومناظر)</option>
                    <option value="2">نافذة 2 (أصول ثلاثية الأبعاد)</option>
                    <option value="3">نافذة 3 (فيديوهات سينمائية)</option>
                    <option value="4">نافذة 4 (فيكتور وتصميمات)</option>
                    <option value="5">نافذة 5 (إعلانات تجارية)</option>
                    <option value="6">نافذة 6 (الهندسة العكسية)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading || !uploadUrl || !uploadFileName}
                className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black py-2.5 text-xs transition-all disabled:opacity-40 mt-2"
              >
                {isUploading ? 'جارٍ الرفع والحفظ...' : 'حفظ الملف في R2 Bucket'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
