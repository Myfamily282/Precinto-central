import React, { useState } from 'react';
import { BookOpen, Eraser, Gamepad2, Search, Settings, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { soundFX } from '../utils/sound.ts';

interface ChalkboardMenuProps {
  onSelectDetectives: () => void;
  onSelectSettings: () => void;
  onSelectMinigames: () => void;
  onSelectHowToPlay?: () => void;
}

const CHALK_MOTES = [
  { id: 1, x: '12%', y: '22%', size: 4, delay: 0, dur: 5.2 },
  { id: 2, x: '28%', y: '70%', size: 3, delay: 0.8, dur: 6.1 },
  { id: 3, x: '52%', y: '18%', size: 5, delay: 1.4, dur: 5.6 },
  { id: 4, x: '74%', y: '62%', size: 3, delay: 0.4, dur: 6.5 },
  { id: 5, x: '86%', y: '28%', size: 4, delay: 1.9, dur: 5.8 },
  { id: 6, x: '40%', y: '84%', size: 3, delay: 1.1, dur: 6.0 },
];

export const ChalkboardMenu: React.FC<ChalkboardMenuProps> = ({
  onSelectDetectives,
  onSelectSettings,
  onSelectMinigames,
  onSelectHowToPlay,
}) => {
  const [wipeCount, setWipeCount] = useState(0);
  const [wiping, setWiping] = useState(false);

  const handleWipeBoard = () => {
    soundFX.chalkErase();
    setWiping(true);
    setWipeCount((c) => c + 1);
    window.setTimeout(() => setWiping(false), 620);
  };

  return (
    <div className="mx-auto max-w-4xl py-2 sm:py-4">
      {/* Wooden Frame around the Chalkboard */}
      <div className="relative rounded-3xl border-[10px] border-[#5B3E28] bg-[#3E2818] p-1.5 shadow-[0_22px_50px_rgba(15,23,42,0.35)] sm:border-[14px]">
        {/* Brass Corner Brackets */}
        <span className="pointer-events-none absolute -top-1.5 -left-1.5 h-5 w-5 rounded-tl-xl border-t-4 border-l-4 border-amber-400/75" />
        <span className="pointer-events-none absolute -top-1.5 -right-1.5 h-5 w-5 rounded-tr-xl border-t-4 border-r-4 border-amber-400/75" />
        <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 h-5 w-5 rounded-bl-xl border-b-4 border-l-4 border-amber-400/75" />
        <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-br-xl border-b-4 border-r-4 border-amber-400/75" />

        {/* Slate Chalkboard Surface with Smudged / Imperfectly Erased Chalk */}
        <div
          className="relative overflow-hidden rounded-2xl border-2 border-[#2A3731] px-5 py-7 sm:px-10 sm:py-10"
          style={{
            backgroundColor: '#19241F',
            backgroundImage: `
              radial-gradient(ellipse 58% 36% at 24% 28%, rgba(241, 245, 249, 0.13) 0%, rgba(226, 232, 240, 0.04) 48%, transparent 78%),
              radial-gradient(ellipse 46% 32% at 76% 42%, rgba(248, 250, 252, 0.12) 0%, rgba(203, 213, 225, 0.05) 52%, transparent 80%),
              radial-gradient(ellipse 62% 28% at 48% 78%, rgba(226, 232, 240, 0.11) 0%, rgba(148, 163, 184, 0.04) 55%, transparent 82%),
              linear-gradient(125deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.09) 26%, rgba(255,255,255,0.01) 52%, rgba(255,255,255,0.08) 76%, rgba(255,255,255,0.02) 100%)
            `,
          }}
        >
          {/* SVG Eraser Swipes & Ghosted Half-Erased Detective Scribbles */}
          <svg
            key={wipeCount}
            viewBox="0 0 900 540"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <filter id="chalk-smudge" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="14" />
              </filter>
              <filter id="chalk-dust-light" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>

            {/* Cloudy uneven eraser streaks left behind after erasing */}
            <g filter="url(#chalk-smudge)" opacity={wipeCount % 2 === 0 ? 0.34 : 0.28}>
              <path
                d="M40 95 C 180 55, 310 155, 480 95 C 620 45, 760 135, 865 85"
                stroke="#E2E8F0"
                strokeWidth="44"
                strokeLinecap="round"
                fill="none"
                strokeOpacity="0.32"
              />
              <path
                d="M75 245 C 240 290, 410 190, 580 250 C 700 288, 795 220, 860 255"
                stroke="#F1F5F9"
                strokeWidth="52"
                strokeLinecap="round"
                fill="none"
                strokeOpacity="0.26"
              />
              <path
                d="M55 415 C 210 370, 390 465, 595 410 C 720 375, 800 440, 855 405"
                stroke="#E2E8F0"
                strokeWidth="48"
                strokeLinecap="round"
                fill="none"
                strokeOpacity="0.28"
              />
              <ellipse cx="215" cy="175" rx="135" ry="42" fill="#F8FAFC" fillOpacity="0.16" />
              <ellipse cx="670" cy="340" rx="150" ry="48" fill="#F1F5F9" fillOpacity="0.14" />
            </g>

            {/* Ghosted half-erased previous notes & sketches */}
            <g
              filter="url(#chalk-dust-light)"
              stroke="#E2E8F0"
              fill="none"
              strokeLinecap="round"
              opacity="0.18"
            >
              <text
                x="66"
                y="88"
                fill="#E2E8F0"
                fontSize="24"
                fontWeight="700"
                transform="rotate(-5 66 88)"
              >
                ROBO #04
              </text>
              <line x1="58" y1="82" x2="188" y2="74" strokeWidth="4" strokeOpacity="0.7" />
              <circle cx="775" cy="108" r="24" strokeWidth="3" strokeDasharray="6 5" />
              <line x1="792" y1="125" x2="824" y2="155" strokeWidth="4" />
              <text
                x="638"
                y="470"
                fill="#E2E8F0"
                fontSize="20"
                fontWeight="700"
                transform="rotate(4 638 470)"
              >
                ¿IMPOSTOR?
              </text>
              <path d="M120 458 Q 210 432 295 462" strokeWidth="2.5" strokeDasharray="4 6" />
              <path d="M430 48 L452 72 M452 48 L430 72" strokeWidth="3" />
            </g>
          </svg>

          {/* Animated Felt Eraser Sweep Effect when user wipes board */}
          {wiping && (
            <motion.div
              initial={{ x: '-20%', opacity: 0.55 }}
              animate={{ x: '115%', opacity: 0 }}
              transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute inset-y-0 left-0 z-20 w-44 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-md"
            />
          )}

          {/* Floating Chalk Dust Motes */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {CHALK_MOTES.map((m) => (
              <motion.span
                key={m.id}
                style={{ left: m.x, top: m.y, width: m.size, height: m.size }}
                animate={{
                  y: [-8, 10, -8],
                  opacity: [0.12, 0.38, 0.12],
                }}
                transition={{
                  duration: m.dur,
                  delay: m.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute rounded-full bg-slate-100 blur-[0.5px]"
              />
            ))}
          </div>

          {/* Chalkboard Header */}
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1 text-[11px] font-bold tracking-[0.2em] text-amber-200/90 uppercase"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Pizarra del Precinto
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.42, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 font-display text-3xl font-extrabold tracking-wide text-slate-100 uppercase sm:text-4xl"
              style={{
                textShadow: '0 0 14px rgba(248,250,252,0.22), 1px 2px 0 rgba(0,0,0,0.45)',
              }}
            >
              PRECINTO CENTRAL
            </motion.h1>

            {/* Hand-drawn chalk underline */}
            <svg viewBox="0 0 320 14" className="mx-auto mt-1.5 h-3 w-56 opacity-75" aria-hidden="true">
              <motion.path
                d="M8 8 Q 90 3 165 8 T 312 6"
                fill="none"
                stroke="#FDE68A"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
          </div>

          {/* Three Chalk Menu Options: DETECTIVES | AJUSTES | MINIJUEGOS */}
          <div className="relative z-10 mx-auto mt-7 flex max-w-xl flex-col gap-4">
            {/* 1. DETECTIVES */}
            <motion.button
              type="button"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.38, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                soundFX.chalkWrite();
                onSelectDetectives();
              }}
              className="group relative flex min-h-[76px] w-full items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-[#F5E6C8]/65 bg-[#F5E6C8]/10 px-5 py-4 text-left transition-colors hover:border-[#FFF8EB] hover:bg-[#F5E6C8]/18"
            >
              <div className="flex items-center gap-4 min-w-0">
                <motion.div
                  animate={{ rotate: [0, -6, 6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#F5E6C8]/60 bg-[#F5E6C8]/15 text-[#FFF8EB]"
                >
                  <Search className="h-6 w-6" />
                </motion.div>
                <div className="min-w-0">
                  <div
                    className="font-display text-2xl font-extrabold tracking-wider text-[#FFF8EB] uppercase sm:text-3xl"
                    style={{ textShadow: '0 0 10px rgba(255,248,235,0.32)' }}
                  >
                    DETECTIVES
                  </div>
                  <p className="text-xs font-medium text-[#F5E6C8]/85">
                    El Impostor de Evidencia · Online y Presencial
                  </p>
                </div>
              </div>
              <ShieldCheck className="h-6 w-6 shrink-0 text-[#F5E6C8]/85 transition-transform group-hover:translate-x-1" />
            </motion.button>

            {/* 2. AJUSTES */}
            <motion.button
              type="button"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.38, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                soundFX.chalkWrite();
                onSelectSettings();
              }}
              className="group relative flex min-h-[76px] w-full items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-amber-200/55 bg-amber-300/10 px-5 py-4 text-left transition-colors hover:border-amber-200 hover:bg-amber-300/18"
            >
              <div className="flex items-center gap-4 min-w-0">
                <motion.div
                  animate={{ rotate: [0, 35, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-amber-200/60 bg-amber-300/15 text-amber-100"
                >
                  <Settings className="h-6 w-6" />
                </motion.div>
                <div className="min-w-0">
                  <div
                    className="font-display text-2xl font-extrabold tracking-wider text-amber-50 uppercase sm:text-3xl"
                    style={{ textShadow: '0 0 10px rgba(253,230,138,0.3)' }}
                  >
                    AJUSTES
                  </div>
                  <p className="text-xs font-medium text-amber-100/85">
                    Sonido, modo claro/oscuro, animación y APK Android
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-amber-200/80 transition-transform group-hover:translate-x-1">
                &gt;&gt;
              </span>
            </motion.button>

            {/* 3. MINIJUEGOS */}
            <motion.button
              type="button"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.38, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                soundFX.chalkWrite();
                onSelectMinigames();
              }}
              className="group relative flex min-h-[76px] w-full items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-emerald-200/55 bg-emerald-400/10 px-5 py-4 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-400/18"
            >
              <div className="flex items-center gap-4 min-w-0">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-emerald-200/60 bg-emerald-300/15 text-emerald-100"
                >
                  <Gamepad2 className="h-6 w-6" />
                </motion.div>
                <div className="min-w-0">
                  <div
                    className="font-display text-2xl font-extrabold tracking-wider text-emerald-50 uppercase sm:text-3xl"
                    style={{ textShadow: '0 0 10px rgba(167,243,208,0.3)' }}
                  >
                    MINIJUEGOS
                  </div>
                  <p className="text-xs font-medium text-emerald-100/85">
                    Diferencias en la escena, caja fuerte y memoria forense
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-200/80 transition-transform group-hover:translate-x-1">
                &gt;&gt;
              </span>
            </motion.button>

            {onSelectHowToPlay && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  soundFX.chalkWrite();
                  onSelectHowToPlay();
                }}
                className="mx-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-dashed border-[#F5E6C8]/45 bg-[#F5E6C8]/8 px-5 py-2 text-xs font-bold tracking-wider text-[#F5E6C8] uppercase transition-colors hover:border-[#FFF8EB] hover:bg-[#F5E6C8]/16"
              >
                <BookOpen className="h-4 w-4 text-amber-200" />
                ¿Cómo se juega?
              </motion.button>
            )}
          </div>
        </div>

        {/* Bottom Chalk Ledge with Chalk Sticks & Interactive Felt Eraser */}
        <div className="mt-1.5 flex items-center justify-between rounded-b-xl bg-[#4A311E] px-4 py-2">
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="h-2 w-8 rotate-[-4deg] rounded-full bg-slate-100 shadow-sm" />
            <span className="h-2 w-6 rotate-[6deg] rounded-full bg-amber-200 shadow-sm" />
            <span className="h-2 w-7 rotate-[-2deg] rounded-full bg-rose-200 shadow-sm" />
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.94, x: -6 }}
            onClick={handleWipeBoard}
            className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-amber-200/25 bg-[#2A1C12] px-3 py-1 text-[11px] font-semibold text-amber-100/90 shadow-inner hover:bg-[#362417]"
          >
            <Eraser className="h-3.5 w-3.5 text-amber-200" />
            Pasar borrador
          </motion.button>
        </div>
      </div>
    </div>
  );
};
