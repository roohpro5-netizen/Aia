import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, Wifi, WifiOff, Zap } from 'lucide-react';
import { verifyApiKey, AIProvider, ApiVerificationResult } from '../../services/apiVerification';

interface ApiStatusBadgeProps {
  provider: AIProvider;
  apiKey?: string;
  autoRefreshIntervalSeconds?: number;
  onStatusChange?: (result: ApiVerificationResult) => void;
  className?: string;
}

export const ApiStatusBadge: React.FC<ApiStatusBadgeProps> = ({
  provider,
  apiKey,
  autoRefreshIntervalSeconds = 30,
  onStatusChange,
  className = ''
}) => {
  const [result, setResult] = useState<ApiVerificationResult>({
    provider,
    status: 'testing',
    latencyMs: 0,
    message: 'جاري فحص الاتصال الحي...',
    timestamp: Date.now()
  });
  const [isLoading, setIsLoading] = useState(false);

  const runCheck = async () => {
    setIsLoading(true);
    try {
      const res = await verifyApiKey(provider, apiKey);
      setResult(res);
      if (onStatusChange) {
        onStatusChange(res);
      }
    } catch (e: any) {
      setResult({
        provider,
        status: 'network_error',
        latencyMs: 0,
        message: 'فشل الفحص',
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runCheck();
    if (autoRefreshIntervalSeconds > 0) {
      const interval = setInterval(runCheck, autoRefreshIntervalSeconds * 1000);
      return () => clearInterval(interval);
    }
  }, [provider, apiKey]);

  const isConnected = result.status === 'connected';
  const isInvalidKey = result.status === 'invalid_key';
  const isNetworkError = result.status === 'network_error';

  return (
    <div
      className={`inline-flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3 text-xs shadow-sm transition-all ${
        isLoading
          ? 'border-blue-500/40 bg-blue-950/40 text-blue-300'
          : isConnected
          ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200 shadow-emerald-900/10'
          : isInvalidKey
          ? 'border-red-500/40 bg-red-950/60 text-red-200 shadow-red-900/10'
          : 'border-amber-500/40 bg-amber-950/60 text-amber-200'
      } ${className}`}
      dir="rtl"
    >
      <div className="flex items-center gap-2.5">
        {/* Pulsing indicator dot */}
        <div className="relative flex h-3 w-3 items-center justify-center">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
              isLoading
                ? 'bg-blue-400'
                : isConnected
                ? 'bg-emerald-400'
                : isInvalidKey
                ? 'bg-red-400'
                : 'bg-amber-400'
            }`}
          />
          <span
            className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
              isLoading
                ? 'bg-blue-500'
                : isConnected
                ? 'bg-emerald-500'
                : isInvalidKey
                ? 'bg-red-500'
                : 'bg-amber-500'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 font-bold">
          {isLoading ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-400" />
              <span>جاري التحقق الحي...</span>
            </>
          ) : isConnected ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-300">متصل (Connected)</span>
            </>
          ) : isInvalidKey ? (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
              <span className="text-red-300">خطأ في المفتاح (Invalid Key)</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="text-amber-300">خطأ في الشبكة (Offline)</span>
            </>
          )}
        </div>

        <span className="text-slate-400 hidden sm:inline">•</span>

        <span className="text-[11px] opacity-90 truncate max-w-[280px]">
          {result.message}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {result.latencyMs > 0 && (
          <span
            className="flex items-center gap-1 rounded-lg bg-black/40 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-300 border border-slate-700/50"
            dir="ltr"
          >
            <Zap className="h-2.5 w-2.5 text-amber-400" />
            <span>{result.latencyMs}ms</span>
          </span>
        )}

        <button
          type="button"
          onClick={runCheck}
          disabled={isLoading}
          title="إعادة فحص الاتصال الحي الآن"
          className="rounded-lg bg-slate-800/80 hover:bg-slate-700 p-1.5 text-slate-300 hover:text-white transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};
