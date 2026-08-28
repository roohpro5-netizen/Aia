import React, { useState } from 'react';
import { useCloudflare } from '../../context/CloudflareContext';
import { D1QueryResult, D1TableInfo } from '../../types';
import {
  Database,
  Play,
  Download,
  Table,
  Layers,
  Terminal,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const D1DatabaseManager: React.FC = () => {
  const { config, d1Tables, executeD1Sql, queryHistory, exportSqlDump } = useCloudflare();
  const [sqlQuery, setSqlQuery] = useState('SELECT id, numeric_code, window_id, title, model, views, copies FROM media_items LIMIT 20;');
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentResult, setCurrentResult] = useState<D1QueryResult | null>(null);
  const [selectedTable, setSelectedTable] = useState<D1TableInfo | null>(d1Tables[0] || null);
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const sampleQueries = [
    {
      title: 'عرض عناصر الوسائط',
      sql: 'SELECT id, numeric_code, window_id, title, model, views, copies FROM media_items LIMIT 20;'
    },
    {
      title: 'إعلانات المنصة والرعاة',
      sql: 'SELECT id, sponsor_name, title, target_url, impressions, clicks FROM ads_banners;'
    },
    {
      title: 'إحصائيات النوافذ الست',
      sql: 'SELECT window_id, count(*) as total_items, sum(views) as total_views, sum(copies) as total_copies FROM media_items GROUP BY window_id;'
    },
    {
      title: 'استعلام هيكل الجداول PRAGMA',
      sql: 'PRAGMA table_info(media_items);'
    }
  ];

  const handleRunQuery = async () => {
    if (!sqlQuery.trim()) return;
    setIsExecuting(true);
    try {
      const res = await executeD1Sql(sqlQuery.trim());
      setCurrentResult(res);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSelectSample = (sql: string) => {
    setSqlQuery(sql);
  };

  const handleDownloadSql = () => {
    const dump = exportSqlDump();
    const blob = new Blob([dump], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudflare_d1_${config.d1.databaseName || 'rooh_db'}_dump.sql`;
    a.click();
    URL.revokeObjectURL(url);
    setSyncNotice('تم تصدير ملف الـ SQL الكامل بنجاح!');
    setTimeout(() => setSyncNotice(null), 4000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top D1 Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>وحدة تحكم واستعلامات Cloudflare D1 SQL</span>
                <span className="text-xs font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                  DB: {config.d1.databaseName}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                قاعدة بيانات SQLite موزعة على حافة السحابة (Edge-Native) تمنحك استعلامات فائقة السرعة مع حماية تامة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSql}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>تصدير Schema & Data (.sql)</span>
            </button>
          </div>
        </div>

        {syncNotice && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 p-3 text-xs font-bold text-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}

        {/* Available D1 Tables Badges */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 font-bold whitespace-nowrap">جداول D1:</span>
          {d1Tables.map((tbl) => (
            <button
              key={tbl.name}
              onClick={() => {
                setSelectedTable(tbl);
                setSqlQuery(`SELECT * FROM ${tbl.name} LIMIT 25;`);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedTable?.name === tbl.name
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>{tbl.name}</span>
              <span className="text-[10px] opacity-75">({tbl.rowCount})</span>
            </button>
          ))}
        </div>
      </div>

      {/* SQL Terminal & Query Editor */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-200">محرر استعلامات D1 SQL Console</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySql}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors text-[11px] flex items-center gap-1"
            >
              {copiedQuery ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>نسخ الاستعلام</span>
            </button>

            <button
              onClick={handleRunQuery}
              disabled={isExecuting || !sqlQuery.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold px-3.5 py-1.5 text-xs transition-all shadow-md disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 fill-white ${isExecuting ? 'animate-spin' : ''}`} />
              <span>{isExecuting ? 'جارٍ التنفيذ...' : 'تشغيل الاستعلام (Run)'}</span>
            </button>
          </div>
        </div>

        {/* Quick Query Templates */}
        <div className="p-2.5 bg-slate-900/50 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 font-bold whitespace-nowrap">نماذج سريعة:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSelectSample(sq.sql)}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-sans"
            >
              {sq.title}
            </button>
          ))}
        </div>

        <div className="p-4">
          <textarea
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            rows={4}
            dir="ltr"
            placeholder="اكتب استعلام SQL هنا (SELECT, INSERT, UPDATE, PRAGMA)..."
            className="w-full bg-transparent font-mono text-sm leading-relaxed text-blue-300 placeholder-slate-600 focus:outline-none resize-y"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
            }}
          />
        </div>
      </div>

      {/* Query Execution Results */}
      {currentResult && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl space-y-3">
          {/* Metadata bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              {currentResult.success ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم تنفيذ الاستعلام بنجاح</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>فشل تنفيذ الاستعلام</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{currentResult.meta.durationMs}ms</span>
              </span>
              <span>•</span>
              <span>الصفوف المقروءة: {currentResult.meta.rowsRead}</span>
              {currentResult.meta.rowsWritten > 0 && (
                <>
                  <span>•</span>
                  <span className="text-emerald-400">الصفوف المعدلة: {currentResult.meta.rowsWritten}</span>
                </>
              )}
            </div>
          </div>

          {currentResult.error ? (
            <div className="p-4 text-xs font-mono text-red-400 bg-red-950/30 border border-red-900/40 rounded-xl m-4" dir="ltr">
              Error: {currentResult.error}
            </div>
          ) : currentResult.results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              تم تنفيذ الأمر بنجاح، لا توجد صفوف ناتجة للعرض.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-right text-xs" dir="ltr">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] sticky top-0 border-b border-slate-800">
                  <tr>
                    {Object.keys(currentResult.results[0] || {}).map((col) => (
                      <th key={col} className="p-3 font-bold whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono text-slate-200">
                  {currentResult.results.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-slate-800/40 transition-colors">
                      {Object.values(row).map((val: any, colIdx) => (
                        <td key={colIdx} className="p-3 whitespace-nowrap max-w-xs truncate text-[11px]">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val ?? 'NULL')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Selected Table Schema Information */}
      {selectedTable && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>هيكل الجدول (Schema): <span className="font-mono text-blue-300">{selectedTable.name}</span></span>
            </h4>
            <span className="text-xs text-slate-400 font-mono">{selectedTable.columns.length} Columns</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {selectedTable.columns.map((col) => (
              <div key={col.name} className="rounded-xl bg-slate-950 p-2.5 border border-slate-800 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 truncate">{col.name}</span>
                  {col.pk && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-sans font-bold">
                      PK
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-blue-400 mt-1 block">{col.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
