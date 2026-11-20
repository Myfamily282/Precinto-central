import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface SplashEntranceProps {
  onComplete: () => void;
}

type SplashStage = 'badge' | 'expand' | 'shift' | 'reveal' | 'fadeText' | 'exit';

export const SplashEntrance: React.FC<SplashEntranceProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<SplashStage>('badge');
  const restWordRef = useRef<HTMLSpanElement | null>(null);
  const [centerOffset, setCenterOffset] = useState(112);

  useLayoutEffect(() => {
    if (restWordRef.current) {
      setCenterOffset(restWordRef.current.offsetWidth / 2);
    }
  }, []);

  const finishImmediately = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage('expand'), 900),
      window.setTimeout(() => setStage('shift'), 2150),
      window.setTimeout(() => setStage('reveal'), 2500),
      window.setTimeout(() => setStage('fadeText'), 3850),
      window.setTimeout(() => setStage('exit'), 4100),
      window.setTimeout(() => onComplete(), 5250),
    ];

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [onComplete]);

  const isExpanded =
    stage === 'expand' ||
    stage === 'shift' ||
    stage === 'reveal' ||
    stage === 'fadeText' ||
    stage === 'exit';
  const isShifted =
    stage === 'shift' || stage === 'reveal' || stage === 'fadeText' || stage === 'exit';
  const isRevealed = stage === 'reveal' || stage === 'fadeText' || stage === 'exit';
  const isTextHidden = stage === 'fadeText' || stage === 'exit';
  const isExiting = stage === 'exit';

  return (
    <motion.div
      key="precinto-splash-root"
      onClick={finishImmediately}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 cursor-pointer overflow-hidden select-none"
      aria-label="Animación de bienvenida de Precinto Central"
    >
      {/* Clean warm parchment / dark walnut backdrop */}
      <motion.div
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.15 }}
        className="pointer-events-none absolute inset-0 bg-[#F6EFE4] dark:bg-[#140D09]"
      />

      {/* Descending polished wood curtain with concave crescent wave */}
      <motion.div
        initial={{ y: '0%' }}
        animate={{ y: isExiting ? '118%' : '0%' }}
        transition={{
          duration: 0.92,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ willChange: 'transform' }}
        className="relative flex h-full w-full items-center justify-center"
      >
        {/* Bottom-crescent wave curve matching the polished wood gradient */}
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className={`pointer-events-none absolute -top-[116px] left-0 h-[120px] w-full ${
            isExpanded ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="splashWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3E2414" />
              <stop offset="50%" stopColor="#7A4B2A" />
              <stop offset="100%" stopColor="#B87B3E" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 Q720,128 1440,0 L1440,120 L0,120 Z"
            fill="url(#splashWaveGrad)"
          />
        </svg>

        {/* GPU-only scaling wood badge -> full warm walnut-oak canvas */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: isExpanded ? 34 : 1,
              opacity: 1,
            }}
            transition={{
              scale: {
                duration: isExpanded ? 0.62 : 0.38,
                ease: [0.16, 1, 0.3, 1],
              },
              opacity: { duration: 0.28 },
            }}
            style={{ willChange: 'transform, opacity' }}
            className="flex h-28 w-28 items-center justify-center"
          >
            <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
              <defs>
                <linearGradient id="splashBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3E2414" />
                  <stop offset="50%" stopColor="#7A4B2A" />
                  <stop offset="100%" stopColor="#B87B3E" />
                </linearGradient>
              </defs>
              <path
                d="M22,6 Q60,12 98,6 A16,16 0 0,1 114,22 L114,98 A16,16 0 0,1 98,114 Q60,108 22,114 A16,16 0 0,1 6,98 L6,22 A16,16 0 0,1 22,6 Z"
                fill="url(#splashBadgeGrad)"
              />
            </svg>
          </motion.div>

          {/* Animated warm golden light spotlight over the wood canvas */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isExiting ? 0 : [0.22, 0.45, 0.22],
                scale: [0.95, 1.15, 0.95],
              }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-amber-300/25 blur-3xl"
            />
          )}
        </div>

        {/* Crisp white monogram -> slides left -> reveals full "Precinto Central" */}
        <motion.div
          animate={{
            opacity: isTextHidden ? 0 : 1,
            scale: isTextHidden ? 0.97 : 1,
          }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: 'transform, opacity' }}
          className="relative z-10 flex items-center justify-center px-6"
        >
          <motion.div
            initial={{ x: centerOffset }}
            animate={{ x: isShifted ? 0 : centerOffset }}
            transition={{
              duration: 0.42,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ willChange: 'transform' }}
            className="inline-flex items-baseline whitespace-nowrap font-display text-3xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-4xl"
          >
            <span>P</span>
            <motion.span
              ref={restWordRef}
              initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0, x: -8 }}
              animate={{
                clipPath: isRevealed ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
                opacity: isRevealed ? 1 : 0,
                x: isRevealed ? 0 : -8,
              }}
              transition={{
                duration: 0.46,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ willChange: 'clip-path, transform, opacity' }}
              className="inline-block"
            >
              recinto Central
            </motion.span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
