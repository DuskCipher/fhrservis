import { useState, useEffect } from 'react';
import { Download, X, Share2, PlusSquare, RefreshCw, WifiOff, CheckCircle2, Smartphone, ShieldCheck } from 'lucide-react';
import { updateServiceWorker } from '../lib/registerSW';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    // 1. Check if running in Standalone PWA mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);

    // 2. Check if user is on iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = userAgent.includes('safari') && !userAgent.includes('crios') && !userAgent.includes('fxios') && !userAgent.includes('chrome');
    setIsIOS(isIosDevice && isSafari && !isStandaloneMode);

    // 3. Listen for BeforeInstallPrompt event (Android / Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);

      // Check if user dismissed banner recently
      const dismissedTime = localStorage.getItem('fhrcar_pwa_dismissed');
      const now = Date.now();
      if (!dismissedTime || now - parseInt(dismissedTime, 10) > 3 * 24 * 60 * 60 * 1000) {
        // Show after 3 seconds of browsing
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. App Installed event
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowBanner(false);
      setShowIOSModal(false);
      console.log('[PWA] FHRCAR PWA successfully installed.');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // 5. Online/Offline network monitoring
    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineToast(true);
      const timer = setTimeout(() => setShowOnlineToast(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 6. Custom window event listener for manual install triggers from Navbar/Footer
    const handleTriggerInstall = () => {
      if (deferredPrompt) {
        handleInstallClick();
      } else if (isIosDevice) {
        setShowIOSModal(true);
      } else {
        setShowBanner(true);
      }
    };
    window.addEventListener('fhrcar-trigger-install', handleTriggerInstall);

    // 7. Listen for PWA service worker refresh event
    const handleSWUpdate = () => {
      setNeedRefresh(true);
    };
    window.addEventListener('pwa-need-refresh', handleSWUpdate);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('fhrcar-trigger-install', handleTriggerInstall);
      window.removeEventListener('pwa-need-refresh', handleSWUpdate);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        setShowBanner(false);
        setDeferredPrompt(null);
        setIsInstallable(false);
      } else {
        console.log('[PWA] User dismissed the install prompt');
        localStorage.setItem('fhrcar_pwa_dismissed', Date.now().toString());
        setShowBanner(false);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('fhrcar_pwa_dismissed', Date.now().toString());
  };

  const handleRefreshApp = () => {
    updateServiceWorker();
  };

  return (
    <>
      {/* 1. Offline Indicator Bar */}
      {isOffline && (
        <div
          id="pwa-offline-alert"
          className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white px-4 py-2 text-xs md:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg animate-fadeIn"
        >
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
          <span>Mode Offline Aktif — Anda tetap dapat mengakses aplikasi & nomor kontak darurat.</span>
        </div>
      )}

      {/* 2. Reconnected Toast */}
      {showOnlineToast && !isOffline && (
        <div
          id="pwa-online-alert"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 shadow-xl animate-fadeIn"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Koneksi internet terhubung kembali</span>
        </div>
      )}

      {/* 3. New Version Update Toast */}
      {needRefresh && (
        <div
          id="pwa-update-toast"
          className="fixed bottom-24 right-4 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-red-500/50 flex flex-col gap-3 animate-slideUp"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Versi Baru Tersedia!</span>
            </div>
            <button
              onClick={() => setNeedRefresh(false)}
              className="text-slate-400 hover:text-white p-1"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300">
            Pembaruan performa & fitur terbaru telah siap. Muat ulang untuk menerapkan pembaruan.
          </p>
          <button
            onClick={handleRefreshApp}
            className="w-full py-2 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/30"
          >
            Muat Ulang Sekarang
          </button>
        </div>
      )}

      {/* 4. Sleek Floating Install Banner (Mobile & Desktop) */}
      {!isStandalone && showBanner && (isInstallable || isIOS) && (
        <div
          id="pwa-install-banner"
          className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:max-w-md bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 animate-slideUp"
        >
          <div className="flex items-start gap-3.5">
            <img
              src="/icons/icon-192x192.png"
              alt="FHRCAR App Icon"
              className="w-12 h-12 rounded-xl object-contain shadow-md border border-slate-700 shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo.png';
              }}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                  <span>Pasang Aplikasi FHRCAR</span>
                  <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-extrabold px-1.5 py-0.5 rounded">PWA</span>
                </h4>
                <button
                  onClick={handleDismissBanner}
                  className="text-slate-400 hover:text-white p-1 -mr-1 -mt-1 rounded-lg transition-colors"
                  aria-label="Tutup banner install"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Akses cepat servis darurat 24 jam & booking home service langsung dari layar utama tanpa buka browser.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  id="pwa-install-action-btn"
                  onClick={handleInstallClick}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isIOS ? 'Cara Pasang di iPhone' : 'Install Aplikasi (Gratis)'}</span>
                </button>
                <button
                  onClick={handleDismissBanner}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
                >
                  Nanti Saja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. iOS Safari Install Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl relative space-y-5 animate-slideUp">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Tutup panduan iOS"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Pasang di iPhone / iPad</h3>
                <p className="text-xs text-slate-400">Ikuti 3 langkah mudah berikut:</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-200">
              <div className="flex items-start gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/50">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">1</span>
                <div>
                  <p className="font-semibold text-white">Ketuk tombol Bagikan (Share)</p>
                  <p className="text-slate-400 mt-0.5 flex items-center gap-1.5">
                    Ikon kotak berpanah ke atas <Share2 className="w-4 h-4 text-blue-400 inline" /> di bar navigasi bawah Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/50">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">2</span>
                <div>
                  <p className="font-semibold text-white">Pilih "Tambah ke Layar Utama"</p>
                  <p className="text-slate-400 mt-0.5 flex items-center gap-1.5">
                    Gulir ke bawah dan ketuk opsi <PlusSquare className="w-4 h-4 text-slate-300 inline" /> <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/50">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">3</span>
                <div>
                  <p className="font-semibold text-white">Ketuk "Tambah" (Add)</p>
                  <p className="text-slate-400 mt-0.5">
                    Di pojok kanan atas layar untuk menyelesaikan pemasangan.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Tanpa unduh App Store
              </span>
              <button
                onClick={() => setShowIOSModal(false)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Utility function to dispatch install trigger from anywhere in the app
 */
export function triggerPWAInstall() {
  window.dispatchEvent(new CustomEvent('fhrcar-trigger-install'));
}
