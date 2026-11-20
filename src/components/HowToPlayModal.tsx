import React, { useState } from 'react';
import { BookOpen, FolderOpen, Gamepad2, Lock, MessageSquareText, Users, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { soundFX } from '../utils/sound.ts';

interface HowToPlayModalProps {
  open: boolean;
  onClose: (dontShowAgain: boolean) => void;
  fromChalkboard?: boolean;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  open,
  onClose,
  fromChalkboard = false,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (fromChalkboard) {
      soundFX.chalkWrite();
    } else {
      soundFX.woodTap();
    }
    onClose(dontShowAgain);
  };

  const steps = [
    {
      num: '01',
      title: 'Elige cómo jugar',
      icon: <Users className="h-4 w-4" />,
      body: 'Entra en Detectives para jugar Online con código de sala, Presencial con varios celulares o Presencial en un solo celular (3 a 10 jugadores). Elige tu foto de expediente antes de empezar.',
    },
    {
      num: '02',
      title: 'Abre tu expediente secreto',
      icon: <FolderOpen className="h-4 w-4" />,
      body: 'Los Detectives reciben la explicación completa del robo (100%), la foto real y pistas privadas únicas. El Impostor solo ve ~10% del caso, no tiene pistas y recibe una foto distinta.',
    },
    {
      num: '03',
      title: 'Describe y fija pistas',
      icon: <MessageSquareText className="h-4 w-4" />,
      body: 'Cada ronda presenta un robo distinto. Comparte pistas breves sin delatar el objeto exacto; el impostor debe improvisar escuchando a los demás.',
    },
    {
      num: '04',
      title: 'Votación secreta y Minijuegos',
      icon: <Lock className="h-4 w-4" />,
      body: 'Cuando estén listos, abran la votación secreta para atrapar al impostor. También puedes entrenar solo o en duelo desde la pizarra en Minijuegos.',
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#140B06]/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border-2 border-[#C8A67D] bg-[#FBF6EE] p-5 text-[#2E1C10] shadow-2xl sm:rounded-2xl sm:p-6 dark:border-[#593C28] dark:bg-[#22160F] dark:text-[#FBF3E6]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6E4423] to-[#B6783C] text-[#FFF8EB] shadow-sm">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-[11px] font-bold tracking-wider text-[#8B5A2B] uppercase dark:text-[#F3D590]">
                    Manual del Precinto
                  </p>
                  <h2 className="font-display text-xl font-bold text-[#2E1C10] dark:text-[#FFF8EB]">
                    ¿Cómo se juega?
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#7A5E46] hover:bg-[#EFE2CE] dark:text-[#C8B297] dark:hover:bg-[#332116]"
                aria-label="Cerrar guía"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {steps.map((s) => (
                <div
                  key={s.num}
                  className="rounded-xl border border-[#DFCBB0] bg-[#F5ECE0] p-3.5 dark:border-[#4A3222] dark:bg-[#19100B]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#8B5A2B] dark:text-[#F3D590]">
                      PASO {s.num}
                    </span>
                    <span className="text-[#7C4D2B] dark:text-[#F3D590]">{s.icon}</span>
                  </div>
                  <h3 className="mt-1.5 font-display text-sm font-bold text-[#2E1C10] dark:text-[#FFF8EB]">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#5E4534] dark:text-[#D9C7AF]">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-[#DFCBB0] bg-[#EFE2CE]/70 px-3.5 py-2.5 text-xs text-[#4A2E1A] dark:border-[#4A3222] dark:bg-[#2B1C12] dark:text-[#EAD8BE]">
              <Gamepad2 className="h-4 w-4 shrink-0 text-[#7C4D2B] dark:text-[#F3D590]" />
              <span>
                Consejo: Los sonidos cambian según donde estés (tiza en la pizarra, madera en los expedientes y dial metálico en la caja fuerte).
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-[#6E4E37] dark:text-[#C8B297]">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => {
                    soundFX.toggleSwitch();
                    setDontShowAgain(e.target.checked);
                  }}
                  className="h-4 w-4 rounded border-[#B9A484] accent-[#7C4D2B]"
                />
                No mostrar automáticamente al entrar
              </label>

              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="min-h-[46px] rounded-xl bg-gradient-to-r from-[#5C3A21] via-[#8B5A2B] to-[#B6783C] px-6 font-display text-sm font-bold text-[#FFF8EB] shadow-md hover:brightness-110 whitespace-nowrap"
              >
                ¡Entendido, a investigar!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
