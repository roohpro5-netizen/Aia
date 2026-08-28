import React, { useState } from 'react';
import { Search, ArrowLeft, X, HelpCircle, Sparkles, Wand2, Lightbulb, Check, User, Flame } from 'lucide-react';
import { MediaItem, WindowId } from '../types';
import { getNumericCode } from '../utils/idHelper';
import { useAuth } from '../context/AuthContext';
import { UserProfileModal } from './auth/UserProfileModal';

interface SmartSearchBarProps {
  items: MediaItem[];
  onSelectItem: (item: MediaItem) => void;
  onSelectWindow: (winId: WindowId) => void;
}

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  items,
  onSelectItem,
  onSelectWindow
}) => {
  const { user, isAuthenticated, guestAttemptsRemaining } = useAuth();
  const [query, setQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    const raw = query.trim();
    if (!raw) return;

    // 1. Check if query is a Window Link or Window number (e.g., "1", "2", "3", "4", "5", "6", "window/2", "#/window/2")
    const windowMatch = raw.match(/(?:#\/?window\/|^window\s*|^بوابة\s*|^نافذة\s*)?([1-6])$/i);
    if (windowMatch) {
      const winId = parseInt(windowMatch[1], 10) as WindowId;
      onSelectWindow(winId);
      setQuery('');
      return;
    }

    // 2. Check if query is an Item Link, hash, or numeric code (e.g., "101", "w1-item-2", "http://...#/item/101")
    let searchCode = raw;
    if (raw.includes('#/item/')) {
      searchCode = raw.split('#/item/')[1].split('?')[0].split('&')[0];
    } else if (raw.includes('#item-')) {
      searchCode = raw.split('#item-')[1].split('?')[0].split('&')[0];
    } else if (raw.includes('#/window/')) {
      const winId = parseInt(raw.split('#/window/')[1], 10) as WindowId;
      if ([1, 2, 3, 4, 5, 6].includes(winId)) {
        onSelectWindow(winId);
        setQuery('');
        return;
      }
    }

    // Look up item
    const clean = searchCode.trim().toLowerCase();
    const foundItem = items.find((item) => {
      const code = getNumericCode(item).toLowerCase();
      if (code === clean) return true;
      if (item.id.toLowerCase() === clean) return true;
      if (item.title.toLowerCase().includes(clean)) return true;
      return false;
    });

    if (foundItem) {
      onSelectItem(foundItem);
      setQuery('');
      setErrorMsg('');
    } else {
      setErrorMsg(`لم يتم العثور على نافذة أو صفحة مطابقة لـ "${raw}". يمكنك البحث برقم النافذة أو لصق الرابط المباشر.`);
    }
  };

  // Real-time suggestions when user types
  const trimmed = query.trim().toLowerCase();
  const suggestions = trimmed.length > 0
    ? items.filter((it) => {
        const code = getNumericCode(it).toLowerCase();
        return code.includes(trimmed) || it.title.toLowerCase().includes(trimmed) || it.id.toLowerCase().includes(trimmed);
      }).slice(0, 4)
    : [];

  return (
    <div className="w-full relative z-20">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Main Search Input Form */}
        <form onSubmit={handleSearch} className="relative flex-1">
          <div
            className={`flex items-center gap-2 rounded-2xl bg-white border-2 transition-all duration-300 p-1.5 sm:p-2 ${
              isFocused
                ? 'border-yellow-400 ring-4 ring-yellow-400/35 shadow-[0_0_24px_rgba(250,204,21,0.65)]'
                : 'border-yellow-400 sm:border-[2.5px] shadow-[0_0_15px_rgba(250,204,21,0.35)] hover:shadow-[0_0_20px_rgba(250,204,21,0.5)]'
            }`}
          >
            {/* Search Icon */}
            <div className="flex items-center gap-1.5 pr-2 pl-1 text-slate-400">
              <Search className="h-5 w-5 text-amber-500 animate-pulse" />
            </div>

            {/* Text Input for code, keyword, or Full URL */}
            <input
              id="smart-search-input"
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 250)}
              placeholder="الصق رقم النافذة المنسوخ أو رابط الصفحة هنا للانتقال المباشر..."
              className="flex-1 bg-transparent text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              dir="rtl"
            />

            {/* Clear button if input is filled */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setErrorMsg('');
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Unified Integrated 3D Neon Button: 'انتقل' with nested Neon Red '؟' Circle */}
            <div className="relative flex items-center rounded-xl bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 border border-yellow-200 border-b-[3px] border-b-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.45),0_0_12px_rgba(250,204,21,0.4)] pl-1 pr-3 sm:pr-3.5 py-1 gap-2 shrink-0 transition-all duration-150 hover:brightness-105 active:translate-y-[2px] active:border-b-amber-500 active:shadow-xs">
              {/* Submit Action (انتقل) */}
              <button
                type="submit"
                id="smart-search-submit-btn"
                className="text-slate-950 font-black text-xs sm:text-sm cursor-pointer select-none active:scale-95 transition-transform drop-shadow-xs tracking-tight"
              >
                انتقل
              </button>

              {/* Interlocked Dynamic 3D Neon Red Circular '؟' Button */}
              <button
                type="button"
                id="search-help-circle-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsHelpModalOpen(true);
                }}
                title="دليل البحث والاستدعاء البرمجي"
                className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-rose-500 text-white font-black text-xs sm:text-sm shadow-[0_0_10px_rgba(239,68,68,0.7)] border-2 border-white/80 hover:scale-110 hover:shadow-[0_0_15px_rgba(239,68,68,0.9)] active:scale-90 transition-all duration-200 cursor-pointer overflow-hidden select-none animate-pulse hover:animate-none"
              >
                <span className="relative z-10 leading-none font-black text-white drop-shadow-xs">؟</span>
                <span className="absolute inset-0 bg-white/30 opacity-0 hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </form>

        {/* Circular Avatar Next to Search Bar for User Management & Quota */}
        <button
          type="button"
          id="search-avatar-profile-btn"
          onClick={() => setIsProfileModalOpen(true)}
          title="إدارة الحساب ومحفظة المحاولات (مجاني 100%)"
          className="relative group flex items-center justify-center rounded-2xl p-1 bg-white border-2 border-yellow-400 shadow-[0_4px_12px_rgba(250,204,21,0.35)] hover:shadow-[0_0_20px_rgba(250,204,21,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 cursor-pointer"
        >
          <div className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-xl overflow-hidden bg-slate-900 border border-amber-300">
            <img
              src={
                user?.photoURL ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
              }
              alt={user?.displayName || 'المستخدم'}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Remaining Daily Attempts Counter Pill */}
          <span className="absolute -bottom-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] shadow-md border border-white">
            {isAuthenticated ? '5' : guestAttemptsRemaining}
          </span>
        </button>
      </div>

      {/* Profile & Account Management Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Interactive 3D Dynamic Popup Modal Window for the '?' Button */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-yellow-400 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.35),0_0_30px_rgba(250,204,21,0.4)] animate-in zoom-in-95 duration-200"
            dir="rtl"
          >
            {/* Tri-color Top Accent Bar */}
            <div className="tricolor-bar">
              <span />
              <span />
              <span />
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors z-10 shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 sm:p-7 text-right">
              {/* Header Icon badge with 3D neon effects */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-red-500 text-white shadow-[0_4px_14px_rgba(245,158,11,0.5)] border-2 border-yellow-200 shrink-0 animate-pulse">
                  <Sparkles className="w-6 h-6 animate-spin-slow" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-100 text-amber-900 border border-yellow-300 text-[11px] font-black mb-0.5 shadow-2xs">
                    <Lightbulb className="w-3 h-3 text-amber-600" />
                    <span>المساعد الذكي للمطابقة</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    الاستدعاء والبحث الذكي
                  </h3>
                </div>
              </div>

              {/* Core Requested Phrase with 3D Embossed Neon Card */}
              <div className="rounded-2xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50/90 via-amber-50/50 to-red-50/40 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03),0_4px_12px_rgba(250,204,21,0.15)] mb-5">
                <p className="text-sm sm:text-base font-black text-slate-900 leading-relaxed">
                  " ابحث عن فكرتك أو قم باستدعائها برمجياً ليتم إنشاؤها لك "
                </p>
                <p className="mt-2 text-xs font-medium text-slate-700 leading-normal">
                  يمكنك كتابة رقم أي نافذة (مثلاً 101 أو 203)، أو رقم البوابة (1 إلى 4)، أو لصق الرابط المنسوخ مباشرة للانتقال الفوري إلى البرومبت والتعديل عليه.
                </p>
              </div>

              {/* Fast Features in 3D-styled rows */}
              <div className="space-y-2 mb-6 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white font-black shrink-0 text-[10px] shadow-xs">
                    1
                  </div>
                  <span>البحث بالأرقام أو الكود البرمجي المباشر</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white font-black shrink-0 text-[10px] shadow-xs">
                    2
                  </div>
                  <span>الاستدعاء الفوري للنوافذ والأفكار وتوليد الأكواد</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white font-black shrink-0 text-[10px] shadow-xs">
                    3
                  </div>
                  <span>نسخ وتعديل البرومبت بلحظات وبأعلى دقة</span>
                </div>
              </div>

              {/* Dismiss 3D Button */}
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-yellow-300 font-black text-xs sm:text-sm transition-all shadow-md border-b-[3px] border-b-slate-950 active:translate-y-0.5"
              >
                فهمت ذلك، ابدأ الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error message notification if not found */}
      {errorMsg && (
        <div className="mt-2.5 p-3 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="text-red-500 hover:text-red-800 text-xs underline"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Dropdown Live Suggestions list */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl border-2 border-blue-300 shadow-xl overflow-hidden z-50 animate-in fade-in duration-150">
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>النتائج المطابقة ({suggestions.length})</span>
            <span className="text-[11px] text-blue-600">انقر للفتح المباشر</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {suggestions.map((item) => (
              <div
                key={`suggestion-${item.id}`}
                onMouseDown={() => onSelectItem(item)}
                className="p-3 hover:bg-blue-50/70 cursor-pointer flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="h-11 w-11 rounded-lg object-cover border border-slate-200 shrink-0 aspect-square"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        بوابة {item.windowId}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate mt-1">
                      {item.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-blue-600 text-xs font-bold shrink-0">
                  <span>فتح</span>
                  <ArrowLeft className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
