import React from 'react';
import { WindowId } from '../types';

interface PortalNeonBadgeProps {
  windowId: WindowId;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const PortalNeonBadge: React.FC<PortalNeonBadgeProps> = ({
  windowId,
  isActive = false,
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  const getNeonClass = () => {
    if (isActive) return 'portal-neon-3d-active';
    switch (windowId) {
      case 1: return 'portal-neon-3d-1';
      case 2: return 'portal-neon-3d-2';
      case 3: return 'portal-neon-3d-3';
      case 4: return 'portal-neon-3d-4';
      case 5: return 'portal-neon-3d-5';
      case 6: return 'portal-neon-3d-6';
      default: return 'portal-neon-3d-1';
    }
  };

  const getNumberColor = () => {
    if (isActive) return 'text-amber-950';
    switch (windowId) {
      case 1: return 'text-blue-700';
      case 2: return 'text-purple-700';
      case 3: return 'text-red-700';
      case 4: return 'text-emerald-700';
      case 5: return 'text-amber-700';
      case 6: return 'text-cyan-800';
      default: return 'text-blue-700';
    }
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5'
  };

  const discSizes = {
    sm: 'w-4 h-4 text-[10px]',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm'
  };

  return (
    <div
      className={`portal-neon-3d-box ${getNeonClass()} ${sizeStyles[size]} select-none shrink-0 ${className}`}
      dir="rtl"
      title={`بوابة رقم ${windowId}`}
    >
      {isActive && (
        <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse shadow-xs shrink-0" />
      )}

      {showLabel && (
        <span className="font-black tracking-tight">
          {isActive ? 'البوابة الحالية' : 'بوابة'}
        </span>
      )}

      {/* 3D Neon Disc for the Number */}
      <span
        className={`portal-num-3d-disc ${discSizes[size]} ${getNumberColor()}`}
      >
        {windowId}
      </span>
    </div>
  );
};
