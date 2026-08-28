import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WindowId, MediaItem, AdBanner } from './types';
import { storage } from './services/storage';
import { apiService, isLiveMode } from './services/apiService';
import { adManager } from './services/adManager';
import { Navbar } from './components/Navbar';
import { WindowHomeGrid } from './components/WindowHomeGrid';
import { WindowGalleryView } from './components/WindowGalleryView';
import { ItemDetailPage } from './components/ItemDetailPage';
import { DevControlPanel } from './components/DevControlPanel';
import { SmartSearchBar } from './components/SmartSearchBar';
import { InterstitialAdModal } from './components/InterstitialAdModal';
import { getNumericCode } from './utils/idHelper';
import { Sparkles, Layers, ShieldCheck, Code, Eye, ExternalLink, Shield, Bug, Info, FileText } from 'lucide-react';
import { AuthModal } from './components/auth/AuthModal';
import { PrivacyPolicyModal } from './components/modals/PrivacyPolicyModal';
import { ReportIssueModal } from './components/modals/ReportIssueModal';
import { TermsOfServiceModal } from './components/modals/TermsOfServiceModal';
import { AboutPlatformModal } from './components/modals/AboutPlatformModal';

export default function App() {
  const [items, setItems] = useState<MediaItem[]>(() => storage.getItems());
  const [ads, setAds] = useState<AdBanner[]>(() => storage.getAds());
  const [currentView, setCurrentView] = useState<'home' | 'window' | 'item'>('home');
  const [activeWindowId, setActiveWindowId] = useState<WindowId>(1);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [devPanelOpen, setDevPanelOpen] = useState(false);

  // App Open Ad & Page Navigation Interstitial Ad State
  const [interstitialAd, setInterstitialAd] = useState<{
    isOpen: boolean;
    type: 'app_open' | 'navigation';
    network: 'monetag' | 'adsterra';
    destinationTitle?: string;
    pendingAction?: () => void;
  }>({
    isOpen: false,
    type: 'app_open',
    network: 'monetag'
  });

  // 4 Dedicated Colored Footer Modals State
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  // App Open Ad Trigger on App Launch (with 60-second cooldown check)
  useEffect(() => {
    const devSettings = storage.getDevSettings();
    const appOpenTimer = setTimeout(() => {
      const check = adManager.shouldShowAppOpenAd(devSettings.adNetworks);
      if (check.shouldShow) {
        setInterstitialAd({
          isOpen: true,
          type: 'app_open',
          network: check.activeNetwork,
          pendingAction: undefined
        });
      }
    }, 700);

    return () => clearTimeout(appOpenTimer);
  }, []);

  // Automatically request notification permissions on application launch (OneSignal / Browser Web Push)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && typeof Notification.requestPermission === 'function') {
        if (Notification.permission === 'default') {
          const timer = setTimeout(() => {
            try {
              const res = Notification.requestPermission();
              if (res && typeof res.then === 'function') {
                res
                  .then((permission) => {
                    if (permission === 'granted') {
                      try {
                        localStorage.setItem('user_subscribed_notifications', 'true');
                      } catch (_) {}
                    }
                  })
                  .catch((err) => {
                    console.warn('Notification permission request error', err);
                  });
              }
            } catch (e) {
              console.warn('Notification permission error', e);
            }

            if ((window as any).OneSignal) {
              try {
                (window as any).OneSignal.push(() => {
                  (window as any).OneSignal.showSlidedownPrompt?.();
                });
              } catch (e) {
                console.warn('OneSignal slidedown prompt error', e);
              }
            }
          }, 600);

          return () => clearTimeout(timer);
        }
      }
    } catch (e) {
      console.warn('Notification initialization check skipped:', e);
    }
  }, []);

  // Sync with URL Hash for dedicated links to every page and item (with 3-4 digit codes or item IDs)
  useEffect(() => {
    // Initial live data hydration in live / production mode
    if (isLiveMode()) {
      apiService.fetchAllItems().then((liveItems) => {
        if (Array.isArray(liveItems) && liveItems.length > 0) {
          setItems(liveItems);
        }
      }).catch((e) => console.warn('Initial live items fetch notice:', e));

      apiService.fetchAds().then((liveAds) => {
        if (Array.isArray(liveAds) && liveAds.length > 0) {
          setAds(liveAds);
        }
      }).catch((e) => console.warn('Initial live ads fetch notice:', e));
    }

    const handleHashChange = async () => {
      const hash = window.location.hash;
      if (!hash || hash === '#' || hash === '#/') {
        setCurrentView('home');
        setSelectedItem(null);
      } else if (hash === '#/admin' || hash === '#admin') {
        setDevPanelOpen(true);
      } else if (hash === '#/privacy' || hash === '#privacy') {
        setPrivacyModalOpen(true);
      } else if (hash === '#/report' || hash === '#report') {
        setReportModalOpen(true);
      } else if (hash === '#/terms' || hash === '#terms') {
        setTermsModalOpen(true);
      } else if (hash === '#/about' || hash === '#about') {
        setAboutModalOpen(true);
      } else if (hash.startsWith('#/window/')) {
        const winNum = parseInt(hash.replace('#/window/', ''), 10) as WindowId;
        if ([1, 2, 3, 4, 5, 6].includes(winNum)) {
          setActiveWindowId(winNum);
          setCurrentView('window');
          setSelectedItem(null);
        }
      } else if (hash.startsWith('#/item/') || hash.startsWith('#item-')) {
        const itemIdOrCode = hash.replace('#/item/', '').replace('#item-', '');
        let found = storage.getItemById(itemIdOrCode);
        if (!found && isLiveMode()) {
          found = await apiService.fetchItemByCode(itemIdOrCode);
        }
        if (found) {
          setSelectedItem(found);
          setActiveWindowId(found.windowId);
          setCurrentView('item');
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const refreshData = () => {
    setItems(storage.getItems());
    setAds(storage.getAds());
    if (selectedItem) {
      const updated = storage.getItemById(selectedItem.id);
      if (updated) setSelectedItem(updated);
    }
  };

  const navigateWithAdCheck = (action: () => void, destinationTitle: string) => {
    const devSettings = storage.getDevSettings();
    const check = adManager.shouldShowNavigationAd(devSettings.adNetworks);

    if (check.shouldShow) {
      setInterstitialAd({
        isOpen: true,
        type: 'navigation',
        network: check.activeNetwork,
        destinationTitle,
        pendingAction: action
      });
    } else {
      action();
    }
  };

  const handleSelectWindow = (winId: WindowId) => {
    navigateWithAdCheck(() => {
      setActiveWindowId(winId);
      setCurrentView('window');
      setSelectedItem(null);
      window.history.replaceState(null, '', `#/window/${winId}`);
    }, `بوابة رقم ${winId}`);
  };

  const handleSelectItem = (item: MediaItem) => {
    navigateWithAdCheck(() => {
      setSelectedItem(item);
      setActiveWindowId(item.windowId);
      setCurrentView('item');
      const code = getNumericCode(item);
      window.history.replaceState(null, '', `#/item/${code}`);
    }, item.title);
  };

  const handleGoHome = () => {
    navigateWithAdCheck(() => {
      setCurrentView('home');
      setSelectedItem(null);
      window.history.replaceState(null, '', '#/');
    }, 'الصفحة الرئيسية');
  };

  const handleBackToWindow = () => {
    navigateWithAdCheck(() => {
      setCurrentView('window');
      setSelectedItem(null);
      window.history.replaceState(null, '', `#/window/${activeWindowId}`);
    }, `بوابة رقم ${activeWindowId}`);
  };

  const handleProceedInterstitialAd = () => {
    if (interstitialAd.pendingAction) {
      interstitialAd.pendingAction();
    }
    setInterstitialAd((prev) => ({ ...prev, isOpen: false, pendingAction: undefined }));
  };

  const handleCloseInterstitialAd = () => {
    if (interstitialAd.pendingAction) {
      interstitialAd.pendingAction();
    }
    setInterstitialAd((prev) => ({ ...prev, isOpen: false, pendingAction: undefined }));
  };

  const pageTransitionVariants = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col selection:bg-yellow-300 selection:text-black">
      {/* Header with 5-Click Secret Logo Trigger */}
      <Navbar
        currentView={currentView}
        activeWindowId={activeWindowId}
        onGoHome={handleGoHome}
        onSelectWindow={handleSelectWindow}
        onOpenDevPanel={() => setDevPanelOpen(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 py-4 sm:py-8">
        <AnimatePresence mode="wait">
          {/* VIEW 1: 4-Window Home Launcher Grid */}
          {currentView === 'home' && (
            <motion.div
              key="view-home"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-6"
            >
              {/* Top Smart Search Box & Router Bar */}
              <div className="w-full">
                <SmartSearchBar
                  items={items}
                  onSelectItem={handleSelectItem}
                  onSelectWindow={handleSelectWindow}
                />
              </div>

              {/* 4 Windows Grid */}
              <div>
                <WindowHomeGrid
                  onSelectWindow={handleSelectWindow}
                  items={items}
                />
              </div>
            </motion.div>
          )}

          {/* VIEW 2: Single Window Gallery Page with Ad Grid */}
          {currentView === 'window' && (
            <motion.div
              key={`view-window-${activeWindowId}`}
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-6"
            >
              <SmartSearchBar
                items={items}
                onSelectItem={handleSelectItem}
                onSelectWindow={handleSelectWindow}
              />
              <WindowGalleryView
                windowId={activeWindowId}
                items={items}
                ads={ads}
                onSelectItem={handleSelectItem}
                onSelectWindow={handleSelectWindow}
                onBack={handleGoHome}
              />
            </motion.div>
          )}

          {/* VIEW 3: Dedicated Item Detail Page with 350x350 Ads and Copyable Prompt */}
          {currentView === 'item' && selectedItem && (
            <motion.div
              key={`view-item-${selectedItem.id}`}
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <ItemDetailPage
                item={selectedItem}
                ads={ads}
                onBack={handleBackToWindow}
                onSelectWindow={handleSelectWindow}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer with Dynamic Colored Action Badges and Reserved Bottom Banner Clearance */}
      <footer className="mt-auto border-t border-slate-200 bg-white pt-6 pb-20 sm:pb-24 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-black text-slate-900 text-sm tracking-wide">
              منصة Rooh Pro Ai
            </span>
          </div>

          {/* 4 Dynamically Colored Framed Action Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {/* 1. Privacy Policy Button (Blue Framed Badge) */}
            <button
              type="button"
              id="footer-privacy-btn"
              onClick={() => setPrivacyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-500/40 bg-blue-50/80 hover:bg-blue-100/90 text-blue-700 font-bold transition-all shadow-xs hover:shadow-blue-500/20 hover:border-blue-500 active:scale-95 cursor-pointer"
              title="عرض سياسة الخصوصية وأمان البيانات"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>سياسة الخصوصية</span>
            </button>

            {/* 2. Report Bug / Issue Button (Red Framed Badge) */}
            <button
              type="button"
              id="footer-report-btn"
              onClick={() => setReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/40 bg-red-50/80 hover:bg-red-100/90 text-red-700 font-bold transition-all shadow-xs hover:shadow-red-500/20 hover:border-red-500 active:scale-95 cursor-pointer"
              title="الإبلاغ عن مشكلة أو خطأ برمجي"
            >
              <Bug className="w-3.5 h-3.5 text-red-600" />
              <span>الإبلاغ عن مشكلة</span>
            </button>

            {/* 3. Terms of Service Button (Yellow/Amber Framed Badge) */}
            <button
              type="button"
              id="footer-terms-btn"
              onClick={() => setTermsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-50/80 hover:bg-amber-100/90 text-amber-800 font-bold transition-all shadow-xs hover:shadow-amber-500/20 hover:border-amber-500 active:scale-95 cursor-pointer"
              title="شروط الاستخدام والترخيص"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>شروط الاستخدام</span>
            </button>

            {/* 4. About Platform Button (Emerald/Green Framed Badge) */}
            <button
              type="button"
              id="footer-about-btn"
              onClick={() => setAboutModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-800 font-bold transition-all shadow-xs hover:shadow-emerald-500/20 hover:border-emerald-500 active:scale-95 cursor-pointer"
              title="عن منصة Rooh والبوابات الست"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>عن المنصة</span>
            </button>
          </div>
        </div>

        {/* Reserved Bottom Banner Clearance Area (Min 50px guaranteed clearance for ad networks) */}
        <div
          id="bottom-ad-banner-slot"
          className="mx-auto mt-4 max-w-4xl min-h-[50px] flex items-center justify-center text-center px-4"
          aria-hidden="true"
        >
          {/* Reserved slot for dynamically injected bottom banner ads without overlapping footer UI */}
        </div>
      </footer>

      {/* 4 Distinct Independent Colored Modals */}
      <PrivacyPolicyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />

      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      <TermsOfServiceModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
      />

      <AboutPlatformModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />

      {/* Hidden Developer Control Panel (Opened via 5 Clicks on Logo or #/admin) */}
      <DevControlPanel
        isOpen={devPanelOpen}
        onClose={() => setDevPanelOpen(false)}
        onDataChanged={refreshData}
      />

      {/* Global Authentication Modal (Triggered on Guest limit exhaustion or Account Menu) */}
      <AuthModal />

      {/* App Open Ad & Page Navigation Interstitial Ad Modal (Min 60s cooldown & smart Monetag/Adsterra rotation) */}
      <InterstitialAdModal
        isOpen={interstitialAd.isOpen}
        type={interstitialAd.type}
        network={interstitialAd.network}
        destinationTitle={interstitialAd.destinationTitle}
        adSettings={storage.getDevSettings().adNetworks}
        onProceed={handleProceedInterstitialAd}
        onClose={handleCloseInterstitialAd}
      />
    </div>
  );
}
