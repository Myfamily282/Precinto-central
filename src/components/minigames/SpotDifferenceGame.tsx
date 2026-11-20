import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, HelpCircle, RotateCcw, Timer, Trophy } from 'lucide-react';
import { SPOT_DIFFERENCE_CASES, type SpotDifferenceCase } from '../../data/spotDifferenceCases.ts';
import { soundFX } from '../../utils/sound.ts';
import { CrimeSceneIllustration } from '../CrimeSceneIllustration.tsx';

interface SpotDifferenceGameProps {
  forcedCaseId?: string | null;
  isDuel?: boolean;
  onProgress?: (found: number, total: number, finished: boolean) => void;
  onExit?: () => void;
}

export const SpotDifferenceGame: React.FC<SpotDifferenceGameProps> = ({
  forcedCaseId = null,
  isDuel = false,
  onProgress,
  onExit,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    forcedCaseId ?? SPOT_DIFFERENCE_CASES[0].id
  );
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintSpotId, setHintSpotId] = useState<string | null>(null);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [mobileView, setMobileView] = useState<'stacked' | 'toggle'>('stacked');
  const [activeLayer, setActiveLayer] = useState<'altered' | 'original'>('altered');
  const [missMarker, setMissMarker] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (forcedCaseId) {
      setSelectedCaseId(forcedCaseId);
    }
  }, [forcedCaseId]);

  const activeCase: SpotDifferenceCase = useMemo(
    () =>
      SPOT_DIFFERENCE_CASES.find((c) => c.id === selectedCaseId) ?? SPOT_DIFFERENCE_CASES[0],
    [selectedCaseId]
  );

  const isCompleted = foundIds.length === activeCase.differences.length;

  useEffect(() => {
    setFoundIds([]);
    setMistakes(0);
    setHintsUsed(0);
    setHintSpotId(null);
    setLastFeedback(null);
    setElapsedSec(0);
  }, [activeCase.id]);

  useEffect(() => {
    if (isCompleted) return;
    const id = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isCompleted, activeCase.id]);

  const resetCase = () => {
    soundFX.tabSwitch();
    setFoundIds([]);
    setMistakes(0);
    setHintsUsed(0);
    setHintSpotId(null);
    setLastFeedback(null);
    setElapsedSec(0);
    onProgress?.(0, activeCase.differences.length, false);
  };

  const handleTapScene = (xPct: number, yPct: number) => {
    if (isCompleted) return;
    const hit = activeCase.differences.find((d) => {
      if (foundIds.includes(d.id)) return false;
      const dist = Math.hypot(xPct - d.x, yPct - d.y);
      return dist <= d.radius;
    });

    if (hit) {
      const nextFound = [...foundIds, hit.id];
      setFoundIds(nextFound);
      setHintSpotId(null);
      setLastFeedback(`Pista detectada: ${hit.label}`);
      const finished = nextFound.length === activeCase.differences.length;
      if (finished) {
        soundFX.revealSuccess();
      } else {
        soundFX.spotFound();
      }
      onProgress?.(nextFound.length, activeCase.differences.length, finished);
    } else {
      soundFX.errorThud();
      setMistakes((m) => m + 1);
      setLastFeedback('Sin anomalías en ese punto.');
      setMissMarker({ x: xPct, y: yPct });
      window.setTimeout(() => setMissMarker(null), 500);
    }
  };

  const handleUseHint = () => {
    if (isCompleted || hintsUsed >= 2) return;
    const remaining = activeCase.differences.find((d) => !foundIds.includes(d.id));
    if (!remaining) return;
    soundFX.pinTack();
    setHintSpotId(remaining.id);
    setHintsUsed((h) => h + 1);
    setLastFeedback(`Pista marcada en escena: ${remaining.label}`);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Case selector & compact stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D9C5A9] bg-[#FBF6EE] p-4 dark:border-[#4A3222] dark:bg-[#22160F]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#7A5E46] dark:text-[#C8B297]">
            <span>Escena del Crimen</span>
            <span aria-hidden="true">·</span>
            <span>{activeCase.difficulty}</span>
          </div>
          <h2 className="font-display text-lg font-bold text-[#2E1C10] dark:text-[#FBF3E6]">
            {activeCase.title}
          </h2>
          <p className="text-xs text-[#7A5E46] dark:text-[#C8B297]">{activeCase.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold tabular-nums">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {foundIds.length}/{activeCase.differences.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[#5C3A21] dark:text-[#EAD8BE]">
            <Timer className="h-4 w-4" />
            <span className="font-mono">{formatTime(elapsedSec)}</span>
          </div>
          <div className="text-xs text-rose-600 dark:text-rose-400">
            Fallos: <span className="font-mono">{mistakes}</span>
          </div>
        </div>
      </div>

      {/* Case switcher (solo mode) + Mobile layout switch */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {!isDuel && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#EFE2CE] p-1 dark:bg-[#19100B]">
            {SPOT_DIFFERENCE_CASES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  soundFX.tabSwitch();
                  setSelectedCaseId(c.id);
                }}
                className={`min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  c.id === activeCase.id
                    ? 'bg-[#7C4D2B] text-white shadow-sm dark:bg-[#8B5A2B]'
                    : 'text-[#6E4E37] hover:text-[#2E1C10] dark:text-[#C8B297] dark:hover:text-[#FBF3E6]'
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setMobileView(mobileView === 'stacked' ? 'toggle' : 'stacked')}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#D4BC9C] bg-[#FBF6EE] px-3 py-1.5 text-xs font-semibold text-[#3D2414] dark:border-[#593C28] dark:bg-[#22160F] dark:text-[#FBF3E6]"
          >
            <Eye className="h-4 w-4 text-[#8B5A2B] dark:text-[#F3D590]" />
            {mobileView === 'stacked' ? 'Vista alternada' : 'Ver ambas juntas'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUseHint}
            disabled={isCompleted || hintsUsed >= 2}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100 disabled:opacity-45 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
          >
            <HelpCircle className="h-4 w-4" />
            Pista ({2 - hintsUsed})
          </button>
          {!isDuel && (
            <button
              type="button"
              onClick={resetCase}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#D4BC9C] bg-[#FBF6EE] px-3 py-1.5 text-xs font-semibold text-[#3D2414] hover:bg-[#EFE2CE] dark:border-[#593C28] dark:bg-[#22160F] dark:text-[#FBF3E6]"
            >
              <RotateCcw className="h-4 w-4" />
              Reiniciar
            </button>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {lastFeedback && (
        <div
          className={`rounded-xl border px-3.5 py-2 text-xs font-semibold ${
            lastFeedback.startsWith('Pista')
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
          }`}
        >
          {lastFeedback}
        </div>
      )}

      {/* Mobile Toggle Switcher if toggle mode selected */}
      {mobileView === 'toggle' && (
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#EFE2CE] p-1 md:hidden dark:bg-[#19100B]">
          <button
            type="button"
            onClick={() => setActiveLayer('original')}
            className={`min-h-[44px] rounded-lg text-xs font-semibold transition-colors ${
              activeLayer === 'original'
                ? 'bg-[#7C4D2B] text-white shadow-sm dark:bg-[#8B5A2B]'
                : 'text-[#6E4E37] dark:text-[#C8B297]'
            }`}
          >
            Archivo Original
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('altered')}
            className={`min-h-[44px] rounded-lg text-xs font-semibold transition-colors ${
              activeLayer === 'altered'
                ? 'bg-[#7C4D2B] text-white shadow-sm dark:bg-[#8B5A2B]'
                : 'text-[#6E4E37] dark:text-[#C8B297]'
            }`}
          >
            Escena Alterada (Toca aquí)
          </button>
        </div>
      )}

      {/* Crime Scenes Comparison Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(mobileView === 'stacked' || activeLayer === 'original') && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#7A5E46] dark:text-[#C8B297]">
              <span>Archivo Original (Antes)</span>
              <span className="text-[#9A7F64]">Referencia</span>
            </div>
            <div className="relative">
              <CrimeSceneIllustration
                caseId={activeCase.id}
                variant="original"
                foundIds={foundIds}
                differences={activeCase.differences}
                hintSpotId={hintSpotId}
                onTapScene={handleTapScene}
              />
            </div>
          </div>
        )}

        {(mobileView === 'stacked' || activeLayer === 'altered') && (
          <div className={`space-y-1.5 ${mobileView === 'toggle' && activeLayer === 'original' ? 'hidden md:block' : ''}`}>
            <div className="flex items-center justify-between text-xs font-semibold text-[#7A5E46] dark:text-[#C8B297]">
              <span>Escena del Crimen (Después)</span>
              <span className="text-[#8B5A2B] dark:text-[#F3D590]">Toca las 6 diferencias</span>
            </div>
            <div className="relative">
              <CrimeSceneIllustration
                caseId={activeCase.id}
                variant="altered"
                foundIds={foundIds}
                differences={activeCase.differences}
                hintSpotId={hintSpotId}
                onTapScene={handleTapScene}
              />
              {missMarker && (
                <div
                  style={{ left: `${missMarker.x}%`, top: `${missMarker.y}%` }}
                  className="pointer-events-none absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-rose-500 bg-rose-500/20"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Precinct Corkboard of discovered clues */}
      <div className="rounded-2xl border-2 border-[#59412F] bg-[#241912] p-3 text-[#F5ECD8] shadow-lg">
        <div className="mb-2.5 rounded-lg border border-[#6E5038] bg-[#1D140F] py-1.5 text-center">
          <p className="font-display text-xs font-bold tracking-wider text-[#F3D590] uppercase">
            TABLERO DE PISTAS — ANOMALÍAS DETECTADAS ({foundIds.length}/{activeCase.differences.length})
          </p>
        </div>
        <div
          className="grid grid-cols-1 gap-2.5 rounded-lg border border-[#6B4B32] p-3 sm:grid-cols-2 lg:grid-cols-3"
          style={{
            backgroundColor: '#A97E52',
            backgroundImage:
              'radial-gradient(rgba(54,32,14,0.18) 1px, transparent 1px), radial-gradient(rgba(255,235,205,0.15) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
            backgroundPosition: '0 0, 7px 7px',
          }}
        >
          {activeCase.differences.map((d, idx) => {
            const found = foundIds.includes(d.id);
            return (
              <div
                key={d.id}
                className={`relative rounded-sm border p-2.5 pt-3.5 text-xs shadow transition-colors ${
                  found
                    ? 'border-[#C6B393] bg-[#EFE6D5] font-semibold text-stone-900'
                    : 'border-dashed border-[#5B3D24] bg-[#EFE6D5]/55 text-stone-700'
                }`}
              >
                <span
                  className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border border-white/70"
                  style={{ backgroundColor: found ? '#059669' : '#64748B' }}
                  aria-hidden="true"
                />
                <span className="font-mono font-bold tabular-nums text-[#6E4423]">
                  PISTA 0{idx + 1}:
                </span>{' '}
                <span>{found ? d.label : 'Por investigar en la escena...'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-center sm:flex-row sm:text-left dark:border-emerald-800 dark:bg-emerald-950/50">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-emerald-950 dark:text-emerald-100">
                ¡Escena despejada en {formatTime(elapsedSec)}!
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Encontraste las {activeCase.differences.length} diferencias con {mistakes} fallos.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isDuel && (
              <button
                type="button"
                onClick={resetCase}
                className="min-h-[44px] rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Jugar de nuevo
              </button>
            )}
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="min-h-[44px] rounded-xl border border-emerald-400 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 dark:bg-slate-900 dark:text-emerald-200"
              >
                Volver
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
