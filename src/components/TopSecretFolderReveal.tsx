import React, { useEffect, useState } from 'react';
import { FileLock2, FolderOpen, RotateCcw, Shield, ShieldAlert } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { EvidenceItem, PlayerRole, PrivateClue } from '../shared/types.ts';
import { soundFX } from '../utils/sound.ts';
import { EvidenceArtwork } from './EvidenceArtwork.tsx';

interface TopSecretFolderRevealProps {
  role: PlayerRole;
  playerName?: string;
  caseCode: string;
  caseTitle: string;
  caseBriefing: string;
  item: EvidenceItem;
  privateClues: PrivateClue[];
  /** 'modal' = centered wooden-desk overlay (Online); 'inline' = embedded stage (Pass & Play) */
  variant?: 'modal' | 'inline';
  /** When true, shows sealed folder first until the player taps to break the seal */
  requireTapToOpen?: boolean;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const TopSecretFolderReveal: React.FC<TopSecretFolderRevealProps> = ({
  role,
  playerName,
  caseCode,
  caseTitle,
  caseBriefing,
  item,
  privateClues,
  variant = 'inline',
  requireTapToOpen = false,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const isImpostor = role === 'impostor';

  const [stage, setStage] = useState<'sealed' | 'opening' | 'opened'>(() => {
    if (requireTapToOpen) return 'sealed';
    return prefersReducedMotion ? 'opened' : 'opening';
  });
  const [animRunId, setAnimRunId] = useState(0);

  useEffect(() => {
    if (stage !== 'opening') return;
    soundFX.folderOpen(isImpostor);

    const timer = window.setTimeout(
      () => {
        setStage('opened');
      },
      prefersReducedMotion ? 50 : 1050
    );

    return () => window.clearTimeout(timer);
  }, [stage, animRunId, isImpostor, prefersReducedMotion]);

  const handleOpenFolder = () => {
    if (stage === 'sealed') {
      setStage(prefersReducedMotion ? 'opened' : 'opening');
    }
  };

  const handleReplay = () => {
    soundFX.click();
    setAnimRunId((n) => n + 1);
    setStage(prefersReducedMotion ? 'opened' : 'opening');
  };

  const folderStageContent = (
    <div
      className="relative mx-auto w-full max-w-xl"
      style={{ perspective: '1400px' }}
    >
      {/* Ambient warm desk-lamp highlight behind the dossier */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: stage === 'opened' ? 0.85 : 0.45, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-radial from-amber-500/25 via-amber-800/10 to-transparent blur-2xl"
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        {stage === 'sealed' ? (
          <motion.button
            key="sealed-folder"
            type="button"
            onClick={handleOpenFolder}
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="group relative block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F3D590]"
          >
            {/* Folder Tab */}
            <div className="ml-4 inline-flex items-center gap-2 rounded-t-xl border-2 border-b-0 border-[#9B7748] bg-[#D6B786] px-4 py-1.5 font-mono text-[11px] font-bold tracking-wider text-[#4A2D16] uppercase shadow-sm">
              <span>EXPEDIENTE · {caseCode}</span>
            </div>

            {/* Sealed Manila Front Cover */}
            <div
              className="relative overflow-hidden rounded-2xl rounded-tl-none border-2 border-[#9B7748] bg-gradient-to-br from-[#E6CE9E] via-[#D8B986] to-[#C29B63] p-6 text-[#362010] shadow-2xl sm:p-8"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(74,45,22,0.06) 1px, transparent 1px), linear-gradient(135deg, rgba(255,248,230,0.28) 0%, rgba(120,76,34,0.12) 100%)',
                backgroundSize: '14px 14px, 100% 100%',
              }}
            >
              {/* Left Spine Crease */}
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-[#8D6839]/35 to-transparent"
                aria-hidden="true"
              />

              {/* Brass Fastener + Red String Seal */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-bold tracking-widest text-[#6B4423] uppercase">
                    PRECINTO CENTRAL · ARCHIVO CLASIFICADO
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#2B180B]">
                    {playerName ? `Para: ${playerName}` : 'Asignación de Rol'}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-[#5C3A21]">
                    Asegúrate de que nadie mire tu pantalla antes de abrir la carpeta.
                  </p>
                </div>

                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#7C4D2B] bg-gradient-to-br from-[#F3D590] to-[#B6783C] shadow-md">
                  <FileLock2 className="h-5 w-5 text-[#3B210E]" />
                </div>
              </div>

              {/* Tilted Red Ink Stamp */}
              <div className="my-7 flex justify-center">
                <div className="-rotate-6 rounded-lg border-[3px] border-red-800/85 bg-red-700/10 px-6 py-2.5 text-center shadow-inner">
                  <div className="font-display text-2xl font-extrabold tracking-[0.2em] text-red-800 uppercase sm:text-3xl">
                    TOP SECRET
                  </div>
                  <div className="font-mono text-[11px] font-bold tracking-[0.28em] text-red-900/90 uppercase">
                    SOLO OJOS AUTORIZADOS
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <span className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#4A2B16] px-6 py-2.5 font-display text-sm font-bold tracking-wide text-[#FFF6E5] uppercase shadow-md transition-transform group-hover:scale-[1.03]">
                  <FolderOpen className="h-4 w-4 text-[#F3D590]" />
                  Tocar para abrir expediente
                </span>
              </div>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key={`open-folder-${animRunId}`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 22, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Top Manila Back Folder Tab */}
            <div className="flex items-center justify-between pl-4 pr-1">
              <div className="inline-flex items-center gap-2 rounded-t-xl border-2 border-b-0 border-[#9B7748] bg-[#C9A875] px-4 py-1.5 font-mono text-[11px] font-bold tracking-wider text-[#3B210E] uppercase">
                <span>EXPEDIENTE · {caseCode}</span>
              </div>

              {!prefersReducedMotion && stage === 'opened' && (
                <button
                  type="button"
                  onClick={handleReplay}
                  className="mb-1 inline-flex min-h-[32px] items-center gap-1 rounded-lg bg-[#2E1D12]/80 px-2.5 text-[11px] font-semibold text-[#F3D590] hover:bg-[#3F2819]"
                  title="Repetir apertura"
                >
                  <RotateCcw className="h-3 w-3" />
                  Repetir
                </button>
              )}
            </div>

            {/* Back Manila Folder Interior Pocket */}
            <div
              className="relative rounded-2xl rounded-tl-none border-2 border-[#9B7748] bg-gradient-to-b from-[#CCA975] via-[#C39E68] to-[#B48C54] p-2.5 shadow-2xl sm:p-4"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Metallic 2-Prong Folder Clip */}
              <div
                className="mx-auto mb-2 flex h-3 w-24 items-center justify-between rounded-full border border-[#6E5438] bg-gradient-to-b from-[#E5E0D5] to-[#A89E8E] px-2 shadow-sm"
                aria-hidden="true"
              >
                <span className="h-1.5 w-3 rounded-full bg-[#5C4B3B]" />
                <span className="h-1.5 w-3 rounded-full bg-[#5C4B3B]" />
              </div>

              {/* Inner Classified Paper Sheet */}
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: prefersReducedMotion ? 0 : 0.42,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`relative overflow-hidden rounded-xl border shadow-lg ${
                  isImpostor
                    ? 'border-rose-900/60 bg-[#251214] text-[#FBF3EE]'
                    : 'border-[#C6AF89] bg-[#FBF4E4] text-[#2C1B10]'
                }`}
              >
                {/* Paper Header Bar */}
                <div
                  className={`flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5 text-[11px] font-bold tracking-wider uppercase ${
                    isImpostor
                      ? 'border-rose-800/60 bg-[#361619] text-rose-200'
                      : 'border-[#DFCBB0] bg-[#F2E5CE] text-[#6E4423]'
                  }`}
                >
                  <span className="font-mono">
                    PRECINTO CENTRAL · {caseCode}
                  </span>
                  <span className="font-mono">
                    {playerName ? playerName : 'AGENTE ASIGNADO'}
                  </span>
                </div>

                {/* Role Verdict Stamp Reveal */}
                <div className="p-4 sm:p-5">
                  <motion.div
                    initial={
                      prefersReducedMotion
                        ? false
                        : { opacity: 0, scale: 1.18, rotate: -4 }
                    }
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      duration: 0.38,
                      delay: prefersReducedMotion ? 0 : 0.68,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`flex flex-col items-center justify-between gap-3 rounded-xl border-2 p-4 sm:flex-row ${
                      isImpostor
                        ? 'border-rose-500 bg-gradient-to-r from-rose-900/90 to-[#47161B] text-white'
                        : 'border-[#8B5A2B] bg-gradient-to-r from-[#5C3A21] via-[#7C4D2B] to-[#9A6332] text-[#FFF8EB]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                          isImpostor
                            ? 'border-rose-300/60 bg-rose-950/60 text-amber-200'
                            : 'border-[#F3D590]/60 bg-[#3B210E]/70 text-[#F3D590]'
                        }`}
                      >
                        {isImpostor ? (
                          <ShieldAlert className="h-6 w-6" />
                        ) : (
                          <Shield className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <div className="font-mono text-[10px] font-bold tracking-[0.22em] text-white/80 uppercase">
                          ROL CONFIDENCIAL ASIGNADO
                        </div>
                        <h3 className="font-display text-2xl font-extrabold tracking-wide uppercase">
                          {isImpostor ? 'ERES IMPOSTOR' : 'ERES DETECTIVE'}
                        </h3>
                      </div>
                    </div>

                    <div
                      className={`-rotate-3 rounded border-2 px-3 py-1 font-mono text-[11px] font-extrabold tracking-widest uppercase ${
                        isImpostor
                          ? 'border-rose-300 text-rose-100'
                          : 'border-[#F3D590] text-[#F3D590]'
                      }`}
                    >
                      {isImpostor ? 'INFILTRADO' : 'AUTORIZADO'}
                    </div>
                  </motion.div>

                  {/* Case Briefing + Evidence Photo */}
                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: prefersReducedMotion ? 0 : 0.85,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="mt-4 space-y-3"
                  >
                    <div
                      className={`rounded-xl border p-3.5 ${
                        isImpostor
                          ? 'border-rose-800/50 bg-[#1B0C0E] text-rose-50'
                          : 'border-[#D9C5A9] bg-[#F4E9D6] text-[#2C1B10]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase">
                        <span className={isImpostor ? 'text-amber-200' : 'text-[#7C4D2B]'}>
                          {isImpostor
                            ? 'Informe limitado del caso (~10%)'
                            : 'Explicación completa del caso'}
                        </span>
                        <span className="font-mono opacity-80">{caseCode}</span>
                      </div>
                      <h4 className="mt-1 font-display text-sm font-bold">{caseTitle}</h4>
                      <p className="mt-1 text-xs leading-relaxed opacity-90">{caseBriefing}</p>
                    </div>

                    <div
                      className={`flex flex-col items-center gap-3 rounded-xl border p-3 sm:flex-row ${
                        isImpostor
                          ? 'border-rose-800/40 bg-black/25'
                          : 'border-[#D9C5A9] bg-white/75'
                      }`}
                    >
                      <EvidenceArtwork itemId={item.id} className="h-24 w-24 shrink-0" />
                      <div className="text-center sm:text-left">
                        <p
                          className={`text-[11px] font-bold tracking-wider uppercase ${
                            isImpostor ? 'text-rose-200' : 'text-[#8B5A2B]'
                          }`}
                        >
                          {isImpostor ? 'Tu foto falsa (Impostor)' : 'Tu foto de evidencia'}
                        </p>
                        <h4 className="font-display text-base font-bold">{item.name}</h4>
                        <p className="mt-0.5 text-xs leading-relaxed opacity-85">
                          {item.subtleHint}
                        </p>
                      </div>
                    </div>

                    {isImpostor ? (
                      <div className="rounded-xl border border-rose-500/50 bg-rose-950/60 p-3 text-center">
                        <p className="font-display text-xs font-bold tracking-wider text-amber-200 uppercase">
                          Sin pistas asignadas
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-rose-100">
                          Como eres el impostor, no recibes pistas del caso. Escucha a los detectives e improvisa con tu foto.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-bold tracking-wider text-[#7C4D2B] uppercase">
                          Tus pistas privadas (solo tú las ves):
                        </p>
                        <div className="space-y-1.5">
                          {privateClues.map((clue) => (
                            <div
                              key={clue.id}
                              className="rounded-xl border border-[#D4BC9C] bg-white/85 px-3 py-2 text-[#2C1B10]"
                            >
                              <div className="font-display text-[11px] font-bold text-[#6E4423] uppercase">
                                {clue.title}
                              </div>
                              <p className="text-xs leading-snug text-[#2C1B10]">{clue.detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(primaryActionLabel || secondaryActionLabel) && (
                      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                        {secondaryActionLabel && onSecondaryAction && (
                          <button
                            type="button"
                            onClick={onSecondaryAction}
                            className={`min-h-[46px] rounded-xl border px-4 text-xs font-bold uppercase whitespace-nowrap ${
                              isImpostor
                                ? 'border-rose-400/40 text-rose-100 hover:bg-rose-950/60'
                                : 'border-[#C8AD88] text-[#5C3A21] hover:bg-[#EFE2CE]'
                            }`}
                          >
                            {secondaryActionLabel}
                          </button>
                        )}
                        {primaryActionLabel && onPrimaryAction && (
                          <motion.button
                            type="button"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onPrimaryAction}
                            className={`min-h-[48px] flex-1 rounded-xl px-5 font-display text-xs font-bold tracking-wider uppercase shadow-md whitespace-nowrap sm:flex-none ${
                              isImpostor
                                ? 'bg-rose-600 text-white hover:bg-rose-500'
                                : 'bg-[#7C4D2B] text-white hover:bg-[#643C1F]'
                            }`}
                          >
                            {primaryActionLabel}
                          </motion.button>
                        )}
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>

              {/* 3D Manila Front Cover Overlay That Swings Open */}
              {!prefersReducedMotion && (
                <motion.div
                  initial={{ rotateY: 0, opacity: 1 }}
                  animate={{ rotateY: -156, opacity: 0 }}
                  transition={{
                    rotateY: { duration: 0.72, delay: 0.22, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.24, delay: 0.72, ease: 'easeOut' },
                  }}
                  style={{
                    transformOrigin: 'left center',
                    backfaceVisibility: 'hidden',
                  }}
                  className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl rounded-tl-none border-2 border-[#9B7748] bg-gradient-to-br from-[#E6CE9E] via-[#D8B986] to-[#C29B63] p-6 shadow-2xl"
                  aria-hidden="true"
                >
                  <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-[#8D6839]/35 to-transparent" />
                  <motion.div
                    initial={{ scale: 1, rotate: 0, opacity: 1 }}
                    animate={{ scale: 1.15, rotate: -28, opacity: 0 }}
                    transition={{ duration: 0.26, delay: 0.08 }}
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#7C4D2B] bg-gradient-to-br from-[#F3D590] to-[#B6783C] shadow-md"
                  >
                    <FileLock2 className="h-5 w-5 text-[#3B210E]" />
                  </motion.div>
                  <div className="-rotate-6 rounded-lg border-[3px] border-red-800/85 bg-red-700/10 px-6 py-2.5 text-center">
                    <div className="font-display text-2xl font-extrabold tracking-[0.2em] text-red-800 uppercase sm:text-3xl">
                      TOP SECRET
                    </div>
                    <div className="font-mono text-[11px] font-bold tracking-[0.28em] text-red-900/90 uppercase">
                      {caseCode} · CONFIDENCIAL
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (variant === 'modal') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.24 }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#140B06]/85 p-3 backdrop-blur-sm sm:p-6"
      >
        <div className="my-auto w-full max-w-xl">{folderStageContent}</div>
      </motion.div>
    );
  }

  return folderStageContent;
};
