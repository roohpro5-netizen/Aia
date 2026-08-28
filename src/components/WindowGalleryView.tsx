import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  Play,
  Maximize2,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Youtube,
  ScanEye,
  Smartphone,
  Eye,
  Hash,
  Link as LinkIcon,
  Share2
} from 'lucide-react';
import { MediaItem, WindowId, AdBanner } from '../types';
import { WINDOWS_INFO } from '../data/defaultData';
import { AdDisplay } from './AdDisplay';
import { ImageVisionAnalyzer } from './ImageVisionAnalyzer';
import { Portal3DRibbon } from './Portal3DRibbon';
import { PortalNeonBadge } from './PortalNeonBadge';
import { storage } from '../services/storage';
import { getNumericCode, getItemFullUrl } from '../utils/idHelper';

interface WindowGalleryViewProps {
  windowId: WindowId;
  items: MediaItem[];
  ads: AdBanner[];
  onSelectItem: (item: MediaItem) => void;
  onSelectWindow: (winId: WindowId) => void;
  onBack: () => void;
}

export const WindowGalleryView: React.FC<WindowGalleryViewProps> = ({
  windowId,
  items,
  ads,
  onSelectItem,
  onSelectWindow,
  onBack
}) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const currentWindow = WINDOWS_INFO.find((w) => w.id === windowId) || WINDOWS_INFO[0];
  const windowItems = items.filter((item) => item.windowId === windowId);

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

  const handleCopyCode = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    const code = getNumericCode(item);
    navigator.clipboard.writeText(code);
    setCopiedCodeId(item.id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleCopyLink = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    const url = getItemFullUrl(item);
    navigator.clipboard.writeText(url);
    setCopiedLinkId(item.id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  /**
   * For DESKTOP 3-column grid, alternating pattern [Item, Ad, Item]
   */
  const renderDesktopGrid = () => {
    const devSettings = storage.getDevSettings();
    const isAdsActive = devSettings.adNetworks?.globalAdsEnabled !== false;

    // If global ads disabled, render pure clean item grid without ad slots
    if (!isAdsActive) {
      return (
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {windowItems.map((item, index) => renderItemCard(item, `desktop-clean-item-${item.id}-${index}`))}
        </div>
      );
    }

    const desktopSlots: Array<{ type: 'item'; item: MediaItem } | { type: 'ad'; adIndex: number }> = [];
    let itemIdx = 0;
    let rowIndex = 0;
    let adCounter = 0;

    while (itemIdx < windowItems.length) {
      const isAdRow = rowIndex % 2 === 0;

      if (isAdRow) {
        if (itemIdx < windowItems.length) {
          desktopSlots.push({ type: 'item', item: windowItems[itemIdx++] });
        }
        desktopSlots.push({ type: 'ad', adIndex: adCounter++ });
        if (itemIdx < windowItems.length) {
          desktopSlots.push({ type: 'item', item: windowItems[itemIdx++] });
        }
      } else {
        for (let k = 0; k < 3; k++) {
          if (itemIdx < windowItems.length) {
            desktopSlots.push({ type: 'item', item: windowItems[itemIdx++] });
          }
        }
      }
      rowIndex++;
    }

    return (
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {desktopSlots.map((slot, index) => {
          if (slot.type === 'ad') {
            return (
              <div key={`desktop-ad-slot-${index}`} className="w-full aspect-square flex items-center justify-center">
                <AdDisplay size="350x350" slotIndex={slot.adIndex} className="w-full aspect-square" />
              </div>
            );
          }

          const item = slot.item;
          return renderItemCard(item, `desktop-item-${item.id}-${index}`);
        })}
      </div>
    );
  };

  /**
   * For MOBILE view:
   * Every single item is a full-width square window, directly followed by a full-width square ad (if enabled)!
   */
  const renderMobileFlow = () => {
    const devSettings = storage.getDevSettings();
    const isAdsActive = devSettings.adNetworks?.globalAdsEnabled !== false;

    return (
      <div className="sm:hidden flex flex-col space-y-6 w-full">
        {windowItems.map((item, index) => (
          <React.Fragment key={`mobile-group-${item.id}-${index}`}>
            {/* Full-width Square Item Window Card */}
            {renderItemCard(item, `mobile-item-${item.id}`)}
            
            {/* Full-width Square Ad (only if ads enabled globally) */}
            {isAdsActive && (
              <div className="w-full aspect-square">
                <AdDisplay size="page_width" slotIndex={index} className="w-full aspect-square shadow-sm" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderItemCard = (item: MediaItem, key: string) => {
    const isVideo = item.type === 'youtube_video' || item.type === 'shorts_video';
    const isCodeCopied = copiedCodeId === item.id;
    const isLinkCopied = copiedLinkId === item.id;

    return (
      <div
        key={key}
        id={`card-${item.id}`}
        onClick={() => onSelectItem(item)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 aspect-square w-full flex flex-col justify-between"
      >
        {/* Card Top Bar: Title & Action Icons (📋, 🔗) */}
        <div className="flex items-center justify-between z-10 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5 min-w-0 pr-1">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0 inline-block shadow-xs" />
            <h4 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              {item.title}
            </h4>
          </div>

          <div className="flex items-center gap-1 shrink-0 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200">
            {/* Copy Code Icon (📋) */}
            <button
              type="button"
              onClick={(e) => handleCopyCode(e, item)}
              title={isCodeCopied ? 'تم نسخ الرقم' : 'نسخ رقم النافذة'}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-all active:scale-90 ${
                isCodeCopied ? 'bg-yellow-400 text-black font-bold' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isCodeCopied ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
            </button>

            {/* Copy Link Icon (🔗) */}
            <button
              type="button"
              onClick={(e) => handleCopyLink(e, item)}
              title={isLinkCopied ? 'تم نسخ الرابط' : 'نسخ رابط الصفحة'}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-all active:scale-90 ${
                isLinkCopied ? 'bg-emerald-500 text-white font-bold' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isLinkCopied ? <Check className="w-3 h-3 stroke-[3]" /> : <LinkIcon className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Center Thumbnail Media (Takes full center space inside the square window) */}
        <div className="relative my-2 flex-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 group-hover:border-slate-300 transition-colors shadow-inner">
          <img
            src={item.url}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Video Play Indicator */}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition-transform duration-200 group-hover:scale-110 border-2 border-yellow-400">
                <Play className="h-4 w-4 fill-white ml-0.5" />
              </div>
            </div>
          )}

          {/* Model Tag */}
          <div className="absolute top-2 left-2 rounded-md bg-black/75 backdrop-blur-xs px-2 py-0.5 text-[9px] font-black text-white shadow-xs">
            {item.model}
          </div>

          {/* Views Indicator */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-bold text-yellow-300 backdrop-blur-xs shadow-xs">
            <Eye className="w-3 h-3 text-yellow-400" />
            <span>{item.views || 100} مشاهدة</span>
          </div>
        </div>

        {/* Card Footer Bar: 3D Start Button + Window Info */}
        <div className="flex items-center justify-between z-10 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-700">
              دخول البرومبت:
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectItem(item);
            }}
            className={get3DButtonClass(windowId)}
          >
            بدء
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Window Navigation Bar (Light with Tri-Color stripe) */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="absolute top-0 left-0 right-0 tricolor-bar">
          <span />
          <span />
          <span />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors shadow-2xs"
              title="الرجوع للنوافذ الرئيسية"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <PortalNeonBadge
                  windowId={currentWindow.id}
                  isActive={true}
                  size="md"
                />
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {currentWindow.arabicName}
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {currentWindow.fullDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic 3D Portal Navigation Ribbon with Real Portal Names & Interactive Motion */}
      <Portal3DRibbon
        activeWindowId={windowId}
        onSelectWindow={onSelectWindow}
      />

      {/* SPECIAL FEATURE FOR WINDOW 6 & 3: AI Reverse Vision & Prompt Analyzer */}
      {(windowId === 6 || windowId === 3) && (
        <div className="mb-6">
          <ImageVisionAnalyzer />
        </div>
      )}

      {/* Items Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            العناصر والبرومبتات المتوفرة ({windowItems.length} عنصر مربع)
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          انقر لنسخ البرومبت أو فتح الصفحة للتعديل اللحظي
        </span>
      </div>

      {/* DESKTOP VIEW: 3-column alternating [Item, Ad, Item] layout */}
      {renderDesktopGrid()}

      {/* MOBILE VIEW: Item followed by Page-width Integrated Ad */}
      {renderMobileFlow()}
    </div>
  );
};
