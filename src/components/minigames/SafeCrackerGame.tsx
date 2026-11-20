import React, { useState } from 'react';
import { Delete, LockKeyhole, RotateCcw, Unlock } from 'lucide-react';
import { soundFX } from '../../utils/sound.ts';

function generateSecretCode(): string[] {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const shuffled = [...digits].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

interface GuessAttempt {
  guess: string[];
  exact: number;
  misplaced: number;
}

export const SafeCrackerGame: React.FC = () => {
  const [secret, setSecret] = useState<string[]>(() => generateSecretCode());
  const [currentInput, setCurrentInput] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<GuessAttempt[]>([]);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const maxAttempts = 7;

  const resetGame = () => {
    soundFX.tabSwitch();
    setSecret(generateSecretCode());
    setCurrentInput([]);
    setAttempts([]);
    setStatus('playing');
  };

  const handleDigit = (d: string) => {
    if (status !== 'playing') return;
    if (currentInput.length >= 4 || currentInput.includes(d)) return;
    soundFX.safeDialClick();
    setCurrentInput((prev) => [...prev, d]);
  };

  const handleBackspace = () => {
    if (status !== 'playing' || currentInput.length === 0) return;
    soundFX.safeBackspace();
    setCurrentInput((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (status !== 'playing' || currentInput.length !== 4) return;
    let exact = 0;
    let misplaced = 0;
    currentInput.forEach((digit, idx) => {
      if (secret[idx] === digit) {
        exact += 1;
      } else if (secret.includes(digit)) {
        misplaced += 1;
      }
    });

    const nextAttempts = [...attempts, { guess: currentInput, exact, misplaced }];
    setAttempts(nextAttempts);
    setCurrentInput([]);

    if (exact === 4) {
      soundFX.safeUnlock();
      setStatus('won');
    } else if (nextAttempts.length >= maxAttempts) {
      soundFX.errorThud();
      setStatus('lost');
    } else {
      soundFX.safeDialClick();
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-[#D9C5A9] bg-[#FBF6EE] p-4 dark:border-[#4A3222] dark:bg-[#22160F]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFE2CE] text-[#7C4D2B] dark:bg-[#3A2416] dark:text-[#F3D590]">
            {status === 'won' ? <Unlock className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-[#2E1C10] dark:text-[#FBF3E6]">
              Caja Fuerte de Evidencia
            </h2>
            <p className="text-xs text-[#7A5E46] dark:text-[#C8B297]">
              Código de 4 dígitos distintos · Máximo {maxAttempts} intentos
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={resetGame}
          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#D4BC9C] bg-[#F5ECE0] px-3 py-1.5 text-xs font-semibold text-[#3D2414] hover:bg-[#EAD8BE] dark:border-[#593C28] dark:bg-[#2B1C12] dark:text-[#F5ECD8]"
        >
          <RotateCcw className="h-4 w-4" />
          Nuevo
        </button>
      </div>

      {/* Attempts history */}
      <div className="rounded-2xl border border-[#D9C5A9] bg-[#FBF6EE] p-4 dark:border-[#4A3222] dark:bg-[#22160F]">
        <div className="space-y-2">
          {attempts.length === 0 && (
            <p className="py-4 text-center text-xs text-[#7A5E46] dark:text-[#C8B297]">
              Ingresa 4 números diferentes y presiona Probar para recibir pistas de posición.
            </p>
          )}
          {attempts.map((a, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-[#DFCBB0] bg-[#F5ECE0] px-3 py-2 dark:border-[#4A3222] dark:bg-[#19100B]"
            >
              <span className="font-mono text-xs text-[#8E7358] tabular-nums">#{idx + 1}</span>
              <div className="flex gap-2">
                {a.guess.map((d, i) => (
                  <span
                    key={i}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D4BC9C] bg-[#FBF6EE] font-mono text-base font-bold text-[#2E1C10] dark:border-[#593C28] dark:bg-[#2B1C12] dark:text-[#FBF3E6]"
                  >
                    {d}
                  </span>
                ))}
              </div>
              <div className="text-right text-xs font-semibold tabular-nums">
                <div className="text-emerald-700 dark:text-emerald-400">{a.exact} exactos</div>
                <div className="text-amber-600 dark:text-amber-400">{a.misplaced} movidos</div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Input Slots */}
        {status === 'playing' && (
          <div className="mt-4 flex items-center justify-center gap-3 border-t border-[#DFCBB0] pt-4 dark:border-[#4A3222]">
            {[0, 1, 2, 3].map((slot) => (
              <div
                key={slot}
                className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#8B5A2B]/55 bg-[#EFE2CE]/70 font-mono text-xl font-bold text-[#2E1C10] dark:border-[#C88D4B]/55 dark:bg-[#19100B] dark:text-[#F3D590]"
              >
                {currentInput[slot] ?? '·'}
              </div>
            ))}
          </div>
        )}

        {status !== 'playing' && (
          <div
            className={`mt-4 rounded-xl border p-4 text-center ${
              status === 'won'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100'
                : 'border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-100'
            }`}
          >
            <p className="font-display text-base font-bold">
              {status === 'won'
                ? `¡Maletín abierto en ${attempts.length} intentos!`
                : `Bloqueo activado. El código era ${secret.join('')}`}
            </p>
            <button
              type="button"
              onClick={resetGame}
              className="mt-3 min-h-[44px] rounded-xl bg-[#7C4D2B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#643C1F] dark:bg-[#8B5A2B]"
            >
              Jugar otra combinación
            </button>
          </div>
        )}
      </div>

      {/* Mobile Keypad */}
      <div className="grid grid-cols-5 gap-2 rounded-2xl border border-[#D9C5A9] bg-[#FBF6EE] p-3 dark:border-[#4A3222] dark:bg-[#22160F]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => {
          const used = currentInput.includes(d);
          return (
            <button
              key={d}
              type="button"
              disabled={status !== 'playing' || used || currentInput.length >= 4}
              onClick={() => handleDigit(d)}
              className="min-h-[48px] rounded-xl border border-[#DFCBB0] bg-[#F5ECE0] font-mono text-lg font-bold text-[#2E1C10] transition-transform active:scale-95 disabled:opacity-35 dark:border-[#593C28] dark:bg-[#2E1E13] dark:text-[#FBF3E6]"
            >
              {d}
            </button>
          );
        })}
        <button
          type="button"
          onClick={handleBackspace}
          disabled={status !== 'playing' || currentInput.length === 0}
          className="col-span-2 flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border border-[#D4BC9C] bg-[#FBF6EE] text-sm font-semibold text-[#5C3A21] disabled:opacity-40 dark:border-[#593C28] dark:bg-[#19100B] dark:text-[#EAD8BE]"
        >
          <Delete className="h-4 w-4" />
          Borrar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={status !== 'playing' || currentInput.length !== 4}
          className="col-span-3 min-h-[48px] rounded-xl bg-[#7C4D2B] text-sm font-semibold text-white transition-colors hover:bg-[#643C1F] disabled:opacity-40 dark:bg-[#8B5A2B]"
        >
          Probar Código
        </button>
      </div>
    </div>
  );
};
