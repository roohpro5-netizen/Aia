import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  LogOut,
  Sparkles,
  Shield,
  Key,
  ChevronDown,
  CheckCircle2,
  Flame,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UserAccountMenu: React.FC = () => {
  const { user, isAuthenticated, guestAttemptsRemaining, openAuthModal, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => openAuthModal('تسجيل الدخول يتيح لك حفظ برومبتاتك وتجاوز حدود الضيف')}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 transition-all shadow-sm active:scale-95"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
            <User className="w-3 h-3" />
          </div>
          <span className="hidden sm:inline">تسجيل الدخول</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
              guestAttemptsRemaining > 1
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
            }`}
          >
            {guestAttemptsRemaining}/5 ضيف
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef} dir="rtl">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 p-1.5 sm:px-3 sm:py-1.5 text-xs text-slate-200 transition-all shadow-sm"
      >
        <img
          src={user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
          alt={user?.displayName || 'User'}
          referrerPolicy="no-referrer"
          className="h-6 w-6 rounded-lg object-cover border border-blue-500/40"
        />
        <div className="hidden sm:flex flex-col text-right">
          <span className="font-bold text-xs text-white max-w-[100px] truncate leading-none">
            {user?.displayName || 'المستخدم'}
          </span>
          <span className="text-[9px] text-emerald-400 font-mono mt-0.5">عضو معتمد</span>
        </div>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2 border-b border-slate-800/80 mb-1">
            <div className="font-bold text-xs text-white truncate">{user?.displayName}</div>
            <div className="text-[10px] text-slate-400 font-mono truncate">{user?.email}</div>
            <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-900 p-1.5 text-[10px]">
              <span className="text-slate-400">طريقة الدخول:</span>
              <span className="font-bold text-blue-400 font-mono uppercase">
                {user?.providerId === 'google' ? 'Google Account' : 'Email/Password'}
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-between px-3 py-2 text-xs rounded-xl bg-emerald-500/10 text-emerald-300 font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>حساب موثق</span>
              </span>
              <span className="text-[10px] font-mono">5 محاولات يومية</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-right"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
