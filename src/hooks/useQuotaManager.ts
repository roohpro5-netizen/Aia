import { useState, useEffect, useCallback } from 'react';

const QUOTA_STORAGE_KEY = 'ai_hub_quota_v1';
const MAX_DAILY_QUOTA = 5;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

interface StoredQuota {
  used: number;
  firstUsedTimestamp: number;
}

export function useQuotaManager() {
  const [usedCount, setUsedCount] = useState<number>(0);
  const [resetTimestamp, setResetTimestamp] = useState<number>(0);

  // Load quota from localStorage
  const loadQuota = useCallback(() => {
    try {
      const raw = localStorage.getItem(QUOTA_STORAGE_KEY);
      const now = Date.now();

      if (raw) {
        const parsed: StoredQuota = JSON.parse(raw);
        // Check if 24 hours have passed since the first attempt of the cycle
        if (now - parsed.firstUsedTimestamp >= TWENTY_FOUR_HOURS_MS) {
          // Reset cycle
          localStorage.removeItem(QUOTA_STORAGE_KEY);
          setUsedCount(0);
          setResetTimestamp(0);
        } else {
          setUsedCount(parsed.used);
          setResetTimestamp(parsed.firstUsedTimestamp + TWENTY_FOUR_HOURS_MS);
        }
      } else {
        setUsedCount(0);
        setResetTimestamp(0);
      }
    } catch (e) {
      console.error('Error loading quota manager state', e);
      setUsedCount(0);
    }
  }, []);

  useEffect(() => {
    loadQuota();
    const interval = setInterval(loadQuota, 30000);
    return () => clearInterval(interval);
  }, [loadQuota]);

  // Use one generation attempt
  const useAttempt = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem(QUOTA_STORAGE_KEY);
      const now = Date.now();
      let currentUsed = 0;
      let firstTimestamp = now;

      if (raw) {
        const parsed: StoredQuota = JSON.parse(raw);
        if (now - parsed.firstUsedTimestamp < TWENTY_FOUR_HOURS_MS) {
          currentUsed = parsed.used;
          firstTimestamp = parsed.firstUsedTimestamp;
        }
      }

      if (currentUsed >= MAX_DAILY_QUOTA) {
        return false; // Exhausted
      }

      const newUsed = currentUsed + 1;
      const dataToSave: StoredQuota = {
        used: newUsed,
        firstUsedTimestamp: currentUsed === 0 ? now : firstTimestamp
      };

      localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(dataToSave));
      setUsedCount(newUsed);
      setResetTimestamp(dataToSave.firstUsedTimestamp + TWENTY_FOUR_HOURS_MS);
      return true;
    } catch (e) {
      console.error('Error recording quota attempt', e);
      return true;
    }
  }, []);

  const resetQuota = useCallback(() => {
    localStorage.removeItem(QUOTA_STORAGE_KEY);
    setUsedCount(0);
    setResetTimestamp(0);
  }, []);

  const remainingQuota = Math.max(0, MAX_DAILY_QUOTA - usedCount);
  const isExhausted = remainingQuota === 0;

  // External Gemini Redirection Handler with Prompt Copy
  const handleExternalGemini = useCallback((promptToCopy?: string) => {
    if (promptToCopy) {
      try {
        navigator.clipboard.writeText(promptToCopy);
      } catch (err) {
        console.warn('Clipboard write error', err);
      }
    }
    window.open('https://gemini.google.com/', '_blank', 'noopener,noreferrer');
  }, []);

  return {
    usedCount,
    maxQuota: MAX_DAILY_QUOTA,
    remainingQuota,
    isExhausted,
    useAttempt,
    resetQuota,
    resetTimestamp,
    handleExternalGemini
  };
}
