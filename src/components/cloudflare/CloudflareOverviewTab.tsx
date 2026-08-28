import React, { useState } from 'react';
import { useCloudflare } from '../../context/CloudflareContext';
import {
  Cloud,
  Database,
  HardDrive,
  Key,
  Activity,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Shield,
  Layers,
  Sparkles,
  Download,
  Server
} from 'lucide-react';

interface Props {
  onNavigateTab: (tab: 'overview' | 'r2' | 'd1' | 'kv' | 'settings') => void;
}

export const CloudflareOverviewTab: React.FC<Props> = ({ onNavigateTab }) => {
  const {
    config,
    telemetry,
    refreshTelemetry,
    testConnection,
    isConnecting,
    syncItemsToR2,
    warmUpPromptCache,
    exportSqlDump
  } = useCloudflare();

  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; message: string } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleTestPing = async () => {
    const res = await testConnection();
    setTestResult(res);
    refreshTelemetry();
    setTimeout(() => setTestResult(null), 6000);
  };

  const handleQuickSyncR2 = () => {
    const count = syncItemsToR2();
    setActionNotice(`تم مزامنة ${count} عنصر وسائط بنجاح مع مستودع Cloudflare R2!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleWarmCache = () => {
    const count = warmUpPromptCache();
    setActionNotice(`تم تهيئة وتحميل ${count} برومبت في ذاكرة الحافة السريعة KV Edge!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleDownloadDump = () => {
    const sql = exportSqlDump();
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rooh_d1_backup_${new Date().toISOString().slice(0, 10)}.sql`;
    a.click();
    URL.revokeObjectURL(url);
    setActionNotice('تم تصدير نسخة قاعدة البيانات D1 بصيغة .sql بنجاح!');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner with Real-time Edge Ping */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-orange-950/60 via-slate-900 to-slate-950 p-6 border-2 border-orange-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 shadow-inner">
              <Cloud className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">منظومة Cloudflare السحابية المتكاملة</h3>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Edge Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                ربط شامل لمستودع الكائنات R2، قاعدة البيانات السريعة D1 SQLite، وذاكرة التخزين المؤقتة KV على حافة الشبكة العالمية.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleTestPing}
              disabled={isConnecting}
              className="flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 font-black px-4 py-2.5 text-xs transition-all shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
              <span>{isConnecting ? 'جارٍ الفحص...' : 'فحص الاتصال الفوري (Ping)'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('settings')}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 text-xs font-bold transition-all"
            >
              <span>المفاتيح والإعدادات</span>
            </button>
          </div>
        </div>

        {/* Test Result Toast */}
        {testResult && (
          <div
            className={`mt-4 flex items-center justify-between rounded-xl p-3.5 text-xs font-bold border ${
              testResult.success
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/80 border-red-500/40 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
            <span className="font-mono text-[11px] bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-700">
              Latency: {testResult.latencyMs}ms
            </span>
          </div>
        )}

        {/* Action Notice */}
        {actionNotice && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-950/80 border border-blue-500/40 p-3 text-xs font-bold text-blue-200 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}
      </div>

      {/* 3 Core Architecture Cards (R2, D1, KV) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Cloudflare R2 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl flex flex-col justify-between hover:border-orange-500/40 transition-all group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">مستودع الكائنات R2</h4>
                  <span className="text-[10px] text-slate-400 font-mono">S3-Compatible Storage</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                0$ Egress Fees
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">اسم الـ Bucket:</span>
                <span className="font-mono text-orange-300 font-bold">{config.r2.bucketName || 'rooh-media-vault'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الملفات المخزنة:</span>
                <span className="font-bold text-white">{telemetry.r2ObjectCount} ملف</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">المساحة المستخدمة:</span>
                <span className="font-mono text-slate-200">{formatBytes(telemetry.r2StorageUsedBytes)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('r2')}
              className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform"
            >
              <span>فتح مستعرض R2</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleQuickSyncR2}
              title="مزامنة وسائط النوافذ إلى R2"
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg transition-colors"
            >
              مزامنة فورية
            </button>
          </div>
        </div>

        {/* Card 2: Cloudflare D1 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl flex flex-col justify-between hover:border-blue-500/40 transition-all group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">قاعدة البيانات D1</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Serverless SQLite</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                Edge SQL
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">قاعدة البيانات:</span>
                <span className="font-mono text-blue-300 font-bold">{config.d1.databaseName || 'rooh_db'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">إجمالي السجلات:</span>
                <span className="font-bold text-white">{telemetry.d1TotalRows} سجل</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">حجم البيانات:</span>
                <span className="font-mono text-slate-200">{formatBytes(telemetry.d1DbSizeBytes)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('d1')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform"
            >
              <span>فتح وحدة تحكم SQL</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDownloadDump}
              title="تصدير نسخة احتياطية SQL"
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>تصدير SQL</span>
            </button>
          </div>
        </div>

        {/* Card 3: Cloudflare KV */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl flex flex-col justify-between hover:border-emerald-500/40 transition-all group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">ذاكرة الحافة KV Store</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Global Key-Value Edge</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Ultra Low Latency
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">مساحة التسمية (Namespace):</span>
                <span className="font-mono text-emerald-300 font-bold">{config.kv.namespaceName || 'ROOH_KV'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">المفاتيح النشطة:</span>
                <span className="font-bold text-white">{telemetry.kvKeysCount} مفتاح</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">نسبة إصابة الكاش (Hit Ratio):</span>
                <span className="font-mono text-emerald-300 font-bold">98.4%</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('kv')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform"
            >
              <span>إدارة مفاتيح KV</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleWarmCache}
              title="تخزين جميع البرومبتات في الكاش"
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg transition-colors"
            >
              تسخين الكاش
            </button>
          </div>
        </div>
      </div>

      {/* Cloudflare Edge Telemetry & Real-time Metrics Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-400" />
            <h4 className="text-sm font-bold text-white">مؤشرات الأداء اللحظية لشبكة Cloudflare Edge</h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">Region: Middle East / Frankfurt Pop</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">طلبات الحافة (24h Requests)</span>
            <span className="text-base font-black text-white font-mono">{telemetry.edgeRequests24h.toLocaleString()}</span>
          </div>

          <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">متوسط زمن الاستجابة (Latency)</span>
            <span className="text-base font-black text-emerald-400 font-mono">{telemetry.avgLatencyMs} ms</span>
          </div>

          <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">حالة الـ Worker Endpoint</span>
            <span className="text-base font-black text-blue-400 flex items-center gap-1.5">
              <Server className="w-4 h-4" />
              <span>Healthy</span>
            </span>
          </div>

          <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">الحماية من الهجمات (WAF / DDoS)</span>
            <span className="text-base font-black text-amber-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>Shield Active</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
