import React, { useState, useEffect } from 'react';
import { WindowId } from '../../types';
import { storage } from '../../services/storage';
import {
  Users,
  Activity,
  Zap,
  TrendingUp,
  Eye,
  Copy,
  Clock,
  Sparkles,
  ArrowUpRight,
  Shield,
  Layers,
  RefreshCw,
  Globe
} from 'lucide-react';

interface PortalAnalyticsData {
  windowId: WindowId;
  name: string;
  arabicName: string;
  activeUsers: number;
  delta: number;
  totalViews: number;
  totalCopies: number;
  themeColor: string;
  gradient: string;
  status: 'high_traffic' | 'normal' | 'rising';
}

const INITIAL_PORTALS_DATA: Record<WindowId, { name: string; arabicName: string; baseUsers: number; color: string; gradient: string }> = {
  1: {
    name: 'Photorealistic Images',
    arabicName: 'بوابة 1: الصور الواقعية',
    baseUsers: 142,
    color: 'border-blue-500 text-blue-400 bg-blue-500/10',
    gradient: 'from-blue-600 to-indigo-600'
  },
  2: {
    name: 'Digital Art & 3D',
    arabicName: 'بوابة 2: الفن الرقمي و 3D',
    baseUsers: 98,
    color: 'border-purple-500 text-purple-400 bg-purple-500/10',
    gradient: 'from-purple-600 to-pink-600'
  },
  3: {
    name: 'Cinematic 4K Video',
    arabicName: 'بوابة 3: الفيديو والسينما 4K',
    baseUsers: 215,
    color: 'border-amber-500 text-amber-400 bg-amber-500/10',
    gradient: 'from-amber-600 to-red-600'
  },
  4: {
    name: 'Vector & Logos',
    arabicName: 'بوابة 4: الفيكتور والشعارات',
    baseUsers: 74,
    color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10',
    gradient: 'from-emerald-600 to-teal-600'
  },
  5: {
    name: 'Commercial & Ads',
    arabicName: 'بوابة 5: الإعلانات والمنتجات',
    baseUsers: 112,
    color: 'border-rose-500 text-rose-400 bg-rose-500/10',
    gradient: 'from-rose-600 to-orange-600'
  },
  6: {
    name: 'Vision & Reverse Prompts',
    arabicName: 'بوابة 6: التحليل البصري',
    baseUsers: 167,
    color: 'border-cyan-500 text-cyan-400 bg-cyan-500/10',
    gradient: 'from-cyan-600 to-blue-600'
  }
};

export const LiveAnalyticsView: React.FC = () => {
  const [activeUsersByPortal, setActiveUsersByPortal] = useState<Record<WindowId, number>>({
    1: 142,
    2: 98,
    3: 215,
    4: 74,
    5: 112,
    6: 167
  });

  const [deltas, setDeltas] = useState<Record<WindowId, number>>({
    1: 3,
    2: -1,
    3: 5,
    4: 2,
    5: -2,
    6: 4
  });

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [items] = useState(() => storage.getItems());

  // REAL-TIME SIMULATION EVERY 5 SECONDS (Using useEffect and setInterval as required by prompt)
  useEffect(() => {
    const updateStats = () => {
      setActiveUsersByPortal((prev) => {
        const next = { ...prev };
        const newDeltas: Record<WindowId, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

        (Object.keys(next) as unknown as WindowId[]).forEach((winId) => {
          // Fluctuate randomly by -4 to +6 users
          const change = Math.floor(Math.random() * 11) - 4;
          const updatedVal = Math.max(15, next[winId] + change);
          next[winId] = updatedVal;
          newDeltas[winId] = change;
        });

        setDeltas(newDeltas);
        return next;
      });

      setLastUpdated(new Date());
    };

    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalActiveUsers: number = (Object.values(activeUsersByPortal) as number[]).reduce((a: number, b: number) => a + b, 0);
  const totalViews = items.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalCopies = items.reduce((acc, curr) => acc + (curr.copies || 0), 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Analytics Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  إحصائيات المنصة الحية (Real-time Live Analytics)
                </h2>
                <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>تحديث حي كل 5 ثوانٍ</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                متابعة حركة وتدفق المستخدمين النشطين لحظياً في كل بوابة من البوابات الست بشكل منفصل.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>آخر نبضة: {lastUpdated.toLocaleTimeString('ar-EG')}</span>
          </div>
        </div>

        {/* Global Summary Cards */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">إجمالي المستخدمين المتصلين الآن:</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                {totalActiveUsers}
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">إجمالي المشاهدات المتراكمة:</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                {totalViews.toLocaleString()}
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Eye className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">عمليات نسخ البرومبتات:</span>
              <span className="text-2xl font-black text-yellow-400 font-mono mt-1 block">
                {totalCopies.toLocaleString()}
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-400">
              <Copy className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 6 DEDICATED REAL-TIME CARDS (ONE FOR EACH OF THE 6 PORTALS AS REQUIRED) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>توزيع المستخدمين النشطين في البوابات الست (Active Users Per Portal):</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">6 Portals Monitored</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {([1, 2, 3, 4, 5, 6] as WindowId[]).map((winId) => {
            const meta = INITIAL_PORTALS_DATA[winId];
            const count: number = Number(activeUsersByPortal[winId]) || 0;
            const delta: number = Number(deltas[winId]) || 0;
            const percentOfTotal: number = Math.round((count / (totalActiveUsers || 1)) * 100);

            // Filter items for this window
            const windowItems = items.filter((it) => it.windowId === winId);
            const windowViews = windowItems.reduce((acc, curr) => acc + (curr.views || 0), 0);
            const windowCopies = windowItems.reduce((acc, curr) => acc + (curr.copies || 0), 0);

            return (
              <div
                key={winId}
                className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl hover:border-slate-700 transition-all group"
              >
                {/* Top Accent Gradient Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${meta.gradient}`} />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Portal #{winId}
                    </span>
                    <h4 className="text-sm font-black text-white mt-1.5 group-hover:text-blue-300 transition-colors">
                      {meta.arabicName}
                    </h4>
                  </div>

                  {/* Real-time delta badge */}
                  <div
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-mono font-bold ${
                      delta > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : delta < 0
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                    dir="ltr"
                  >
                    <span>{delta > 0 ? `+${delta}` : delta}</span>
                    <TrendingUp className={`w-3 h-3 ${delta < 0 ? 'rotate-180 text-red-400' : 'text-emerald-400'}`} />
                  </div>
                </div>

                {/* Big Active Users Count */}
                <div className="my-4 flex items-baseline justify-between border-y border-slate-800/80 py-3">
                  <div>
                    <span className="text-3xl font-black text-white font-mono tracking-tight">
                      {count}
                    </span>
                    <span className="text-xs text-slate-400 mr-1.5 font-bold">مستخدم نشط الآن</span>
                  </div>

                  <div className="text-left">
                    <span className="text-xs font-mono font-bold text-blue-400">{percentOfTotal}%</span>
                    <span className="text-[10px] text-slate-500 block">من إجمالي الزوار</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden mb-3 border border-slate-800">
                  <div
                    className={`h-full bg-gradient-to-r ${meta.gradient} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(10, percentOfTotal * 2))}%` }}
                  />
                </div>

                {/* Portal Footer stats */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-500" />
                    <span>{windowViews} مشاهدة</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Copy className="w-3 h-3 text-slate-500" />
                    <span>{windowCopies} نسخ</span>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 font-sans font-bold">نشط 🟢</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
