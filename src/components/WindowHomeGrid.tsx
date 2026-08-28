import React from 'react';
import {
  Image as ImageIcon,
  Wand2,
  Video,
  Award,
  ShoppingBag,
  ScanEye,
  Layers,
  Sparkles
} from 'lucide-react';
import { WINDOWS_INFO } from '../data/defaultData';
import { WindowId, MediaItem } from '../types';
import { AdDisplay } from './AdDisplay';
import { PortalNeonBadge } from './PortalNeonBadge';
import { storage } from '../services/storage';

interface WindowHomeGridProps {
  onSelectWindow: (windowId: WindowId) => void;
  items: MediaItem[];
}

export const WindowHomeGrid: React.FC<WindowHomeGridProps> = ({
  onSelectWindow,
  items
}) => {
  const getWindowIndicator = (winId: WindowId) => {
    switch (winId) {
      case 1:
        return <span className="w-2.5 h-4 bg-blue-600 rounded-sm inline-block shrink-0 shadow-xs" />;
      case 2:
        return <span className="w-2.5 h-4 bg-purple-600 rounded-sm inline-block shrink-0 shadow-xs" />;
      case 3:
        return <span className="w-2.5 h-4 bg-red-600 rounded-sm inline-block shrink-0 shadow-xs" />;
      case 4:
        return <span className="w-2.5 h-4 bg-emerald-600 rounded-sm inline-block shrink-0 shadow-xs" />;
      case 5:
        return <span className="w-2.5 h-4 bg-orange-500 rounded-sm inline-block shrink-0 shadow-xs" />;
      case 6:
        return <span className="w-2.5 h-4 bg-slate-600 rounded-sm inline-block shrink-0 shadow-xs" />;
      default:
        return <span className="w-2.5 h-4 bg-blue-600 rounded-sm inline-block shrink-0 shadow-xs" />;
    }
  };

  const getNeonCardClass = (winId: WindowId) => {
    switch (winId) {
      case 1:
        return 'neon-card-1';
      case 2:
        return 'neon-card-2';
      case 3:
        return 'neon-card-3';
      case 4:
        return 'neon-card-4';
      case 5:
        return 'neon-card-2';
      case 6:
        return 'neon-card-3';
      default:
        return 'neon-card-1';
    }
  };

  const getWindowIcon = (winId: WindowId) => {
    switch (winId) {
      case 1:
        return <ImageIcon className="h-3.5 w-3.5 text-blue-600" />;
      case 2:
        return <Wand2 className="h-3.5 w-3.5 text-purple-600" />;
      case 3:
        return <Video className="h-3.5 w-3.5 text-red-600" />;
      case 4:
        return <Award className="h-3.5 w-3.5 text-emerald-600" />;
      case 5:
        return <ShoppingBag className="h-3.5 w-3.5 text-orange-600" />;
      case 6:
        return <ScanEye className="h-3.5 w-3.5 text-slate-700" />;
      default:
        return <Layers className="h-3.5 w-3.5 text-blue-600" />;
    }
  };

  const getBadgeStyle = (winId: WindowId) => {
    switch (winId) {
      case 1:
        return 'text-blue-700 bg-blue-50 border-blue-300';
      case 2:
        return 'text-purple-700 bg-purple-50 border-purple-300';
      case 3:
        return 'text-red-700 bg-red-50 border-red-300';
      case 4:
        return 'text-emerald-700 bg-emerald-50 border-emerald-300';
      case 5:
        return 'text-orange-700 bg-orange-50 border-orange-300';
      case 6:
        return 'text-slate-800 bg-slate-100 border-slate-300';
      default:
        return 'text-blue-700 bg-blue-50 border-blue-300';
    }
  };

  const get3DButtonClass = (winId: WindowId) => {
    switch (winId) {
      case 1:
        return 'btn-3d-start btn-3d-portal-1';
      case 2:
        return 'btn-3d-start btn-3d-portal-2';
      case 3:
        return 'btn-3d-start btn-3d-portal-3';
      case 4:
        return 'btn-3d-start btn-3d-portal-4';
      case 5:
        return 'btn-3d-start btn-3d-portal-2';
      case 6:
        return 'btn-3d-start btn-3d-portal-1';
      default:
        return 'btn-3d-start btn-3d-portal-1';
    }
  };

  const renderDesktopPortalCard = (winId: WindowId) => {
    const win = WINDOWS_INFO.find((w) => w.id === winId);
    if (!win) return null;

    const winItems = items.filter((it) => it.windowId === win.id);
    const topItem = winItems[0];

    return (
      <div
        key={`desktop-card-${win.id}`}
        id={`window-card-${win.id}`}
        onClick={() => onSelectWindow(win.id)}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 aspect-square w-full flex flex-col justify-between p-4.5 ${getNeonCardClass(
          win.id as WindowId
        )}`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 min-w-0">
            {getWindowIndicator(win.id as WindowId)}
            <span className="font-black text-xs sm:text-sm text-slate-900 truncate">
              {win.arabicName}
            </span>
          </div>
          <PortalNeonBadge
            windowId={win.id as WindowId}
            size="sm"
          />
        </div>

        {/* Center Square Thumbnail */}
        <div className="relative my-2 flex-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 group-hover:border-slate-300 transition-colors shadow-2xs">
          {topItem ? (
            <img
              src={topItem.url}
              alt={win.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
              <ImageIcon className="h-8 w-8" />
            </div>
          )}

          {/* Aspect tag (1:1 Square) */}
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
            {getWindowIcon(win.id as WindowId)}
            <span>{win.aspectRatioLabel || 'مربع 1:1'}</span>
          </div>
        </div>

        {/* Card Footer Bar */}
        <div className="flex items-center justify-between z-10 pt-1.5 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-700 text-xs">
            {winItems.length} عنصر
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectWindow(win.id);
            }}
            className={get3DButtonClass(win.id as WindowId)}
          >
            بدء
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* ========================================================= */}
      {/* 1. MOBILE VIEW (Full-width Square Windows + Neon Frame + Square Ad after each) */}
      {/* ========================================================= */}
      <div className="sm:hidden flex flex-col space-y-6 w-full">
        {WINDOWS_INFO.map((win, idx) => {
          const winItems = items.filter((it) => it.windowId === win.id);
          const topItem = winItems[0];

          return (
            <React.Fragment key={`mobile-group-${win.id}`}>
              {/* Window Card: 100% full width from right to left + Aspect Square + Dynamic Neon Frame */}
              <div
                id={`mobile-window-card-${win.id}`}
                onClick={() => onSelectWindow(win.id)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 aspect-square w-full flex flex-col justify-between p-4 ${getNeonCardClass(
                  win.id as WindowId
                )}`}
              >
                {/* Card Header Bar */}
                <div className="flex items-center justify-between z-10 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {getWindowIndicator(win.id as WindowId)}
                    <h3 className="font-black text-sm text-slate-900 truncate">
                      {win.arabicName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <PortalNeonBadge
                      windowId={win.id as WindowId}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Center Square Thumbnail (Taking full center area) */}
                <div className="relative my-2.5 flex-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 group-hover:border-slate-300 transition-colors shadow-inner">
                  {topItem ? (
                    <img
                      src={topItem.url}
                      alt={win.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}

                  {/* 1:1 Aspect indicator */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-md bg-black/85 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs shadow-md">
                    {getWindowIcon(win.id as WindowId)}
                    <span>{win.aspectRatioLabel || 'تنسيق مربع 1:1'}</span>
                  </div>
                </div>

                {/* Card Footer Bar */}
                <div className="flex items-center justify-between z-10 pt-2.5 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {winItems.length} عنصر متوفر
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 text-[11px] font-medium line-clamp-1 max-w-[130px]">
                      {win.shortDesc}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectWindow(win.id);
                    }}
                    className={get3DButtonClass(win.id as WindowId)}
                  >
                    بدء
                  </button>
                </div>
              </div>

              {/* Integrated Square Ad (Takes full mobile width from right to left) */}
              <div className="w-full">
                <AdDisplay
                  size="350x350"
                  slotIndex={idx}
                  className="w-full aspect-square shadow-sm"
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 2. DESKTOP / TABLET VIEW (Staggered 3x3 Grid: Portals & Integrated Ads) */}
      {/* ========================================================= */}
      <div className="hidden sm:block">
        {storage.getDevSettings().adNetworks?.globalAdsEnabled !== false ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {/* الصف الأول: بوابة رقم 1 - إعلان مدمج - بوابة رقم 2 */}
            {renderDesktopPortalCard(1)}
            <div key="desktop-home-ad-0" className="w-full aspect-square flex items-center justify-center">
              <AdDisplay size="350x350" slotIndex={0} className="w-full aspect-square" />
            </div>
            {renderDesktopPortalCard(2)}

            {/* الصف الثاني: بوابة رقم 3 - بوابة رقم 4 - إعلان مدمج */}
            {renderDesktopPortalCard(3)}
            {renderDesktopPortalCard(4)}
            <div key="desktop-home-ad-1" className="w-full aspect-square flex items-center justify-center">
              <AdDisplay size="350x350" slotIndex={1} className="w-full aspect-square" />
            </div>

            {/* الصف الثالث: إعلان مدمج - بوابة رقم 5 - بوابة رقم 6 */}
            <div key="desktop-home-ad-2" className="w-full aspect-square flex items-center justify-center">
              <AdDisplay size="350x350" slotIndex={2} className="w-full aspect-square" />
            </div>
            {renderDesktopPortalCard(5)}
            {renderDesktopPortalCard(6)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {WINDOWS_INFO.map((win) => renderDesktopPortalCard(win.id as WindowId))}
          </div>
        )}
      </div>
    </div>
  );
};

