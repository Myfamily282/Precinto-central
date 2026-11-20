import React, { useEffect, useMemo, useState } from 'react';
import { Brain, RotateCcw, Timer, Trophy } from 'lucide-react';
import { EVIDENCE_PAIRS } from '../../data/evidenceCatalog.ts';
import type { EvidenceItem } from '../../shared/types.ts';
import { soundFX } from '../../utils/sound.ts';
import { EvidenceArtwork } from '../EvidenceArtwork.tsx';

function buildMemoryRound() {
  const allItems: EvidenceItem[] = EVIDENCE_PAIRS.flatMap((p) => [p.detectiveItem, p.impostorItem]);
  const shuffled = [...allItems].sort(() => Math.random() - 0.5);
  const tray = shuffled.slice(0, 6);
  const missingItem = tray[Math.floor(Math.random() * tray.length)];
  const remaining = tray.filter((item) => item.id !== missingItem.id);
  const decoys = shuffled.slice(6, 9);
  const options = [...decoys, missingItem].sort(() => Math.random() - 0.5);

  return { tray, remaining, missingItem, options };
}

export const ForensicMemoryGame: React.FC = () => {
  const [roundNum, setRoundNum] = useState(1);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'feedback' | 'done'>('memorize');
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [roundData, setRoundData] = useState(() => buildMemoryRound());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const maxRounds = 5;

  useEffect(() => {
    if (phase !== 'memorize') return;
    if (secondsLeft <= 0) {
      soundFX.cardFlip();
      setPhase('recall');
      return;
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [phase, secondsLeft]);

  const startNewGame = () => {
    soundFX.tabSwitch();
    setRoundNum(1);
    setScore(0);
    setSelectedId(null);
    setRoundData(buildMemoryRound());
    setSecondsLeft(5);
    setPhase('memorize');
  };

  const handleAnswer = (item: EvidenceItem) => {
    if (phase !== 'recall') return;
    setSelectedId(item.id);
    if (item.id === roundData.missingItem.id) {
      soundFX.spotFound();
      setScore((s) => s + 100);
    } else {
      soundFX.errorThud();
    }
    setPhase('feedback');
  };

  const handleNext = () => {
    soundFX.tabSwitch();
    if (roundNum >= maxRounds) {
      setPhase('done');
      return;
    }
    setRoundNum((r) => r + 1);
    setSelectedId(null);
    setRoundData(buildMemoryRound());
    setSecondsLeft(5);
    setPhase('memorize');
  };

  const isCorrect = useMemo(
    () => selectedId === roundData.missingItem.id,
    [selectedId, roundData.missingItem.id]
  );

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D9C5A9] bg-[#FBF6EE] p-4 dark:border-[#4A3222] dark:bg-[#22160F]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFE2CE] text-[#7C4D2B] dark:bg-[#3A2416] dark:text-[#F3D590]">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-[#2E1C10] dark:text-[#FBF3E6]">
              Memoria Forense
            </h2>
            <p className="text-xs text-[#7A5E46] dark:text-[#C8B297]">
              Ronda {roundNum}/{maxRounds} · Puntaje: <span className="font-mono font-bold tabular-nums">{score}</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={startNewGame}
          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#D4BC9C] bg-[#F5ECE0] px-3 py-1.5 text-xs font-semibold text-[#3D2414] hover:bg-[#EAD8BE] dark:border-[#593C28] dark:bg-[#2B1C12] dark:text-[#F5ECD8]"
        >
          <RotateCcw className="h-4 w-4" />
          Reiniciar
        </button>
      </div>

      {phase === 'memorize' && (
        <div className="space-y-4 rounded-2xl border border-[#D9C5A9] bg-[#FBF6EE] p-5 dark:border-[#4A3222] dark:bg-[#22160F]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#3D2414] dark:text-[#F5ECD8]">
              Memoriza los 6 objetos en la bandeja de evidencia
            </p>
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-[#8B5A2B] tabular-nums dark:text-[#F3D590]">
              <Timer className="h-4 w-4" />
              {secondsLeft}s
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {roundData.tray.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center rounded-xl border border-[#DFCBB0] bg-[#F5ECE0] p-3 dark:border-[#4A3222] dark:bg-[#19100B]"
              >
                <EvidenceArtwork itemId={item.id} className="h-24 w-24" />
                <span className="mt-2 text-center text-xs font-semibold text-[#3D2414] dark:text-[#F5ECD8]">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(phase === 'recall' || phase === 'feedback') && (
        <div className="space-y-4 rounded-2xl border border-[#D9C5A9] bg-[#FBF6EE] p-5 dark:border-[#4A3222] dark:bg-[#22160F]">
          <p className="text-sm font-semibold text-[#3D2414] dark:text-[#F5ECD8]">
            Falta una evidencia en la mesa. ¿Cuál desapareció?
          </p>

          <div className="grid grid-cols-5 gap-2">
            {roundData.remaining.map((item) => (
              <div key={item.id} className="flex flex-col items-center">
                <EvidenceArtwork itemId={item.id} className="h-14 w-14 sm:h-16 sm:w-16" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {roundData.options.map((opt) => {
              const chosen = selectedId === opt.id;
              const isAnswer = opt.id === roundData.missingItem.id;
              let cardStyle =
                'border-[#DFCBB0] bg-[#F5ECE0] hover:border-[#8B5A2B] dark:border-[#4A3222] dark:bg-[#19100B]';
              if (phase === 'feedback') {
                if (isAnswer) {
                  cardStyle =
                    'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/50';
                } else if (chosen) {
                  cardStyle =
                    'border-rose-500 bg-rose-50 dark:border-rose-600 dark:bg-rose-950/50';
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={phase === 'feedback'}
                  onClick={() => handleAnswer(opt)}
                  className={`flex min-h-[110px] flex-col items-center justify-center rounded-xl border p-3 transition-transform active:scale-[0.98] ${cardStyle}`}
                >
                  <EvidenceArtwork itemId={opt.id} className="h-16 w-16" />
                  <span className="mt-2 text-center text-xs font-semibold text-[#2E1C10] dark:text-[#FBF3E6]">
                    {opt.name}
                  </span>
                </button>
              );
            })}
          </div>

          {phase === 'feedback' && (
            <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-[#DFCBB0] bg-[#F5ECE0] p-4 sm:flex-row dark:border-[#4A3222] dark:bg-[#19100B]">
              <p className="text-sm font-semibold text-[#2E1C10] dark:text-[#FBF3E6]">
                {isCorrect
                  ? '¡Ojo clínico! +100 puntos.'
                  : `Faltaba: ${roundData.missingItem.name}.`}
              </p>
              <button
                type="button"
                onClick={handleNext}
                className="min-h-[44px] w-full rounded-xl bg-[#7C4D2B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#643C1F] sm:w-auto dark:bg-[#8B5A2B]"
              >
                {roundNum >= maxRounds ? 'Ver resultado' : 'Siguiente ronda'}
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className="flex flex-col items-center rounded-2xl border border-[#D9C5A9] bg-[#FBF6EE] p-8 text-center dark:border-[#4A3222] dark:bg-[#22160F]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFE2CE] text-[#7C4D2B] dark:bg-[#3A2416] dark:text-[#F3D590]">
            <Trophy className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold text-[#2E1C10] dark:text-[#FBF3E6]">
            Entrenamiento completado
          </h3>
          <p className="mt-1 text-sm text-[#7A5E46] dark:text-[#C8B297]">
            Puntaje final: <span className="font-mono font-bold tabular-nums">{score} / 500</span>
          </p>
          <button
            type="button"
            onClick={startNewGame}
            className="mt-5 min-h-[48px] rounded-xl bg-[#7C4D2B] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#643C1F] dark:bg-[#8B5A2B]"
          >
            Volver a intentar
          </button>
        </div>
      )}
    </div>
  );
};
