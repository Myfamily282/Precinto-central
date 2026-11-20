import React, { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, Globe, Server, Smartphone, X } from 'lucide-react';
import { soundFX } from '../utils/sound.ts';

interface AndroidApkModalProps {
  open: boolean;
  onClose: () => void;
  serverUrl?: string;
  customServerUrl?: string;
  isStandaloneApk?: boolean;
  onUpdateServerUrl?: (url: string) => void;
  onTestServer?: (url?: string) => Promise<{ ok: boolean; activeRooms?: number; error?: string }>;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  open,
  onClose,
  serverUrl = '',
  customServerUrl = '',
  isStandaloneApk = false,
  onUpdateServerUrl,
  onTestServer,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [urlInput, setUrlInput] = useState(customServerUrl || '');
  const [testing, setTesting] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (open) {
      setUrlInput(customServerUrl || '');
      setTestFeedback(null);
    }
  }, [open, customServerUrl]);

  if (!open) return null;

  const currentUrl =
    typeof window !== 'undefined' && !isStandaloneApk ? window.location.origin : serverUrl;

  const handleCopy = async () => {
    if (!currentUrl) return;
    try {
      await navigator.clipboard.writeText(currentUrl);
      soundFX.woodTap();
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // Ignore clipboard failures on restricted iframes
    }
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateServerUrl) return;
    soundFX.woodTap();
    onUpdateServerUrl(urlInput);

    if (!onTestServer) return;
    const candidate = urlInput.trim() || serverUrl;
    setTesting(true);
    setTestFeedback(null);
    const result = await onTestServer(candidate);
    setTesting(false);
    if (result.ok) {
      soundFX.pinTack();
      setTestFeedback({
        ok: true,
        text: 'Servidor conectado correctamente. Ya puedes crear o unirte a salas online.',
      });
    } else {
      soundFX.errorThud();
      setTestFeedback({
        ok: false,
        text: result.error || 'No se pudo conectar con esa URL.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[#D9C5A9] bg-[#FBF6EE] p-6 shadow-2xl sm:rounded-2xl dark:border-[#4A3222] dark:bg-[#22160F]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFE2CE] text-[#7C4D2B] dark:bg-[#3A2416] dark:text-[#F3D590]">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#2E1C10] dark:text-[#FBF3E6]">
                Cómo hacerlo APK y jugar Online
              </h3>
              <p className="text-xs text-[#7A5E46] dark:text-[#C8B297]">
                Guía completa para Android sin PC y conexión multijugador en vivo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFX.woodTap();
              onClose();
            }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#7A5E46] hover:bg-[#EFE2CE] dark:text-[#C8B297] dark:hover:bg-[#332116]"
            aria-label="Cerrar guía"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm text-[#5C3A21] dark:text-[#EAD8BE]">
          {/* Opción 1: PWABuilder */}
          <div className="rounded-xl border border-[#DFCBB0] bg-[#F5ECE0] p-4 dark:border-[#4A3222] dark:bg-[#19100B]">
            <p className="font-semibold text-[#2E1C10] dark:text-[#FBF3E6]">
              1. Hacer APK rápido desde tu celular (PWABuilder)
            </p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-[#7A5E46] dark:text-[#C8B297]">
              <li>
                Publica o comparte la URL pública de tu app (o súbela a un servidor Node como Render o Railway).
              </li>
              <li>
                Copia esa URL pública y pégala en Chrome de tu Android dentro de{' '}
                <strong>pwabuilder.com</strong>.
              </li>
              <li>
                Elige <strong>Package for stores → Android</strong> y descarga tu archivo{' '}
                <strong>.apk</strong>. Con este método, el modo Online ya queda conectado automáticamente.
              </li>
            </ol>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {currentUrl && (
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#D4BC9C] bg-[#FBF6EE] px-3 py-1.5 text-xs font-semibold text-[#3D2414] hover:bg-[#EFE2CE] dark:border-[#593C28] dark:bg-[#2B1C12] dark:text-[#F5ECD8]"
                >
                  {copiedUrl ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedUrl ? 'URL copiada' : 'Copiar URL del servidor'}
                </button>
              )}
              <a
                href="https://www.pwabuilder.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#7C4D2B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#643C1F] dark:bg-[#8B5A2B]"
              >
                Abrir PWABuilder
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Opción 2: GitHub Actions */}
          <div className="rounded-xl border border-[#DFCBB0] bg-[#F5ECE0] p-4 dark:border-[#4A3222] dark:bg-[#19100B]">
            <p className="font-semibold text-[#2E1C10] dark:text-[#FBF3E6]">
              2. Compilar APK nativo con Capacitor en la nube (GitHub Actions)
            </p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-[#7A5E46] dark:text-[#C8B297]">
              <li>Exporta o sube el proyecto a un repositorio en GitHub desde tu navegador.</li>
              <li>
                El flujo incluido <strong>Build Android APK</strong> compila automáticamente el archivo{' '}
                <strong>app-debug.apk</strong> en la nube sin usar PC.
              </li>
              <li>
                Entra a <strong>Actions → Build Android APK</strong> y descarga el artefacto{' '}
                <strong>precinto-central-android-apk</strong>.
              </li>
            </ol>
          </div>

          {/* Cómo jugar Online */}
          <div className="rounded-xl border border-[#DFCBB0] bg-[#F5ECE0] p-4 dark:border-[#4A3222] dark:bg-[#19100B]">
            <div className="flex items-center gap-2 font-semibold text-[#2E1C10] dark:text-[#FBF3E6]">
              <Globe className="h-4 w-4 text-[#8B5A2B] dark:text-[#F3D590]" />
              <span>3. Cómo hacer que funcione Online entre amigos</span>
            </div>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-[#7A5E46] dark:text-[#C8B297]">
              <li>
                <strong>Aloja tu servidor permanente 24/7:</strong> sube el proyecto a GitHub y conéctalo gratis en <strong>Render</strong> (<em>New → Blueprint</em> o <em>Web Service</em> con <code>npm install && npm run build</code> y <code>npm start</code>) o <strong>Railway</strong>. Ya incluye configuración automática para Node 22 y WebSockets.
              </li>
              <li>
                <strong>Crea o únete a una sala:</strong> entra a <strong>Detectives → Online / Multi-Celular</strong>, crea una sala y comparte el código de 6 letras.
              </li>
              <li>
                <strong>Si usas el APK nativo de GitHub:</strong> pega abajo tu URL fija <code>https://...</code> para conectar el APK por WebSocket (o guárdala en GitHub como variable <code>VITE_SERVER_URL</code> antes de compilar).
              </li>
            </ol>

            {onUpdateServerUrl && (
              <form onSubmit={handleSaveAndTest} className="mt-3 space-y-2 border-t border-[#DFCBB0] pt-3 dark:border-[#4A3222]">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#2E1C10] dark:text-[#FBF3E6]">
                  <Server className="h-3.5 w-3.5 text-[#8B5A2B] dark:text-[#F3D590]" />
                  URL del servidor Online (opcional / para APK nativo)
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    inputMode="url"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://precinto-central.onrender.com"
                    className="min-h-[42px] flex-1 rounded-lg border border-[#CBB394] bg-[#FBF6EE] px-3 text-xs font-medium text-[#2C1B10] focus:border-[#8B5A2B] focus:outline-none dark:border-[#593C28] dark:bg-[#120C08] dark:text-[#FFF8EB]"
                  />
                  <button
                    type="submit"
                    disabled={testing}
                    className="min-h-[42px] shrink-0 rounded-lg bg-[#7C4D2B] px-3.5 text-xs font-semibold text-white hover:bg-[#643C1F] disabled:opacity-60 dark:bg-[#8B5A2B]"
                  >
                    {testing ? 'Conectando...' : 'Probar y Guardar'}
                  </button>
                </div>
                {testing && (
                  <p className="text-[11px] text-[#7A5E46] dark:text-[#C8B297]">
                    Probando conexión... si el servidor gratuito estaba en reposo, puede tardar hasta 30 segundos en despertar.
                  </p>
                )}
                {customServerUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setUrlInput('');
                      setTestFeedback(null);
                      onUpdateServerUrl('');
                    }}
                    className="text-[11px] font-semibold text-[#7A5E46] underline hover:text-[#2E1C10] dark:text-[#C8B297] dark:hover:text-[#FBF3E6]"
                  >
                    Restaurar servidor automático
                  </button>
                )}
                {testFeedback && (
                  <p
                    className={`rounded-lg px-2.5 py-2 text-xs font-medium ${
                      testFeedback.ok
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
                        : 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200'
                    }`}
                  >
                    {testFeedback.text}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.woodTap();
            onClose();
          }}
          className="mt-5 min-h-[48px] w-full rounded-xl bg-[#7C4D2B] py-3 text-sm font-semibold text-white hover:bg-[#643C1F] dark:bg-[#8B5A2B] dark:hover:bg-[#A66E38]"
        >
          Volver al juego
        </button>
      </div>
    </div>
  );
};
