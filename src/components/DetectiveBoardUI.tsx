import React from 'react';
import { Eye, EyeOff, Plus, Shield, ShieldAlert, User } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { BoardClue, DetectiveNote, EvidenceItem, PlayerRole, PrivateClue } from '../shared/types.ts';
import { soundFX } from '../utils/sound.ts';
import { EvidenceArtwork } from './EvidenceArtwork.tsx';
import { SuspectPortraitArtwork } from './SuspectPortraitArtwork.tsx';

interface BoardHeaderProps {
  subtitle: string;
  caseTitle: string;
  playerName: string;
  playerScore: number;
  activeStep: 1 | 2 | 3 | 4;
  rightExtra?: React.ReactNode;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  subtitle,
  caseTitle,
  playerName,
  playerScore,
  activeStep,
  rightExtra,
}) => {
  const steps = [
    { num: 1, label: '1. Tu Rol' },
    { num: 2, label: '2. Pistas' },
    { num: 3, label: '3. Votación' },
    { num: 4, label: '4. Resultado' },
  ];

  return (
    <div className="rounded-t-2xl border-2 border-[#59412F] bg-gradient-to-b from-[#2A1E17] to-[#1D140F] px-4 py-3 text-[#F5ECD8] shadow-md">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#8C6A4A] bg-[#16100C] text-[#E8C57B]">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wider text-[#D6C3A3] uppercase">
              {subtitle}
            </p>
            <h2 className="truncate font-display text-lg font-bold tracking-wide text-[#F3D590] sm:text-xl">
              {caseTitle}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 md:justify-end">
          <div className="flex items-center gap-2.5 rounded-xl border border-[#59412F] bg-[#150F0B] px-3 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#8C6A4A] bg-[#2B1F17] text-[#E8C57B]">
              <User className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F5ECD8]">{playerName}</div>
              <div className="font-mono text-[11px] text-[#CBB799] tabular-nums">
                PUNTOS: {playerScore}
              </div>
            </div>
          </div>
          {rightExtra}
        </div>
      </div>

      {/* Clear 4-Step Guide Bar */}
      <div className="mt-3 grid grid-cols-4 gap-1.5 rounded-xl border border-[#463224] bg-[#150F0B] p-1">
        {steps.map((s) => {
          const isCurrent = s.num === activeStep;
          const isDone = s.num < activeStep;
          return (
            <div
              key={s.num}
              className={`rounded-lg py-1.5 text-center text-[11px] font-bold transition-colors sm:text-xs ${
                isCurrent
                  ? 'bg-[#8B5A2B] text-[#FFF8EB] shadow-sm'
                  : isDone
                  ? 'bg-[#2B1F17] text-[#E8C57B]'
                  : 'text-[#8E7C64]'
              }`}
            >
              {s.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface RoleIdentityCardProps {
  role: PlayerRole;
  caseCode?: string;
  caseTitle?: string;
  caseBriefing?: string;
  item: EvidenceItem;
  privateClues: PrivateClue[];
  peekCard: boolean;
  onTogglePeek: () => void;
  onQuickShareClue?: (clueText: string) => void;
  footerSlot?: React.ReactNode;
}

export const RoleIdentityCard: React.FC<RoleIdentityCardProps> = ({
  role,
  caseCode,
  caseTitle,
  caseBriefing,
  item,
  privateClues,
  peekCard,
  onTogglePeek,
  onQuickShareClue,
  footerSlot,
}) => {
  const isImpostor = role === 'impostor';

  return (
    <div
      className={`overflow-hidden rounded-xl border-2 shadow-md ${
        isImpostor
          ? 'border-rose-500 bg-[#2A1315] text-white'
          : 'border-[#C88D4B] bg-[#29190E] text-white'
      }`}
    >
      {/* Clear Role Banner */}
      <div
        className={`flex items-center justify-between gap-2 px-4 py-3 ${
          isImpostor
            ? 'bg-rose-700'
            : 'bg-gradient-to-r from-[#6E4423] via-[#8B5A2B] to-[#A66E38]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isImpostor ? (
            <ShieldAlert className="h-6 w-6 shrink-0 text-amber-200" />
          ) : (
            <Shield className="h-6 w-6 shrink-0 text-amber-200" />
          )}
          <div>
            <div className="font-display text-lg font-bold tracking-wide uppercase">
              {isImpostor ? 'ERES IMPOSTOR' : 'ERES DETECTIVE'}
            </div>
            <p className="text-xs text-white/90">
              {isImpostor
                ? 'No tienes pistas. Tu foto es diferente: disimula para que no te descubran.'
                : 'Tienes pistas privadas únicas y la foto real del caso.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.woodTap();
            onTogglePeek();
          }}
          className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-lg bg-black/25 px-3 text-xs font-semibold text-white hover:bg-black/35"
        >
          {peekCard ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {peekCard ? 'Ocultar' : 'Ver'}
        </button>
      </div>

      {peekCard ? (
        <div className="space-y-3 p-4">
          {/* Case Explanation (100% for Detectives vs ~10% for Impostor) */}
          {caseBriefing && (
            <div
              className={`rounded-xl border p-3.5 ${
                isImpostor
                  ? 'border-rose-400/40 bg-rose-950/50 text-rose-50'
                  : 'border-[#B6824B]/50 bg-[#1B1009] text-amber-50'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`font-display text-xs font-bold uppercase ${
                    isImpostor ? 'text-amber-200' : 'text-[#F3D590]'
                  }`}
                >
                  {isImpostor
                    ? 'Informe limitado del caso (~10%)'
                    : 'Explicación completa del caso'}
                </span>
                {caseCode && (
                  <span className="font-mono text-[11px] font-bold text-white/80">
                    {caseCode}
                  </span>
                )}
              </div>
              {caseTitle && (
                <h4 className="mt-1 font-display text-sm font-bold text-white">
                  {caseTitle}
                </h4>
              )}
              <p className="mt-1 text-xs leading-relaxed text-white/90">
                {caseBriefing}
              </p>
            </div>
          )}

          {/* Evidence Photo */}
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white/10 p-3 sm:flex-row">
            <EvidenceArtwork itemId={item.id} className="h-28 w-28 shrink-0" />
            <div className="text-center sm:text-left">
              <p className="text-[11px] font-semibold tracking-wider text-white/75 uppercase">
                {isImpostor ? 'Tu foto falsa (Impostor)' : 'Tu foto de evidencia'}
              </p>
              <h4 className="font-display text-lg font-bold text-white">{item.name}</h4>
              <p className="mt-1 text-xs leading-relaxed text-white/85">{item.subtleHint}</p>
            </div>
          </div>

          {/* Private Clues for Detectives OR "No Clues" for Impostor */}
          {isImpostor ? (
            <div className="rounded-xl border border-rose-400/50 bg-rose-950/60 p-3.5 text-center">
              <p className="font-display text-sm font-bold text-amber-200 uppercase">
                Sin pistas asignadas
              </p>
              <p className="mt-1 text-xs leading-relaxed text-rose-100">
                Como eres el impostor, no recibes pistas del caso. Escucha lo que dicen los detectives y usa tu foto para improvisar.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-wide text-[#F3D590] uppercase">
                Tus pistas privadas (solo tú las ves):
              </p>
              <div className="space-y-2">
                {privateClues.map((clue) => (
                  <div
                    key={clue.id}
                    className="flex flex-col justify-between gap-2 rounded-xl border border-[#C6B393] bg-[#EFE6D5] p-3 text-stone-900 sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="font-display text-xs font-bold text-stone-900 uppercase">
                        {clue.title}
                      </div>
                      <p className="mt-0.5 text-sm leading-snug text-stone-800">{clue.detail}</p>
                    </div>
                    {onQuickShareClue && (
                      <button
                        type="button"
                        onClick={() => onQuickShareClue(clue.detail)}
                        className="min-h-[38px] shrink-0 rounded-lg bg-[#7C4D2B] px-3 text-xs font-bold text-white hover:bg-[#643C1F]"
                      >
                        Fijar en tablero
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center text-sm text-white/80">
          Rol, foto y pistas ocultos. Toca <strong>Ver</strong> cuando nadie mire tu pantalla.
        </div>
      )}

      {footerSlot && <div className="border-t border-white/15 bg-black/20 px-4 py-3">{footerSlot}</div>}
    </div>
  );
};

interface CorkboardPanelProps {
  clues: BoardClue[];
  notes: DetectiveNote[];
  topSlot?: React.ReactNode;
  onAddNote?: (text: string) => void;
  notePlaceholder?: string;
}

export const CorkboardPanel: React.FC<CorkboardPanelProps> = ({
  clues,
  notes,
  topSlot,
  onAddNote,
  notePlaceholder = 'Escribir nota del detective...',
}) => {
  const [noteInput, setNoteInput] = React.useState('');

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim() || !onAddNote) return;
    soundFX.noteWrite();
    onAddNote(noteInput.trim());
    setNoteInput('');
  };

  const pinColors = ['#DC2626', '#B45309', '#D97706', '#059669'];

  return (
    <div className="flex flex-col justify-between rounded-xl border-4 border-[#4A3424] bg-[#2D1F16] p-3 shadow-inner">
      <div>
        <div className="mb-3 rounded-lg border border-[#6E5038] bg-[#201610] py-2 text-center shadow-sm">
          <h3 className="font-display text-base font-bold tracking-wider text-[#F5ECD8] uppercase">
            TABLERO DE PISTAS DEL CASO
          </h3>
        </div>

        <div
          className="relative space-y-3 rounded-lg border-2 border-[#6B4B32] p-3 sm:p-4"
          style={{
            backgroundColor: '#A97E52',
            backgroundImage:
              'radial-gradient(rgba(54,32,14,0.16) 1px, transparent 1px), radial-gradient(rgba(255,235,205,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
            backgroundPosition: '0 0, 7px 7px',
          }}
        >
          {topSlot}

          {clues.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#5B3D24] bg-[#EFE6D5] p-4 text-center text-sm font-medium text-stone-700">
              Aún no hay pistas compartidas en el tablero.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {clues.map((clue, idx) => {
                const pinColor = pinColors[idx % pinColors.length];
                return (
                  <article
                    key={clue.id}
                    className="relative rounded-md border border-[#C6B393] bg-[#EFE6D5] p-3.5 pt-4 text-stone-900 shadow-md"
                  >
                    <span
                      className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white/80 shadow-sm"
                      style={{ backgroundColor: pinColor }}
                      aria-hidden="true"
                    />
                    <h4 className="font-display text-xs font-bold tracking-wide text-[#6E4423] uppercase">
                      {clue.title}
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-stone-900">{clue.text}</p>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* NOTAS DEL DETECTIVE */}
      <div className="mt-3 rounded-lg border-2 border-[#59402E] bg-[#1F1610] p-3 text-[#F2E9D8]">
        <div className="border-b border-[#463224] pb-1.5 text-center font-display text-xs font-bold tracking-widest text-[#E8C57B] uppercase">
          NOTAS DEL DETECTIVE
        </div>
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#E7D8BE]">
          {notes.length === 0 ? (
            <li className="text-[#A8967A]">&gt; Anota aquí tus sospechas mientras investigan.</li>
          ) : (
            notes.map((n) => (
              <li key={n.id}>
                &gt; <span className="font-semibold text-[#F3D590]">{n.authorName}:</span> {n.text}
              </li>
            ))
          )}
        </ul>

        {onAddNote && (
          <form onSubmit={handleSubmitNote} className="mt-2.5 flex gap-1.5">
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder={notePlaceholder}
              maxLength={140}
              className="min-h-[40px] flex-1 rounded-lg border border-[#59402E] bg-[#130D09] px-3 text-xs text-[#F5ECD8] placeholder:text-[#8E7C64] focus:border-[#B6783C] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!noteInput.trim()}
              className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-[#7C634B] bg-[#332419] px-3 text-xs font-semibold text-[#F5ECD8] hover:bg-[#443122] disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              Nota
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

interface SuspectDossierCardProps {
  letter: string;
  name: string;
  color: string;
  avatarId: string;
  roleLine: string;
  clueLine: string;
  statusTag?: string;
  canVote?: boolean;
  voteDisabled?: boolean;
  voteButtonLabel?: string;
  onVote?: () => void;
}

export const SuspectDossierCard: React.FC<SuspectDossierCardProps> = ({
  letter,
  name,
  color,
  avatarId,
  roleLine,
  clueLine,
  statusTag,
  canVote = false,
  voteDisabled = false,
  voteButtonLabel = 'Votar',
  onVote,
}) => {
  return (
    <div className="flex gap-3 rounded-lg border border-[#B9A484] bg-[#EFE6D5] p-3 text-stone-900 shadow-md">
      <div
        className="relative flex h-24 w-20 shrink-0 flex-col items-center justify-end overflow-hidden rounded-md border-2 bg-slate-300 shadow-sm"
        style={{ borderColor: color }}
      >
        <SuspectPortraitArtwork avatarId={avatarId} className="h-full w-full object-cover" />
        <span
          className="absolute bottom-1 right-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-white shadow"
          style={{ backgroundColor: color }}
        >
          {letter}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="truncate font-display text-sm font-bold text-stone-900">
              {name}
            </h4>
            {statusTag && (
              <span className="shrink-0 font-mono text-xs font-bold text-stone-700 tabular-nums">
                {statusTag}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-[#7A4B2A]">{roleLine}</p>
          <p className="mt-1 text-xs leading-snug text-stone-800">{clueLine}</p>
        </div>

        <AnimatePresence initial={false}>
          {canVote && onVote && (
            <motion.div
              key="vote-btn-wrap"
              initial={{ opacity: 0, height: 0, y: 6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <motion.button
                type="button"
                disabled={voteDisabled}
                onClick={onVote}
                whileTap={{ scale: 0.97 }}
                className="mt-2.5 min-h-[44px] w-full rounded-lg bg-[#7C4D2B] px-4 font-display text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-[#643C1F] disabled:opacity-45"
              >
                {voteButtonLabel}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface BoardBottomBarProps {
  objectiveText: string;
  leftActionLabel?: string;
  onLeftAction?: () => void;
  leftDisabled?: boolean;
  rightActionLabel?: string;
  onRightAction?: () => void;
  rightDisabled?: boolean;
}

export const BoardBottomBar: React.FC<BoardBottomBarProps> = ({
  objectiveText,
  leftActionLabel = '+ Añadir Pista',
  onLeftAction,
  leftDisabled = false,
  rightActionLabel = 'Pasar a Votación',
  onRightAction,
  rightDisabled = false,
}) => {
  return (
    <div className="rounded-b-2xl border-2 border-t-0 border-[#59412F] bg-gradient-to-b from-[#2A1E17] to-[#1D140F] px-4 py-3 text-[#F5ECD8]">
      <div className="flex flex-col items-stretch justify-between gap-2.5 md:flex-row md:items-center">
        {onLeftAction ? (
          <button
            type="button"
            disabled={leftDisabled}
            onClick={onLeftAction}
            className="min-h-[46px] rounded-xl border border-[#B9A484] bg-[#EFE6D5] px-4 font-display text-xs font-bold tracking-wide text-stone-900 uppercase shadow hover:bg-[#E4D7BF] disabled:opacity-45 whitespace-nowrap"
          >
            {leftActionLabel}
          </button>
        ) : (
          <div className="hidden md:block" />
        )}

        <p className="text-center text-xs font-medium text-[#EFE6D5] md:flex-1">
          <strong className="text-[#F3D590]">PASO ACTUAL:</strong> {objectiveText}
        </p>

        {onRightAction ? (
          <button
            type="button"
            disabled={rightDisabled}
            onClick={onRightAction}
            className="min-h-[46px] rounded-xl border border-[#A67247] bg-[#7C4D2B] px-5 font-display text-xs font-bold tracking-wide text-white uppercase shadow hover:bg-[#643C1F] disabled:opacity-45 whitespace-nowrap"
          >
            {rightActionLabel}
          </button>
        ) : (
          <div className="hidden md:block" />
        )}
      </div>
    </div>
  );
};
