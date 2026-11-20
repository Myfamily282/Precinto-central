import React, { useEffect, useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

export const PWAInstallButton: React.FC<{ onOpenApkGuide: () => void }> = ({ onOpenApkGuide }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {isInstallable && (
          <button
            type="button"
            onClick={() => void install()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#5C3A21] to-[#8B5A2B] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 whitespace-nowrap shrink-0"
          >
            <Download className="h-4 w-4" />
            Instalar en Android
          </button>
        )}

        {isIOS && (
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#D4BC9C] bg-[#FBF6EE] px-4 py-2 text-sm font-semibold text-[#3D2414] transition-colors hover:bg-[#EFE2CE] dark:border-[#593C28] dark:bg-[#22160F] dark:text-[#FBF3E6] dark:hover:bg-[#332116] whitespace-nowrap shrink-0"
          >
            <Download className="h-4 w-4" />
            Instalar en iOS
          </button>
        )}

        <button
          type="button"
          onClick={onOpenApkGuide}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#D4BC9C] bg-[#FBF6EE] px-4 py-2 text-sm font-semibold text-[#3D2414] transition-colors hover:bg-[#EFE2CE] dark:border-[#593C28] dark:bg-[#22160F] dark:text-[#FBF3E6] dark:hover:bg-[#332116] whitespace-nowrap shrink-0"
        >
          <Smartphone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          Obtener APK sin PC
        </button>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#D9C5A9] bg-[#FBF6EE] p-6 shadow-xl dark:border-[#4A3222] dark:bg-[#22160F]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#2E1C10] dark:text-[#FBF3E6]">
                Instalar en iPhone / iPad
              </h3>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#7A5E46] hover:bg-[#EFE2CE] dark:text-[#C8B297] dark:hover:bg-[#332116]"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#5C3A21] dark:text-[#EAD8BE]">
              1. Toca el botón <strong>Compartir</strong> en la barra de Safari.
              <br />
              2. Desliza hacia abajo y elige <strong>Agregar a inicio</strong>.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 min-h-[44px] w-full rounded-xl bg-[#7C4D2B] py-2.5 text-sm font-semibold text-white hover:bg-[#643C1F] dark:bg-[#8B5A2B]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-md items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-900 shadow-lg dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>Sin conexión — El modo Presencial (1 celular) y Minijuegos siguen activos</span>
    </div>
  );
};
