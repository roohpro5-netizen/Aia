import React, { useState } from 'react';
import { CloudflareOverviewTab } from './CloudflareOverviewTab';
import { R2StorageManager } from './R2StorageManager';
import { D1DatabaseManager } from './D1DatabaseManager';
import { KVCacheManager } from './KVCacheManager';
import { CloudflareSettingsTab } from './CloudflareSettingsTab';
import {
  Cloud,
  HardDrive,
  Database,
  Key,
  Settings,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

type CFTab = 'overview' | 'r2' | 'd1' | 'kv' | 'settings';

export const CloudflareEcosystemDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CFTab>('overview');

  const tabs: Array<{ id: CFTab; label: string; icon: React.ReactNode; badge?: string; color: string }> = [
    {
      id: 'overview',
      label: 'نظرة عامة والربط',
      icon: <Activity className="w-4 h-4" />,
      color: 'hover:text-orange-400'
    },
    {
      id: 'r2',
      label: 'مستودع R2 (S3 Storage)',
      icon: <HardDrive className="w-4 h-4" />,
      badge: '0$ Egress',
      color: 'hover:text-orange-400'
    },
    {
      id: 'd1',
      label: 'قاعدة بيانات D1 SQL',
      icon: <Database className="w-4 h-4" />,
      badge: 'SQLite Edge',
      color: 'hover:text-blue-400'
    },
    {
      id: 'kv',
      label: 'مخزن المفاتيح KV Cache',
      icon: <Key className="w-4 h-4" />,
      badge: '<10ms',
      color: 'hover:text-emerald-400'
    },
    {
      id: 'settings',
      label: 'بيانات الاعتماد والمفاتيح',
      icon: <Settings className="w-4 h-4" />,
      color: 'hover:text-slate-300'
    }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl bg-slate-950 p-1.5 border border-slate-800 shadow-inner">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md scale-100 font-black'
                  : `text-slate-400 hover:text-white hover:bg-slate-900 ${tab.color}`
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? 'bg-black/20 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Body */}
      <div>
        {activeTab === 'overview' && <CloudflareOverviewTab onNavigateTab={setActiveTab} />}
        {activeTab === 'r2' && <R2StorageManager />}
        {activeTab === 'd1' && <D1DatabaseManager />}
        {activeTab === 'kv' && <KVCacheManager />}
        {activeTab === 'settings' && <CloudflareSettingsTab />}
      </div>
    </div>
  );
};
