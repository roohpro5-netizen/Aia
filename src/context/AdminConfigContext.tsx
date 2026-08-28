import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WindowId, APISwitcherSource } from '../types';

interface AdminConfigContextType {
  hiddenPrompts: Record<WindowId, string>;
  setHiddenPrompt: (winId: WindowId, text: string) => void;
  apiSource: APISwitcherSource;
  setApiSource: (source: APISwitcherSource) => void;
  blacklistWords: string[];
  setBlacklistWords: (words: string[]) => void;
  addBlacklistWord: (word: string) => void;
  removeBlacklistWord: (word: string) => void;
  validatePrompt: (prompt: string) => { isValid: boolean; blockedWord?: string };
  applyHiddenPrompt: (prompt: string, windowId: WindowId) => string;
}

const DEFAULT_HIDDEN_PROMPTS: Record<WindowId, string> = {
  1: '8k, ultra-photorealistic, masterpiece, high dynamic range, Hasselblad 85mm f/1.4, clean volumetric lighting',
  2: 'Unreal Engine 5 render, Octane 3D, ultra detailed, vibrant lighting, intricate textures, masterpiece',
  3: 'cinematic 4k motion, 60fps, smooth camera tracking, dramatic lighting, movie grading, high bitrate',
  4: 'clean vector graphics, minimalist aesthetic, isolated on solid background, scalable high resolution, sharp edges',
  5: 'commercial studio lighting, advertising photography, high-end product showcase, 8k resolution, crisp mockup',
  6: 'high precision optical vision analysis, detailed style extraction, visual reverse-engineering parameters'
};

const DEFAULT_BLACKLIST = [
  'nsfw',
  'nude',
  'explicit',
  'gore',
  'violence',
  'blood',
  'hate',
  'illegal',
  'weapon',
  'terror'
];

const ADMIN_STORAGE_KEY = 'ai_hub_admin_config_v2';

const AdminConfigContext = createContext<AdminConfigContextType | undefined>(undefined);

export const AdminConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hiddenPrompts, setHiddenPromptsState] = useState<Record<WindowId, string>>(() => {
    try {
      const saved = localStorage.getItem(`${ADMIN_STORAGE_KEY}_hidden`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_HIDDEN_PROMPTS;
  });

  const [apiSource, setApiSourceState] = useState<APISwitcherSource>(() => {
    try {
      const saved = localStorage.getItem(`${ADMIN_STORAGE_KEY}_api`);
      if (saved && (saved === 'lexica' || saved === 'civitai' || saved === 'gemini')) {
        return saved as APISwitcherSource;
      }
    } catch (e) {
      console.error(e);
    }
    return 'lexica';
  });

  const [blacklistWords, setBlacklistWordsState] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${ADMIN_STORAGE_KEY}_blacklist`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_BLACKLIST;
  });

  const setHiddenPrompt = (winId: WindowId, text: string) => {
    setHiddenPromptsState((prev) => {
      const next = { ...prev, [winId]: text };
      localStorage.setItem(`${ADMIN_STORAGE_KEY}_hidden`, JSON.stringify(next));
      return next;
    });
  };

  const setApiSource = (source: APISwitcherSource) => {
    setApiSourceState(source);
    localStorage.setItem(`${ADMIN_STORAGE_KEY}_api`, source);
  };

  const setBlacklistWords = (words: string[]) => {
    setBlacklistWordsState(words);
    localStorage.setItem(`${ADMIN_STORAGE_KEY}_blacklist`, JSON.stringify(words));
  };

  const addBlacklistWord = (word: string) => {
    const trimmed = word.trim().toLowerCase();
    if (!trimmed || blacklistWords.includes(trimmed)) return;
    const updated = [...blacklistWords, trimmed];
    setBlacklistWords(updated);
  };

  const removeBlacklistWord = (word: string) => {
    const updated = blacklistWords.filter((w) => w.toLowerCase() !== word.toLowerCase());
    setBlacklistWords(updated);
  };

  // Security Filter Check: checks whether prompt contains any blacklisted word
  const validatePrompt = (prompt: string): { isValid: boolean; blockedWord?: string } => {
    if (!prompt) return { isValid: true };
    const lower = prompt.toLowerCase();
    for (const word of blacklistWords) {
      const cleanWord = word.trim().toLowerCase();
      if (!cleanWord) continue;
      // Check as substring or word boundary
      const regex = new RegExp(`\\b${cleanWord}\\b`, 'i');
      if (regex.test(lower) || lower.includes(cleanWord)) {
        return { isValid: false, blockedWord: word };
      }
    }
    return { isValid: true };
  };

  // Merge compulsory hidden prompt injection with user prompt before generation/export
  const applyHiddenPrompt = (userPrompt: string, windowId: WindowId): string => {
    const injection = hiddenPrompts[windowId]?.trim();
    if (!injection) return userPrompt;
    if (!userPrompt) return injection;

    // Avoid double injection if already included
    if (userPrompt.toLowerCase().includes(injection.toLowerCase())) {
      return userPrompt;
    }

    return `${userPrompt}, ${injection}`;
  };

  return (
    <AdminConfigContext.Provider
      value={{
        hiddenPrompts,
        setHiddenPrompt,
        apiSource,
        setApiSource,
        blacklistWords,
        setBlacklistWords,
        addBlacklistWord,
        removeBlacklistWord,
        validatePrompt,
        applyHiddenPrompt
      }}
    >
      {children}
    </AdminConfigContext.Provider>
  );
};

export const useAdminConfig = () => {
  const context = useContext(AdminConfigContext);
  if (!context) {
    throw new Error('useAdminConfig must be used within an AdminConfigProvider');
  }
  return context;
};
