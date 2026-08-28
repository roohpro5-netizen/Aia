import React, { useState } from 'react';
import { useCloudflare } from '../../context/CloudflareContext';
import { KVEntryItem } from '../../types';
import {
  Key,
  Plus,
  Search,
  Trash2,
  Edit,
  Clock,
  CheckCircle2,
  RefreshCw,
  Zap,
  Layers,
  Copy,
  Check,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export const KVCacheManager: React.FC = () => {
  const { config, kvEntries, putKVEntry, deleteKVEntry, purgeKVCache, warmUpPromptCache } = useCloudflare();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modal State for Add / Edit Key
  const [showModal, setShowModal] = useState(false);
  const [editingKey, setEditingKey] = useState<string>('');
  const [keyValue, setKeyValue] = useState<string>('');
  const [keyTtl, setKeyTtl] = useState<number>(86400);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const filteredEntries = kvEntries.filter(
    (e) =>
      e.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingKey('');
    setKeyValue('{\n  "status": "active",\n  "version": 1\n}');
    setKeyTtl(86400);
    setJsonError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (entry: KVEntryItem) => {
    setEditingKey(entry.key);
    setKeyValue(entry.value);
    setKeyTtl(entry.ttlSeconds || 86400);
    setJsonError(null);
    setShowModal(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey.trim()) return;

    // Check if valid JSON if user typed JSON
    if (keyValue.trim().startsWith('{') || keyValue.trim().startsWith('[')) {
      try {
        JSON.parse(keyValue);
      } catch (err: any) {
        setJsonError('تحذير: النص يبدو بصيغة JSON غير صالحة. تم الحفظ كنص عادي.');
      }
    }

    putKVEntry(editingKey.trim(), keyValue.trim(), keyTtl);
    setShowModal(false);
    setActionNotice(`تم حفظ المفتاح "${editingKey.trim()}" بنجاح في ذاكرة KV Edge!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleDelete = (key: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المفتاح "${key}" من ذاكرة الحافة KV؟`)) {
      deleteKVEntry(key);
      setActionNotice(`تم حذف المفتاح "${key}" بنجاح!`);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handlePurge = () => {
    if (window.confirm('هل أنت متأكد من تفريغ كامل ذاكرة التخزين المؤقتة KV (Purge Cache)؟')) {
      const purged = purgeKVCache();
      setActionNotice(`تم تفريغ وحذف ${purged} مفتاح من ذاكرة الحافة بنجاح!`);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleWarmUp = () => {
    const count = warmUpPromptCache();
    setActionNotice(`تم تهيئة وتحميل ${count} برومبت وسائط في ذاكرة KV Edge بنجاح!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleCopyValue = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top KV Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>ذاكرة الحافة ومخزن المفاتيح Cloudflare KV</span>
                <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                  Namespace: {config.kv.namespaceName}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تخزين المفاتيح والقيم واستجابات البرومبتات في مراكز بيانات Cloudflare العالمية بسرعة استجابة أقل من 10ms.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWarmUp}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 text-xs font-bold transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>تسخين كاش البرومبتات</span>
            </button>
            <button
              onClick={handlePurge}
              className="flex items-center gap-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 px-3 py-2 text-xs font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>تفريغ الكاش (Purge)</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black px-4 py-2 text-xs transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مفتاح جديد</span>
            </button>
          </div>
        </div>

        {actionNotice && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 p-3 text-xs font-bold text-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالمفتاح أو المحتوى (مثال: rooh:config, prompt:item)..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* KV Entries List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">
            المفاتيح المخزنة في KV: <span className="text-emerald-400 font-mono">{filteredEntries.length}</span>
          </span>
          <span className="text-xs text-slate-500 font-mono">
            TTL الافتراضي: {config.kv.edgeTtlSeconds} ثانية
          </span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            لا توجد مفاتيح مطابقة في ذاكرة KV. اضغط على "إضافة مفتاح جديد" أو "تسخين كاش البرومبتات".
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredEntries.map((entry) => (
              <div
                key={entry.key}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
              >
                <div className="min-w-0 space-y-1.5 w-full sm:w-2/3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-emerald-300 truncate" dir="ltr">
                      {entry.key}
                    </span>
                    <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800 font-mono">
                      {entry.metadata?.type || 'string'}
                    </span>
                  </div>

                  <p className="font-mono text-xs text-slate-300 bg-slate-950/80 p-2 rounded-lg border border-slate-800/80 truncate max-w-full" dir="ltr">
                    {entry.value}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                    <span>حجم: {entry.size} بايت</span>
                    <span>•</span>
                    <span>آخر تحديث: {new Date(entry.updatedAt).toLocaleTimeString('ar-EG')}</span>
                    {entry.ttlSeconds && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400/80">TTL: {entry.ttlSeconds}s</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleCopyValue(entry.value, entry.key)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
                    title="نسخ القيمة"
                  >
                    {copiedKey === entry.key ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(entry)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="تعديل القيمة"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(entry.key)}
                    className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors"
                    title="حذف المفتاح"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Key Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <span>{editingKey ? 'تعديل مفتاح في KV' : 'إضافة مفتاح جديد إلى ذاكرة KV'}</span>
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-lg"
              >
                إلغاء
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  اسم المفتاح (Key Name):
                </label>
                <input
                  type="text"
                  value={editingKey}
                  onChange={(e) => setEditingKey(e.target.value)}
                  placeholder="rooh:prompts:window:1"
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  القيمة (Value - JSON أو String):
                </label>
                <textarea
                  value={keyValue}
                  onChange={(e) => {
                    setKeyValue(e.target.value);
                    setJsonError(null);
                  }}
                  rows={6}
                  required
                  placeholder="أدخل النص أو كائن JSON هنا..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none resize-y"
                  dir="ltr"
                />
                {jsonError && (
                  <p className="text-[11px] text-amber-400 mt-1">{jsonError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  مدة الصلاحية في الكاش (TTL بالثواني):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'ساعة', val: 3600 },
                    { label: 'يوم (24h)', val: 86400 },
                    { label: 'أسبوع', val: 604800 },
                    { label: 'شهر', val: 2592000 }
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setKeyTtl(preset.val)}
                      className={`p-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        keyTtl === preset.val
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 text-xs font-black shadow-md transition-all"
                >
                  حفظ في KV Edge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
