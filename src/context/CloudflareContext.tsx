import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CloudflareConfig,
  R2ObjectItem,
  D1QueryResult,
  D1TableInfo,
  KVEntryItem,
  CloudflareTelemetry,
  WindowId
} from '../types';
import { cloudflareService } from '../services/cloudflareService';
import { storage } from '../services/storage';

interface CloudflareContextType {
  config: CloudflareConfig;
  updateConfig: (newConfig: Partial<CloudflareConfig>) => void;
  telemetry: CloudflareTelemetry;
  refreshTelemetry: () => void;
  
  // R2 Operations
  r2Objects: R2ObjectItem[];
  uploadR2File: (file: { name: string; size: number; type: string; base64OrUrl?: string }, folder?: string, windowId?: WindowId) => Promise<R2ObjectItem>;
  deleteR2Object: (key: string) => boolean;
  syncItemsToR2: () => number;
  
  // D1 Operations
  d1Tables: D1TableInfo[];
  executeD1Sql: (sql: string) => Promise<D1QueryResult>;
  queryHistory: D1QueryResult[];
  exportSqlDump: () => string;
  
  // KV Operations
  kvEntries: KVEntryItem[];
  putKVEntry: (key: string, value: string, ttlSeconds?: number) => KVEntryItem;
  deleteKVEntry: (key: string) => boolean;
  purgeKVCache: () => number;
  warmUpPromptCache: () => number;

  // Connection & Health
  isConnecting: boolean;
  testConnection: () => Promise<{ success: boolean; latencyMs: number; message: string }>;
}

const CloudflareContext = createContext<CloudflareContextType | undefined>(undefined);

export const CloudflareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<CloudflareConfig>(() => cloudflareService.getConfig());
  const [telemetry, setTelemetryState] = useState<CloudflareTelemetry>(() => cloudflareService.getTelemetry());
  const [r2Objects, setR2ObjectsState] = useState<R2ObjectItem[]>(() => cloudflareService.listR2Objects());
  const [d1Tables, setD1TablesState] = useState<D1TableInfo[]>(() => cloudflareService.getD1Tables());
  const [kvEntries, setKVEntriesState] = useState<KVEntryItem[]>(() => cloudflareService.listKVEntries());
  const [queryHistory, setQueryHistory] = useState<D1QueryResult[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const refreshAllState = () => {
    setConfigState(cloudflareService.getConfig());
    setTelemetryState(cloudflareService.getTelemetry());
    setR2ObjectsState(cloudflareService.listR2Objects());
    setD1TablesState(cloudflareService.getD1Tables());
    setKVEntriesState(cloudflareService.listKVEntries());
  };

  const updateConfig = (newConfig: Partial<CloudflareConfig>) => {
    const updated = cloudflareService.updateConfig(newConfig);
    setConfigState(updated);
    refreshAllState();
  };

  const refreshTelemetry = () => {
    setTelemetryState(cloudflareService.getTelemetry());
  };

  // R2 Methods
  const uploadR2File = async (
    file: { name: string; size: number; type: string; base64OrUrl?: string },
    folder: string = 'media-assets',
    windowId?: WindowId
  ) => {
    const res = await cloudflareService.uploadR2Object(file, folder, windowId);
    setR2ObjectsState(cloudflareService.listR2Objects());
    refreshTelemetry();
    return res;
  };

  const deleteR2Object = (key: string) => {
    const ok = cloudflareService.deleteR2Object(key);
    if (ok) {
      setR2ObjectsState(cloudflareService.listR2Objects());
      refreshTelemetry();
    }
    return ok;
  };

  const syncItemsToR2 = () => {
    const items = storage.getItems();
    const count = cloudflareService.syncMediaItemsToR2(items);
    setR2ObjectsState(cloudflareService.listR2Objects());
    refreshTelemetry();
    return count;
  };

  // D1 Methods
  const executeD1Sql = async (sql: string) => {
    const res = await cloudflareService.executeD1Query(sql);
    setQueryHistory((prev) => [res, ...prev.slice(0, 19)]);
    setD1TablesState(cloudflareService.getD1Tables());
    refreshTelemetry();
    return res;
  };

  const exportSqlDump = () => {
    return cloudflareService.exportD1SqlDump();
  };

  // KV Methods
  const putKVEntry = (key: string, value: string, ttlSeconds?: number) => {
    const entry = cloudflareService.putKVEntry(key, value, ttlSeconds);
    setKVEntriesState(cloudflareService.listKVEntries());
    refreshTelemetry();
    return entry;
  };

  const deleteKVEntry = (key: string) => {
    const ok = cloudflareService.deleteKVEntry(key);
    if (ok) {
      setKVEntriesState(cloudflareService.listKVEntries());
      refreshTelemetry();
    }
    return ok;
  };

  const purgeKVCache = () => {
    const { purgedKeys } = cloudflareService.purgeKVCache();
    setKVEntriesState([]);
    refreshTelemetry();
    return purgedKeys;
  };

  const warmUpPromptCache = () => {
    const count = cloudflareService.warmUpPromptCache();
    setKVEntriesState(cloudflareService.listKVEntries());
    refreshTelemetry();
    return count;
  };

  // Connection Test
  const testConnection = async () => {
    setIsConnecting(true);
    try {
      const res = await cloudflareService.testConnection();
      if (res.success) {
        updateConfig({ isConnected: true, lastSyncTimestamp: Date.now() });
      }
      return res;
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <CloudflareContext.Provider
      value={{
        config,
        updateConfig,
        telemetry,
        refreshTelemetry,
        r2Objects,
        uploadR2File,
        deleteR2Object,
        syncItemsToR2,
        d1Tables,
        executeD1Sql,
        queryHistory,
        exportSqlDump,
        kvEntries,
        putKVEntry,
        deleteKVEntry,
        purgeKVCache,
        warmUpPromptCache,
        isConnecting,
        testConnection
      }}
    >
      {children}
    </CloudflareContext.Provider>
  );
};

export const useCloudflare = () => {
  const context = useContext(CloudflareContext);
  if (!context) {
    throw new Error('useCloudflare must be used within a CloudflareProvider');
  }
  return context;
};
