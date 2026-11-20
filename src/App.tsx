import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Gamepad2,
  Globe,
  Moon,
  Play,
  SearchCheck,
  Server,
  Smartphone,
  Sun,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { AndroidApkModal } from './components/AndroidApkModal.tsx';
import { ChalkboardMenu } from './components/ChalkboardMenu.tsx';
import { PrecinctHeroIllustration } from './components/EvidenceArtwork.tsx';
import { HowToPlayModal } from './components/HowToPlayModal.tsx';
import { MinigamesHub } from './components/MinigamesHub.tsx';
import { OnlineRoomView } from './components/OnlineRoomView.tsx';
import { PassAndPlayMode } from './components/PassAndPlayMode.tsx';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton.tsx';
import { SplashEntrance } from './components/SplashEntrance.tsx';
import { SUSPECT_AVATAR_SPECS, SuspectPortraitArtwork } from './components/SuspectPortraitArtwork.tsx';
import { PLAYER_COLORS } from './data/evidenceCatalog.ts';
import { useRoomSocket } from './hooks/useRoomSocket.ts';
import { useTheme } from './hooks/useTheme.ts';
import type { GameMode } from './shared/types.ts';
import { soundFX } from './utils/sound.ts';

type ScreenView =
  | 'CHALKBOARD'
  | 'DETECTIVES'
  | 'MULTIPLAYER_SETUP'
  | 'PASS_AND_PLAY'
  | 'MINIGAMES'
  | 'SETTINGS';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [muted, setMuted] = useState(() => soundFX.isMuted());
  const [view, setView] = useState<ScreenView>('CHALKBOARD');
  const [showApkModal, setShowApkModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashRunKey, setSplashRunKey] = useState(0);

  // Multiplayer setup state
  const [setupTab, setSetupTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState(PLAYER_COLORS[0]);
  const [playerAvatarId, setPlayerAvatarId] = useState(SUSPECT_AVATAR_SPECS[0].id);
  const [selectedRoomMode, setSelectedRoomMode] = useState<GameMode>('online');
  const [joinCode, setJoinCode] = useState('');

  const socket = useRoomSocket();

  const handleToggleMute = () => {
    const nextMuted = soundFX.toggleMute();
    setMuted(nextMuted);
    if (!nextMuted) soundFX.toggleSwitch();
  };

  const handleBackToBoard = () => {
    soundFX.woodTap();
    if (socket.room) {
      socket.leaveRoom();
    }
    if (view === 'MULTIPLAYER_SETUP' || view === 'PASS_AND_PLAY') {
      setView('DETECTIVES');
      return;
    }
    setView('CHALKBOARD');
  };

  const handleReplaySplash = () => {
    soundFX.woodTap();
    setSplashRunKey((k) => k + 1);
    setView('CHALKBOARD');
    setShowSplash(true);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    try {
      if (window.localStorage.getItem('precinto_hide_howto_auto') !== '1') {
        window.setTimeout(() => {
          setShowHowToPlay(true);
        }, 280);
      }
    } catch {
      setShowHowToPlay(true);
    }
  };

  const handleCloseHowToPlay = (dontShowAgain: boolean) => {
    setShowHowToPlay(false);
    if (dontShowAgain) {
      try {
        window.localStorage.setItem('precinto_hide_howto_auto', '1');
      } catch {
        // ignore storage errors
      }
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.woodTap();
    socket.createRoom(
      playerName.trim() || 'Detective',
      playerColor,
      playerAvatarId,
      selectedRoomMode
    );
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    soundFX.woodTap();
    socket.joinRoom(
      joinCode.trim().toUpperCase(),
      playerName.trim() || 'Detective',
      playerColor,
      playerAvatarId
    );
  };

  const inActiveRoom = Boolean(socket.room && socket.playerId);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {showSplash && (
          <SplashEntrance key={splashRunKey} onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>
      <div className="relative min-h-screen overflow-x-hidden bg-[#F5EFE6] text-[#2C1B10] transition-colors dark:bg-[#140D09] dark:text-[#F7EFE2]">
        {/* Ambient lively warm wood & golden lamp glow */}
        <div
          className="pointer-events-none fixed inset-x-0 -top-24 -z-0 mx-auto h-72 max-w-4xl rounded-full bg-gradient-to-r from-amber-500/15 via-orange-400/15 to-yellow-500/15 blur-3xl dark:from-amber-600/12 dark:via-orange-600/10 dark:to-yellow-500/10"
          aria-hidden="true"
        />

        {/* Compact Game Shell Header (<= 56px) */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: showSplash ? 4.5 : 0, ease: [0.16, 1, 0.3, 1] }}
          className="sticky top-0 z-30 border-b border-[#DECBB3] bg-[#FBF6EE]/95 backdrop-blur-md dark:border-[#4B3222] dark:bg-[#1D130D]/95"
        >
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {(view !== 'CHALKBOARD' || inActiveRoom) && (
                <button
                  type="button"
                  onClick={handleBackToBoard}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#5C3A21] hover:bg-[#EDE0CE] dark:text-[#E7D8BE] dark:hover:bg-[#2F1F15]"
                  aria-label="Volver"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  soundFX.woodTap();
                  if (socket.room) socket.leaveRoom();
                  setView('CHALKBOARD');
                }}
                className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0"
              >
              <svg viewBox="0 0 36 36" className="h-8 w-8 shrink-0" fill="none" aria-hidden="true">
                <rect width="36" height="36" rx="9" fill="#3B2314" />
                <path
                  d="M18 6L28 10V18C28 24.5 23.6 29.5 18 31.5C12.4 29.5 8 24.5 8 18V10L18 6Z"
                  fill="#5C3A21"
                  stroke="#D99B52"
                  strokeWidth="2"
                />
                <circle cx="17" cy="17.5" r="4.5" stroke="#F3D590" strokeWidth="2.2" />
                <path d="M20.5 21L23.5 24" stroke="#F3D590" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
              <span className="font-display text-base font-bold tracking-tight text-[#2C1B10] dark:text-[#FFF8EB]">
                Precinto Central
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundFX.woodTap();
                setShowApkModal(true);
              }}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#D8C2A6] bg-[#F4EAD9] px-3 text-xs font-semibold text-[#4A2E1A] hover:bg-[#EADBC3] dark:border-[#5C3D28] dark:bg-[#2B1C13] dark:text-[#F3D590] dark:hover:bg-[#3A261A] whitespace-nowrap"
            >
              <Smartphone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">APK Android</span>
              <span className="sm:hidden">APK</span>
            </button>

            <button
              type="button"
              onClick={handleToggleMute}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[#5C3A21] hover:bg-[#EDE0CE] dark:text-[#E7D8BE] dark:hover:bg-[#2F1F15]"
              aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.toggleSwitch();
                toggleTheme();
              }}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[#5C3A21] hover:bg-[#EDE0CE] dark:text-[#E7D8BE] dark:hover:bg-[#2F1F15]"
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-6xl px-4 py-5 pb-16">
        {/* Global Socket Error Banner */}
        {socket.error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-900 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
            <span>{socket.error}</span>
            <button
              type="button"
              onClick={socket.clearError}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900"
              aria-label="Cerrar error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ACTIVE MULTIPLAYER ROOM */}
        {inActiveRoom && socket.room && socket.playerId ? (
          <OnlineRoomView
            room={socket.room}
            playerId={socket.playerId}
            privateRole={socket.privateRole}
            connected={socket.connected}
            onUpdateSettings={socket.updateSettings}
            onStartGame={socket.startGame}
            onMarkReadyCard={socket.markReadyCard}
            onStartDescribe={socket.startDescribe}
            onStartVote={socket.startVote}
            onSendChat={socket.sendChat}
            onAddClue={socket.addClue}
            onAddNote={socket.addNote}
            onCastVote={socket.castVote}
            onNextRound={socket.nextRound}
            onReturnLobby={socket.returnLobby}
            onStartDuel={socket.startDuel}
            onSendDuelProgress={socket.sendDuelProgress}
            onLeave={socket.leaveRoom}
          />
        ) : (
          <>
            {/* CHALKBOARD MAIN MENU (POST-SPLASH) */}
            {view === 'CHALKBOARD' && (
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.48, delay: showSplash ? 4.55 : 0, ease: [0.16, 1, 0.3, 1] }}
              >
                <ChalkboardMenu
                  onSelectDetectives={() => setView('DETECTIVES')}
                  onSelectSettings={() => setView('SETTINGS')}
                  onSelectMinigames={() => setView('MINIGAMES')}
                  onSelectHowToPlay={() => setShowHowToPlay(true)}
                />
              </motion.div>
            )}

            {/* DETECTIVES MODE HUB */}
            {view === 'DETECTIVES' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <section className="grid grid-cols-1 items-center gap-6 rounded-3xl border-2 border-[#D8C2A6] bg-[#FBF6EE] p-5 shadow-md sm:p-8 lg:grid-cols-12 dark:border-[#593C28] dark:bg-[#22160F]">
                  <div className="space-y-4 lg:col-span-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8B5A2B] dark:text-[#F3D590]">
                      <span>Deducción social</span>
                      <span aria-hidden="true">·</span>
                      <span>3 a 10 detectives</span>
                      <span aria-hidden="true">·</span>
                      <span>Online y presencial</span>
                    </div>

                    <h1 className="font-display text-3xl font-bold tracking-tight text-[#2C1B10] sm:text-4xl [text-wrap:balance] dark:text-[#FFF8EB]">
                      Describe la evidencia, descubre al impostor
                    </h1>

                    <p className="max-w-xl text-sm leading-relaxed text-[#5E4534] dark:text-[#D9C7AF]">
                      Cada detective recibe el caso de robo explicado y pistas exclusivas distintas. El impostor solo recibe un ~10% de información y una foto distinta. Debatan en vivo y voten en secreto.
                    </p>

                    <div className="grid grid-cols-1 gap-2.5 pt-2 sm:grid-cols-2">
                      <motion.button
                        type="button"
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          soundFX.woodTap();
                          setView('MULTIPLAYER_SETUP');
                        }}
                        className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5C3A21] via-[#8B5A2B] to-[#B6783C] px-5 text-sm font-bold text-[#FFF8EB] shadow-lg shadow-[#5C3A21]/25 transition-all hover:brightness-110"
                      >
                        <Globe className="h-5 w-5" />
                        Online / Multi-Celular
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          soundFX.woodTap();
                          setView('PASS_AND_PLAY');
                        }}
                        className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-xl border-2 border-[#C88D4B]/80 bg-[#EFE2CE] px-5 text-sm font-bold text-[#3A2212] shadow-sm transition-all hover:bg-[#E7D4B8] dark:border-[#7A5236] dark:bg-[#322116] dark:text-[#FFF8EB] dark:hover:bg-[#3E291B]"
                      >
                        <Users className="h-5 w-5 text-[#8B5A2B] dark:text-[#F3D590]" />
                        Presencial (1 Celular)
                      </motion.button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <motion.button
                        type="button"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          soundFX.tabSwitch();
                          setView('MINIGAMES');
                        }}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-emerald-400/70 bg-emerald-50 px-4 text-sm font-semibold text-emerald-900 transition-colors hover:bg-emerald-100 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
                      >
                        <Gamepad2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Minijuegos de Comisaría
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          soundFX.woodTap();
                          setShowHowToPlay(true);
                        }}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#D4BC9C] bg-[#F5ECE0] px-4 text-sm font-semibold text-[#5C3A21] transition-colors hover:bg-[#EAD8BE] dark:border-[#593C28] dark:bg-[#2B1C12] dark:text-[#F3D590]"
                      >
                        <BookOpen className="h-4 w-4" />
                        ¿Cómo se juega?
                      </motion.button>

                      <PWAInstallButton onOpenApkGuide={() => setShowApkModal(true)} />
                    </div>
                  </div>

                  <div className="lg:col-span-6">
                    <PrecinctHeroIllustration className="w-full rounded-2xl shadow-md" />
                  </div>
                </section>

                {/* Three Game Pillars Summary */}
                <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <motion.button
                    type="button"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      soundFX.woodTap();
                      setView('MULTIPLAYER_SETUP');
                    }}
                    className="flex flex-col justify-between rounded-2xl border-2 border-[#DECBB3] bg-[#FBF6EE] p-5 text-left shadow-sm transition-colors hover:border-[#9E6534] dark:border-[#4B3222] dark:bg-[#22160F] dark:hover:border-[#D99B52]"
                  >
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6E4423] to-[#B6783C] text-[#FFF8EB] shadow-sm">
                        <Globe className="h-5 w-5" />
                      </div>
                      <h2 className="mt-3 font-display text-base font-bold text-[#2C1B10] dark:text-[#FFF8EB]">
                        Salas con Código, Chat y Voto
                      </h2>
                      <p className="mt-1 text-xs leading-relaxed text-[#5E4534] dark:text-[#D9C7AF]">
                        Juega a distancia o en la misma sala usando cada quien su celular, con chat integrado y votación secreta.
                      </p>
                    </div>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      soundFX.woodTap();
                      setView('PASS_AND_PLAY');
                    }}
                    className="flex flex-col justify-between rounded-2xl border-2 border-[#DECBB3] bg-[#FBF6EE] p-5 text-left shadow-sm transition-colors hover:border-[#C88D4B] dark:border-[#4B3222] dark:bg-[#22160F] dark:hover:border-[#F3D590]"
                  >
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-orange-500 text-white shadow-sm">
                        <Users className="h-5 w-5" />
                      </div>
                      <h2 className="mt-3 font-display text-base font-bold text-[#2C1B10] dark:text-[#FFF8EB]">
                        Pasa el Celular en Mesa
                      </h2>
                      <p className="mt-1 text-xs leading-relaxed text-[#5E4534] dark:text-[#D9C7AF]">
                        ¿Reunión presencial sin datos? Rota un solo teléfono con pantalla anti-miradas para ver fotos y votar.
                      </p>
                    </div>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      soundFX.tabSwitch();
                      setView('MINIGAMES');
                    }}
                    className="flex flex-col justify-between rounded-2xl border-2 border-[#DECBB3] bg-[#FBF6EE] p-5 text-left shadow-sm transition-colors hover:border-emerald-500 dark:border-[#4B3222] dark:bg-[#22160F] dark:hover:border-emerald-400"
                  >
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm">
                        <SearchCheck className="h-5 w-5" />
                      </div>
                      <h2 className="mt-3 font-display text-base font-bold text-[#2C1B10] dark:text-[#FFF8EB]">
                        Escena del Crimen y Minijuegos
                      </h2>
                      <p className="mt-1 text-xs leading-relaxed text-[#5E4534] dark:text-[#D9C7AF]">
                        Encuentra diferencias en escenas del crimen (solo o en duelo online), abre cajas fuertes y entrena tu memoria.
                      </p>
                    </div>
                  </motion.button>
                </section>
              </motion.div>
            )}

            {/* SETTINGS (AJUSTES) */}
            {view === 'SETTINGS' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto max-w-xl space-y-4"
              >
                <div className="rounded-3xl border-2 border-[#D8C2A6] bg-[#FBF6EE] p-6 shadow-md dark:border-[#593C28] dark:bg-[#22160F]">
                  <h2 className="font-display text-2xl font-bold text-[#2C1B10] dark:text-[#FFF8EB]">
                    Ajustes de Comisaría
                  </h2>
                  <p className="mt-1 text-xs text-[#5E4534] dark:text-[#D9C7AF]">
                    Personaliza el audio, la apariencia de madera, la animación de entrada y la descarga para Android.
                  </p>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-2xl border border-[#DFCBB2] bg-[#F3EADF] px-4 py-3.5 dark:border-[#4B3222] dark:bg-[#19100A]">
                      <div>
                        <div className="text-sm font-bold text-[#2C1B10] dark:text-[#FFF8EB]">
                          Efectos de sonido
                        </div>
                        <div className="text-xs text-[#6B4E3B] dark:text-[#CBB799]">
                          Sonidos táctiles al votar, revelar rol o abrir pistas
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleMute}
                        className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 text-xs font-bold text-white shadow-sm ${
                          muted
                            ? 'bg-[#7A6352] hover:bg-[#655143]'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-700'
                        }`}
                      >
                        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        {muted ? 'Silenciado' : 'Activado'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-[#DFCBB2] bg-[#F3EADF] px-4 py-3.5 dark:border-[#4B3222] dark:bg-[#19100A]">
                      <div>
                        <div className="text-sm font-bold text-[#2C1B10] dark:text-[#FFF8EB]">
                          Tema visual
                        </div>
                        <div className="text-xs text-[#6B4E3B] dark:text-[#CBB799]">
                          Alterna entre roble claro y nogal oscuro
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.toggleSwitch();
                          toggleTheme();
                        }}
                        className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#5C3A21] to-[#9A6332] px-4 text-xs font-bold text-[#FFF8EB] shadow-sm"
                      >
                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-[#DFCBB2] bg-[#F3EADF] px-4 py-3.5 dark:border-[#4B3222] dark:bg-[#19100A]">
                      <div>
                        <div className="text-sm font-bold text-[#2C1B10] dark:text-[#FFF8EB]">
                          Cómo se juega
                        </div>
                        <div className="text-xs text-[#6B4E3B] dark:text-[#CBB799]">
                          Abre el manual rápido de reglas y roles
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.woodTap();
                          setShowHowToPlay(true);
                        }}
                        className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#6E4423] to-[#A66E38] px-4 text-xs font-bold text-[#FFF8EB] shadow-sm"
                      >
                        <BookOpen className="h-4 w-4" />
                        Ver Guía
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-[#DFCBB2] bg-[#F3EADF] px-4 py-3.5 dark:border-[#4B3222] dark:bg-[#19100A]">
                      <div>
                        <div className="text-sm font-bold text-[#2C1B10] dark:text-[#FFF8EB]">
                          Animación de entrada
                        </div>
                        <div className="text-xs text-[#6B4E3B] dark:text-[#CBB799]">
                          Vuelve a ver la bienvenida animada antes de la pizarra
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleReplaySplash}
                        className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C4D2B] to-[#B6783C] px-4 text-xs font-bold text-[#FFF8EB] shadow-sm"
                      >
                        <Play className="h-4 w-4" />
                        Ver Intro
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300/70 bg-amber-50/80 px-4 py-3.5 dark:border-amber-800/50 dark:bg-amber-950/30">
                      <div>
                        <div className="text-sm font-bold text-[#2C1B10] dark:text-[#FFF8EB]">
                          APK Android sin PC
                        </div>
                        <div className="text-xs text-[#5E4534] dark:text-[#D9C7AF]">
                          Instala en tu teléfono o compila tu APK desde la nube
                        </div>
                      </div>
                      <PWAInstallButton onOpenApkGuide={() => setShowApkModal(true)} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* MULTIPLAYER SETUP (CREATE / JOIN ONLINE OR LOCAL MULTI-PHONE) */}
            {view === 'MULTIPLAYER_SETUP' && (
              <div className="mx-auto max-w-lg space-y-4">
                {!socket.connected && (
                  <div className="rounded-2xl border border-amber-300/80 bg-amber-50/90 p-4 text-xs text-amber-950 shadow-sm dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <Server className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" />
                        <div>
                          <p className="font-bold">
                            {socket.needsServerConfig
                              ? 'Falta conectar tu APK a un servidor Online'
                              : 'Conectando con el servidor Online...'}
                          </p>
                          <p className="mt-1 leading-relaxed text-amber-900/85 dark:text-amber-200/85">
                            {socket.needsServerConfig
                              ? 'Este APK no trae servidor integrado. Despliega el proyecto en Render (gratis) y pega tu URL https://... aquí para crear y unirte a salas.'
                              : 'Intentando conectar con el servidor. Si usas el plan gratuito de Render y estaba en reposo, tarda ~25–35 segundos en despertar.'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.woodTap();
                          setShowApkModal(true);
                        }}
                        className="shrink-0 rounded-lg bg-[#7C4D2B] px-3 py-2 text-xs font-bold text-white hover:bg-[#643C1F] dark:bg-[#8B5A2B]"
                      >
                        Configurar URL
                      </button>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border-2 border-[#D8C2A6] bg-[#FBF6EE] p-6 shadow-md dark:border-[#593C28] dark:bg-[#22160F]">
                  <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#EADBC3] p-1 dark:bg-[#160F0A]">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.tabSwitch();
                        setSetupTab('create');
                      }}
                      className={`min-h-[44px] rounded-lg text-sm font-semibold transition-colors ${
                        setupTab === 'create'
                          ? 'bg-[#7C4D2B] text-[#FFF8EB] shadow-sm'
                          : 'text-[#5E4534] dark:text-[#D9C7AF]'
                      }`}
                    >
                      Crear Sala
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.tabSwitch();
                        setSetupTab('join');
                      }}
                      className={`min-h-[44px] rounded-lg text-sm font-semibold transition-colors ${
                        setupTab === 'join'
                          ? 'bg-[#7C4D2B] text-[#FFF8EB] shadow-sm'
                          : 'text-[#5E4534] dark:text-[#D9C7AF]'
                      }`}
                    >
                      Unirse con Código
                    </button>
                  </div>

                  {/* Common profile inputs */}
                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#5E4534] dark:text-[#D9C7AF]">
                        Tu nombre de detective
                      </label>
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Ej. Detective Lian"
                        maxLength={18}
                        className="mt-1.5 min-h-[48px] w-full rounded-xl border border-[#CBB394] bg-[#F4EAD9] px-3.5 text-sm font-medium text-[#2C1B10] focus:border-[#8B5A2B] focus:outline-none dark:border-[#593C28] dark:bg-[#150E09] dark:text-[#FFF8EB]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5E4534] dark:text-[#D9C7AF]">
                        Tu foto de expediente (obligatoria)
                      </label>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {SUSPECT_AVATAR_SPECS.map((av) => {
                          const selected = playerAvatarId === av.id;
                          return (
                            <button
                              key={av.id}
                              type="button"
                              onClick={() => {
                                soundFX.woodTap();
                                setPlayerAvatarId(av.id);
                              }}
                              className={`flex flex-col items-center gap-1 rounded-xl border p-1.5 transition-all ${
                                selected
                                  ? 'border-[#8B5A2B] bg-[#EFE2CE] ring-2 ring-[#C88D4B]/50 dark:border-[#D99B52] dark:bg-[#342217]'
                                  : 'border-[#DFCBB2] bg-[#F4EAD9]/60 hover:border-[#B68D5E] dark:border-[#4B3222] dark:bg-[#19100A]'
                              }`}
                            >
                              <div
                                className="h-14 w-12 overflow-hidden rounded-lg border-2 bg-[#E6D9C3]"
                                style={{ borderColor: selected ? playerColor : 'transparent' }}
                              >
                                <SuspectPortraitArtwork avatarId={av.id} className="h-full w-full" />
                              </div>
                              <span className="w-full truncate text-center text-[10px] font-semibold text-[#4A2E1A] dark:text-[#E7D8BE]">
                                {av.label.split(' ')[1] ?? av.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5E4534] dark:text-[#D9C7AF]">
                        Color de placa
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {PLAYER_COLORS.slice(0, 8).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setPlayerColor(c)}
                            style={{ backgroundColor: c }}
                            className={`h-10 w-10 rounded-xl transition-transform ${
                              playerColor === c
                                ? 'scale-110 ring-2 ring-[#5C3A21] ring-offset-2 dark:ring-[#F3D590] dark:ring-offset-[#22160F]'
                                : 'opacity-80 hover:opacity-100'
                            }`}
                            aria-label={`Color ${c}`}
                          />
                        ))}
                      </div>
                    </div>

                    {setupTab === 'create' ? (
                      <form onSubmit={handleCreateSubmit} className="space-y-4 pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-[#5E4534] dark:text-[#D9C7AF]">
                            Tipo de partida
                          </label>
                          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => setSelectedRoomMode('online')}
                              className={`min-h-[60px] rounded-xl border p-3 text-left ${
                                selectedRoomMode === 'online'
                                  ? 'border-[#8B5A2B] bg-[#EFE2CE] dark:border-[#D99B52] dark:bg-[#342217]'
                                  : 'border-[#DFCBB2] bg-[#F4EAD9]/60 dark:border-[#4B3222] dark:bg-[#19100A]'
                              }`}
                            >
                              <div className="text-sm font-bold text-[#2C1B10] dark:text-[#FFF8EB]">
                                Online a distancia
                              </div>
                              <div className="text-xs text-[#6B4E3B] dark:text-[#CBB799]">
                                Cada quien desde su casa con chat
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedRoomMode('local_multi')}
                              className={`min-h-[60px] rounded-xl border p-3 text-left ${
                                selectedRoomMode === 'local_multi'
                                  ? 'border-[#8B5A2B] bg-[#EFE2CE] dark:border-[#D99B52] dark:bg-[#342217]'
                                  : 'border-[#DFCBB2] bg-[#F4EAD9]/60 dark:border-[#4B3222] dark:bg-[#19100A]'
                              }`}
                            >
                              <div className="text-sm font-bold text-[#2C1B10] dark:text-[#FFF8EB]">
                                Presencial multi-celular
                              </div>
                              <div className="text-xs text-[#6B4E3B] dark:text-[#CBB799]">
                                Juntos, cada uno con su teléfono
                              </div>
                            </button>
                          </div>
                        </div>

                        <motion.button
                          type="submit"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          className="min-h-[52px] w-full rounded-xl bg-gradient-to-r from-[#5C3A21] via-[#8B5A2B] to-[#B6783C] text-sm font-bold text-[#FFF8EB] shadow-md shadow-[#5C3A21]/25 hover:brightness-110"
                        >
                          Abrir Sala y Generar Código
                        </motion.button>
                      </form>
                    ) : (
                      <form onSubmit={handleJoinSubmit} className="space-y-4 pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-[#5E4534] dark:text-[#D9C7AF]">
                            Código de sala (6 caracteres)
                          </label>
                          <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="Ej. A7K9P2"
                            maxLength={6}
                            className="mt-1.5 min-h-[52px] w-full rounded-xl border border-[#CBB394] bg-[#F4EAD9] px-4 text-center font-mono text-xl font-bold tracking-[0.25em] text-[#2C1B10] uppercase focus:border-[#8B5A2B] focus:outline-none dark:border-[#593C28] dark:bg-[#150E09] dark:text-[#FFF8EB]"
                          />
                        </div>

                        <motion.button
                          type="submit"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={joinCode.trim().length < 4}
                          className="min-h-[52px] w-full rounded-xl bg-gradient-to-r from-[#5C3A21] via-[#8B5A2B] to-[#B6783C] text-sm font-bold text-[#FFF8EB] shadow-md shadow-[#5C3A21]/25 hover:brightness-110 disabled:opacity-40"
                        >
                          Entrar a la Sala
                        </motion.button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PASS AND PLAY (PRESENCIAL 1 CELULAR) */}
            {view === 'PASS_AND_PLAY' && (
              <PassAndPlayMode onBack={() => setView('DETECTIVES')} />
            )}

            {/* MINIGAMES HUB */}
            {view === 'MINIGAMES' && <MinigamesHub />}
          </>
        )}
      </main>

      <AndroidApkModal
        open={showApkModal}
        onClose={() => setShowApkModal(false)}
        serverUrl={socket.serverUrl}
        customServerUrl={socket.customServerUrl}
        isStandaloneApk={socket.isStandaloneApk}
        onUpdateServerUrl={socket.updateServerUrl}
        onTestServer={socket.testServerConnection}
      />
      <HowToPlayModal
        open={showHowToPlay}
        fromChalkboard={view === 'CHALKBOARD'}
        onClose={handleCloseHowToPlay}
      />
      <OfflineIndicator />
      </div>
    </MotionConfig>
  );
}
