import React, { useState } from 'react';
import { useCloudflare } from '../../context/CloudflareContext';
import {
  Cloud,
  HardDrive,
  Database,
  Key,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const CloudflareSettingsTab: React.FC = () => {
  const { config, updateConfig, testConnection, isConnecting } = useCloudflare();
  const [formData, setFormData] = useState({
    accountId: config.accountId || '',
    apiToken: config.apiToken || '',
    zoneId: config.zoneId || '',
    workerUrl: config.workerUrl || '',
    r2BucketName: config.r2.bucketName || '',
    r2AccessKeyId: config.r2.accessKeyId || '',
    r2SecretAccessKey: config.r2.secretAccessKey || '',
    r2PublicDomain: config.r2.publicDomain || '',
    r2CorsEnabled: config.r2.corsEnabled ?? true,
    d1DatabaseId: config.d1.databaseId || '',
    d1DatabaseName: config.d1.databaseName || '',
    d1SyncIntervalMinutes: config.d1.syncIntervalMinutes || 15,
    d1AutoSync: config.d1.autoSync ?? true,
    kvNamespaceId: config.kv.namespaceId || '',
    kvNamespaceName: config.kv.namespaceName || '',
    kvEdgeTtlSeconds: config.kv.edgeTtlSeconds || 86400,
    kvAutoCachePrompts: config.kv.autoCachePrompts ?? true
  });

  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      accountId: formData.accountId.trim(),
      apiToken: formData.apiToken.trim(),
      zoneId: formData.zoneId.trim(),
      workerUrl: formData.workerUrl.trim(),
      r2: {
        bucketName: formData.r2BucketName.trim(),
        accessKeyId: formData.r2AccessKeyId.trim(),
        secretAccessKey: formData.r2SecretAccessKey.trim(),
        publicDomain: formData.r2PublicDomain.trim(),
        corsEnabled: formData.r2CorsEnabled
      },
      d1: {
        databaseId: formData.d1DatabaseId.trim(),
        databaseName: formData.d1DatabaseName.trim(),
        syncIntervalMinutes: formData.d1SyncIntervalMinutes,
        autoSync: formData.d1AutoSync
      },
      kv: {
        namespaceId: formData.kvNamespaceId.trim(),
        namespaceName: formData.kvNamespaceName.trim(),
        edgeTtlSeconds: formData.kvEdgeTtlSeconds,
        autoCachePrompts: formData.kvAutoCachePrompts
      }
    });

    setSavedNotice('تم حفظ جميع إعدادات ومفاتيح Cloudflare بنجاح!');
    setTimeout(() => setSavedNotice(null), 4000);
  };

  const handleTest = async () => {
    const res = await testConnection();
    setTestResult(res);
    setTimeout(() => setTestResult(null), 6000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">إعدادات وبيانات اعتماد Cloudflare</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              تكوين مفاتيح الـ API وربط سحابة R2 وقاعدة البيانات D1 ومساحة KV مع منصة Rooh.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTest}
            disabled={isConnecting}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 text-xs font-bold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
            <span>اختبار الاتصال</span>
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 font-black px-4 py-2 text-xs transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 p-3 text-xs font-bold text-emerald-200 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {testResult && (
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs font-bold border ${
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
          <span className="font-mono text-[11px] bg-slate-900 px-2 py-1 rounded">
            Latency: {testResult.latencyMs}ms
          </span>
        </div>
      )}

      {/* 1. Global Cloudflare Credentials */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-orange-400" />
            <h4 className="text-sm font-bold text-white">1. بيانات حساب Cloudflare الأساسية (Account & API)</h4>
          </div>
          <a
            href="https://dash.cloudflare.com/profile/api-tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1"
          >
            <span>لوحة تحكم Cloudflare</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">معرّف الحساب (Account ID):</label>
            <input
              type="text"
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              placeholder="cf_acc_7894a5e3c81290f"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">رمز الـ API المميز (API Token):</label>
            <input
              type="password"
              value={formData.apiToken}
              onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
              placeholder="••••••••••••••••••••••••••••"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">رابط الـ Worker Endpoint:</label>
            <input
              type="url"
              value={formData.workerUrl}
              onChange={(e) => setFormData({ ...formData, workerUrl: e.target.value })}
              placeholder="https://api.rooh.workers.dev"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-orange-300 font-mono focus:border-orange-500 focus:outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">معرّف النطاق (Zone ID):</label>
            <input
              type="text"
              value={formData.zoneId}
              onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
              placeholder="cf_zone_rooh_media_982103"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* 2. Cloudflare R2 Credentials */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-orange-400" />
            <h4 className="text-sm font-bold text-white">2. إعدادات مستودع الكائنات R2 (S3-Compatible)</h4>
          </div>
          <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Zero Egress Fee
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">اسم الـ Bucket (Bucket Name):</label>
            <input
              type="text"
              value={formData.r2BucketName}
              onChange={(e) => setFormData({ ...formData, r2BucketName: e.target.value })}
              placeholder="rooh-media-vault"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-orange-300 font-mono focus:border-orange-500 focus:outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">نطاق الـ CDN العام (Public Domain):</label>
            <input
              type="text"
              value={formData.r2PublicDomain}
              onChange={(e) => setFormData({ ...formData, r2PublicDomain: e.target.value })}
              placeholder="https://cdn.rooh.media"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">مفتاح الوصول R2 (Access Key ID):</label>
            <input
              type="text"
              value={formData.r2AccessKeyId}
              onChange={(e) => setFormData({ ...formData, r2AccessKeyId: e.target.value })}
              placeholder="r2_key_a8910bcf82"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">المفتاح السري R2 (Secret Access Key):</label>
            <input
              type="password"
              value={formData.r2SecretAccessKey}
              onChange={(e) => setFormData({ ...formData, r2SecretAccessKey: e.target.value })}
              placeholder="••••••••••••••••••••••••"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* 3. Cloudflare D1 & KV Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* D1 Database */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Database className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-bold text-white">3. إعدادات قاعدة بيانات D1 SQLite</h4>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">اسم قاعدة البيانات:</label>
              <input
                type="text"
                value={formData.d1DatabaseName}
                onChange={(e) => setFormData({ ...formData, d1DatabaseName: e.target.value })}
                placeholder="rooh_production_db"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-blue-300 font-mono focus:border-blue-500 focus:outline-none"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">معرّف قاعدة البيانات (Database ID):</label>
              <input
                type="text"
                value={formData.d1DatabaseId}
                onChange={(e) => setFormData({ ...formData, d1DatabaseId: e.target.value })}
                placeholder="d1-rooh-main-sql-db-001"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* KV Cache */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Key className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">4. إعدادات ذاكرة الحافة KV Namespace</h4>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">اسم مساحة التسمية (Namespace):</label>
              <input
                type="text"
                value={formData.kvNamespaceName}
                onChange={(e) => setFormData({ ...formData, kvNamespaceName: e.target.value })}
                placeholder="ROOH_EDGE_STORE"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">معرّف الـ Namespace ID:</label>
              <input
                type="text"
                value={formData.kvNamespaceId}
                onChange={(e) => setFormData({ ...formData, kvNamespaceId: e.target.value })}
                placeholder="kv_ns_rooh_edge_cache_99"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                dir="ltr"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
