import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Eye,
  Lock,
  Plus,
  ShieldAlert,
  Timer,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { EVIDENCE_PAIRS, PLAYER_COLORS } from '../data/evidenceCatalog.ts';
import type { BoardClue, DetectiveNote, EvidencePair, PrivateClue } from '../shared/types.ts';
import { createInitialRoundHistory, generateUniqueRoundSetup } from '../utils/roundGenerator.ts';
import { soundFX } from '../utils/sound.ts';
import {
  BoardBottomBar,
  BoardHeader,
  CorkboardPanel,
  SuspectDossierCard,
} from './DetectiveBoardUI.tsx';
import { EvidenceArtwork } from './EvidenceArtwork.tsx';
import { SUSPECT_AVATAR_SPECS, SuspectPortraitArtwork } from './SuspectPortraitArtwork.tsx';
import { TopSecretFolderReveal } from './TopSecretFolderReveal.tsx';

interface LocalPlayer {
  id: string;
  name: string;
  color: string;
  avatarId: string;
  score: number;
}

type LocalPhase = 'SETUP' | 'PASS_REVEAL' | 'DEBATE' | 'PASS_VOTE' | 'RESULTS';

export const PassAndPlayMode: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [players, setPlayers] = useState<LocalPlayer[]>([
    { id: 'lp1', name: 'Ana', color: PLAYER_COLORS[0], avatarId: SUSPECT_AVATAR_SPECS[1].id, score: 0 },
    { id: 'lp2', name: 'Lucas', color: PLAYER_COLORS[1], avatarId: SUSPECT_AVATAR_SPECS[0].id, score: 0 },
    { id: 'lp3', name: 'Sofía', color: PLAYER_COLORS[2], avatarId: SUSPECT_AVATAR_SPECS[3].id, score: 0 },
    { id: 'lp4', name: 'Mateo', color: PLAYER_COLORS[3], avatarId: SUSPECT_AVATAR_SPECS[2].id, score: 0 },
  ]);
  const [newName, setNewName] = useState('');
  const [impostorCount, setImpostorCount] = useState<1 | 2>(1);
  const [maxRounds, setMaxRounds] = useState(3);

  const [phase, setPhase] = useState<LocalPhase>('SETUP');
  const [round, setRound] = useState(1);
  const roundHistoryRef = useRef(createInitialRoundHistory());
  const [currentPair, setCurrentPair] = useState<EvidencePair>(EVIDENCE_PAIRS[0]);
  const [impostorIds, setImpostorIds] = useState<string[]>([]);
  const [playerCluesMap, setPlayerCluesMap] = useState<Map<string, PrivateClue[]>>(new Map());
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardVisible, setCardVisible] = useState(false);
  const [debateSeconds, setDebateSeconds] = useState(120);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [voterReady, setVoterReady] = useState(false);

  const [boardClues, setBoardClues] = useState<BoardClue[]>([]);
  const [detectiveNotes, setDetectiveNotes] = useState<DetectiveNote[]>([]);
  const [showClueModal, setShowClueModal] = useState(false);
  const [clueAuthorId, setClueAuthorId] = useState('lp1');
  const [clueText, setClueText] = useState('');

  useEffect(() => {
    if (phase !== 'DEBATE' || debateSeconds <= 0) return;
    const id = window.setTimeout(() => setDebateSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [phase, debateSeconds]);

  const addPlayer = () => {
    const clean = newName.trim().slice(0, 18);
    if (!clean || players.length >= 10) return;
    soundFX.woodTap();
    setPlayers((prev) => [
      ...prev,
      {
        id: `lp_${Date.now()}_${prev.length}`,
        name: clean,
        color: PLAYER_COLORS[prev.length % PLAYER_COLORS.length],
        avatarId: SUSPECT_AVATAR_SPECS[prev.length % SUSPECT_AVATAR_SPECS.length].id,
        score: 0,
      },
    ]);
    setNewName('');
  };

  const removePlayer = (id: string) => {
    if (players.length <= 3) return;
    soundFX.woodTap();
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePlayerName = (id: string, name: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name: name.slice(0, 18) } : p)));
  };

  const cyclePlayerAvatar = (id: string) => {
    soundFX.woodTap();
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const currIdx = SUSPECT_AVATAR_SPECS.findIndex((a) => a.id === p.avatarId);
        const nextSpec = SUSPECT_AVATAR_SPECS[(currIdx + 1) % SUSPECT_AVATAR_SPECS.length];
        return { ...p, avatarId: nextSpec.id };
      })
    );
  };

  const startRound = (nextRoundNum: number, resetScores: boolean) => {
    const cleanPlayers = players.map((p, idx) => ({
      ...p,
      name: p.name.trim() || `Detective ${idx + 1}`,
      score: resetScores ? 0 : p.score,
    }));
    setPlayers(cleanPlayers);
    setClueAuthorId(cleanPlayers[0].id);

    const setup = generateUniqueRoundSetup({
      playerIds: cleanPlayers.map((p) => p.id),
      impostorCount,
      history: roundHistoryRef.current,
    });
    roundHistoryRef.current = setup.nextHistory;

    const picked = setup.pair;
    setCurrentPair(picked);
    setImpostorIds(setup.impostorIds);
    setPlayerCluesMap(setup.playerClues);

    setBoardClues([
      {
        id: `clue_case_${Date.now()}`,
        authorId: 'system',
        authorName: 'Comisaría',
        authorColor: '#3B82F6',
        title: `${picked.caseCode}: ${picked.title.toUpperCase()}`,
        text: picked.caseDescription,
        timestamp: Date.now(),
      },
    ]);
    setDetectiveNotes([
      {
        id: `note_init_${Date.now()}`,
        authorName: 'Comisaría',
        text: `Cada detective tiene pistas distintas. El impostor no tiene pistas.`,
        timestamp: Date.now(),
      },
    ]);

    setRound(nextRoundNum);
    setActiveIndex(0);
    setCardVisible(false);
    setVotes({});
    setVoterReady(false);
    setDebateSeconds(120);
    soundFX.cardFlip();
    setPhase('PASS_REVEAL');
  };

  const handleNextReveal = () => {
    soundFX.woodTap();
    setCardVisible(false);
    if (activeIndex + 1 < players.length) {
      setActiveIndex((i) => i + 1);
    } else {
      setPhase('DEBATE');
    }
  };

  const handleStartVote = () => {
    soundFX.cardFlip();
    setActiveIndex(0);
    setVoterReady(false);
    setVotes({});
    setPhase('PASS_VOTE');
  };

  const handleVoteForTarget = (targetId: string) => {
    soundFX.voteCast();
    const voter = players[activeIndex];
    const nextVotes = { ...votes, [voter.id]: targetId };
    setVotes(nextVotes);
    setVoterReady(false);

    if (activeIndex + 1 < players.length) {
      setActiveIndex((i) => i + 1);
    } else {
      const tally = new Map<string, number>();
      Object.values(nextVotes).forEach((t) => tally.set(t, (tally.get(t) ?? 0) + 1));
      let maxV = 0;
      let tops: string[] = [];
      for (const [id, c] of tally.entries()) {
        if (c > maxV) {
          maxV = c;
          tops = [id];
        } else if (c === maxV) {
          tops.push(id);
        }
      }
      const eliminated = tops.length === 1 ? tops[0] : null;
      const caught = eliminated ? impostorIds.includes(eliminated) : false;

      setPlayers((prev) =>
        prev.map((p) => {
          const isImp = impostorIds.includes(p.id);
          if (caught && !isImp) {
            return { ...p, score: p.score + (nextVotes[p.id] === eliminated ? 100 : 50) };
          }
          if (!caught && isImp) {
            return { ...p, score: p.score + 150 };
          }
          return p;
        })
      );

      if (caught) {
        soundFX.revealSuccess();
      } else {
        soundFX.revealAlert();
      }
      setPhase('RESULTS');
    }
  };

  const handlePinSpokenClue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clueText.trim()) return;
    const speaker = players.find((p) => p.id === clueAuthorId) ?? players[0];
    soundFX.pinTack();
    setBoardClues((prev) => [
      ...prev,
      {
        id: `clue_${Date.now()}`,
        authorId: speaker.id,
        authorName: speaker.name,
        authorColor: speaker.color,
        title: `PISTA ${prev.length}: ${speaker.name.toUpperCase()}`,
        text: clueText.trim(),
        timestamp: Date.now(),
      },
    ]);
    setClueText('');
    setShowClueModal(false);
  };

  const handleAddLocalNote = (text: string) => {
    soundFX.noteWrite();
    setDetectiveNotes((prev) => [
      ...prev.slice(-10),
      {
        id: `note_${Date.now()}`,
        authorName: 'Mesa',
        text,
        timestamp: Date.now(),
      },
    ]);
  };

  const activePlayer = players[activeIndex];
  const letters = 'ABCDEFGHIJ';

  if (phase === 'SETUP') {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="rounded-2xl border border-[#D9C5A9] bg-[#FBF6EE] p-5 dark:border-[#4A3222] dark:bg-[#22160F]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-[#2E1C10] dark:text-[#FBF3E6]">
                Presencial: Un Solo Celular
              </h2>
              <p className="mt-1 text-xs text-[#7A5E46] dark:text-[#C8B297]">
                Cada detective verá su rol ("ERES DETECTIVE") y sus pistas exclusivas. Al impostor ("ERES IMPOSTOR") no le tocarán pistas.
              </p>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-[#8B5A2B] tabular-nums dark:text-[#F3D590]">
              <Users className="h-4 w-4" />
              {players.length}/10
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {players.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => cyclePlayerAvatar(p.id)}
                  title="Toca para cambiar foto"
                  className="relative h-12 w-10 shrink-0 overflow-hidden rounded-xl border-2 bg-[#E8D9C3] transition-transform active:scale-95"
                  style={{ borderColor: p.color }}
                  aria-label={`Cambiar foto de ${p.name || `Detective ${idx + 1}`}`}
                >
                  <SuspectPortraitArtwork avatarId={p.avatarId} className="h-full w-full" />
                </button>
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => updatePlayerName(p.id, e.target.value)}
                  placeholder={`Detective ${idx + 1}`}
                  className="min-h-[44px] w-full rounded-xl border border-[#D4BC9C] bg-[#F5ECE0] px-3 text-sm font-medium text-[#2E1C10] focus:border-[#8B5A2B] focus:outline-none dark:border-[#593C28] dark:bg-[#19100B] dark:text-[#FBF3E6]"
                />
                {players.length > 3 && (
                  <button
                    type="button"
                    onClick={() => removePlayer(p.id)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#DFCBB0] text-[#7A5E46] hover:bg-rose-50 hover:text-rose-600 dark:border-[#4A3222] dark:text-[#C8B297] dark:hover:bg-rose-950/40"
                    aria-label="Eliminar jugador"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {players.length < 10 && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addPlayer();
                }}
                placeholder="Nombre del nuevo jugador..."
                className="min-h-[44px] flex-1 rounded-xl border border-[#D4BC9C] bg-[#F5ECE0] px-3 text-sm text-[#2E1C10] focus:border-[#8B5A2B] focus:outline-none dark:border-[#593C28] dark:bg-[#19100B] dark:text-[#FBF3E6]"
              />
              <button
                type="button"
                onClick={addPlayer}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#5C3A21] px-4 text-sm font-semibold text-white hover:bg-[#492D19] dark:bg-[#7C4D2B] dark:hover:bg-[#643C1F]"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-[#DFCBB0] pt-4 sm:grid-cols-2 dark:border-[#4A3222]">
            <div>
              <label className="block text-xs font-semibold text-[#7A5E46] dark:text-[#C8B297]">
                Impostores
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-xl bg-[#EFE2CE] p-1 dark:bg-[#19100B]">
                {[1, 2].map((num) => (
                  <button
                    key={num}
                    type="button"
                    disabled={num === 2 && players.length < 6}
                    onClick={() => setImpostorCount(num as 1 | 2)}
                    className={`min-h-[42px] rounded-lg text-xs font-semibold disabled:opacity-40 ${
                      impostorCount === num
                        ? 'bg-[#7C4D2B] text-white shadow-sm dark:bg-[#8B5A2B]'
                        : 'text-[#6E4E37] dark:text-[#C8B297]'
                    }`}
                  >
                    {num} {num === 1 ? 'Impostor' : 'Impostores (6+)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7A5E46] dark:text-[#C8B297]">
                Rondas (casos distintos)
              </label>
              <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-xl bg-[#EFE2CE] p-1 dark:bg-[#19100B]">
                {[1, 3, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMaxRounds(r)}
                    className={`min-h-[42px] rounded-lg font-mono text-xs font-semibold ${
                      maxRounds === r
                        ? 'bg-[#7C4D2B] text-white shadow-sm dark:bg-[#8B5A2B]'
                        : 'text-[#6E4E37] dark:text-[#C8B297]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={onBack}
              className="min-h-[48px] rounded-xl border border-[#D4BC9C] px-5 text-sm font-semibold text-[#5C3A21] hover:bg-[#EFE2CE] dark:border-[#593C28] dark:text-[#EAD8BE] dark:hover:bg-[#332116]"
            >
              Volver
            </button>
            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startRound(1, true)}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5C3A21] via-[#8B5A2B] to-[#B6783C] px-6 text-sm font-bold text-white shadow-md shadow-[#5C3A21]/30 hover:brightness-110"
            >
              Comenzar Caso
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'PASS_REVEAL' && activePlayer) {
    const isImp = impostorIds.includes(activePlayer.id);
    const item = isImp ? currentPair.impostorItem : currentPair.detectiveItem;
    const myClues = isImp ? [] : playerCluesMap.get(activePlayer.id) ?? [];

    return (
      <div className="mx-auto max-w-lg space-y-4">
        <div className="rounded-2xl border-2 border-[#59412F] bg-[#241912] p-5 text-[#F5ECD8] shadow-xl">
          <div className="flex flex-col items-center text-center">
            <div
              className="mb-2 h-16 w-14 overflow-hidden rounded-xl border-2 bg-slate-200 shadow"
              style={{ borderColor: activePlayer.color }}
            >
              <SuspectPortraitArtwork avatarId={activePlayer.avatarId} className="h-full w-full" />
            </div>
            <p className="font-mono text-xs font-semibold text-[#D6C3A3] tabular-nums">
              {currentPair.caseCode} · RONDA {round}/{maxRounds} · JUGADOR {activeIndex + 1}/{players.length}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-[#F3D590]">
              Turno de {activePlayer.name}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {!cardVisible ? (
              <motion.div
                key={`pass-lock-${activePlayer.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 space-y-4 text-center"
              >
                <div className="rounded-xl border border-[#59402E] bg-[#19110C] p-6">
                  <p className="text-sm text-[#E7D8BE]">
                    Entrega el celular a <strong>{activePlayer.name}</strong>. Cuando nadie más esté mirando, toca el botón para abrir tu expediente secreto.
                  </p>
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCardVisible(true)}
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#7C4D2B] px-5 font-display text-sm font-bold tracking-wide text-white uppercase hover:bg-[#643C1F]"
                >
                  <Eye className="h-5 w-5" />
                  Soy {activePlayer.name} · Abrir Expediente
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key={`pass-folder-${activePlayer.id}-${round}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4"
              >
                <TopSecretFolderReveal
                  variant="inline"
                  role={isImp ? 'impostor' : 'detective'}
                  playerName={activePlayer.name}
                  caseCode={currentPair.caseCode}
                  caseTitle={currentPair.title}
                  caseBriefing={
                    isImp ? currentPair.impostorBriefing : currentPair.detectiveBriefing
                  }
                  item={item}
                  privateClues={myClues}
                  requireTapToOpen={false}
                  primaryActionLabel={
                    activeIndex + 1 < players.length
                      ? 'Ocultar y pasar al siguiente'
                      : 'Todos listos · Abrir Tablero'
                  }
                  onPrimaryAction={handleNextReveal}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // DEBATE, PASS_VOTE, RESULTS inside the clear Board UI
  const mins = Math.floor(debateSeconds / 60);
  const secs = debateSeconds % 60;

  const tally = new Map<string, number>();
  Object.values(votes).forEach((t) => tally.set(t, (tally.get(t) ?? 0) + 1));
  let maxV = 0;
  let tops: string[] = [];
  for (const [id, c] of tally.entries()) {
    if (c > maxV) {
      maxV = c;
      tops = [id];
    } else if (c === maxV) {
      tops.push(id);
    }
  }
  const eliminatedId = tops.length === 1 ? tops[0] : null;
  const eliminatedPlayer = players.find((p) => p.id === eliminatedId) ?? null;
  const caught = eliminatedId ? impostorIds.includes(eliminatedId) : false;
  const impostorNames = players
    .filter((p) => impostorIds.includes(p.id))
    .map((p) => p.name)
    .join(', ');

  const activeStep: 1 | 2 | 3 | 4 =
    phase === 'DEBATE' ? 2 : phase === 'PASS_VOTE' ? 3 : 4;

  return (
    <div className="overflow-hidden rounded-2xl shadow-2xl">
      <BoardHeader
        subtitle={`PRESENCIAL (1 CELULAR) · RONDA ${round}/${maxRounds}`}
        caseTitle={`${currentPair.caseCode}: ${currentPair.title.toUpperCase()}`}
        playerName={phase === 'PASS_VOTE' && activePlayer ? `Vota: ${activePlayer.name}` : 'Mesa Presencial'}
        playerScore={Math.max(...players.map((p) => p.score))}
        activeStep={activeStep}
        rightExtra={
          phase === 'DEBATE' ? (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#59412F] bg-[#16100C] px-3 py-1.5 font-mono text-sm font-bold text-[#F3D590] tabular-nums">
              <Timer className="h-4 w-4" />
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
          ) : undefined
        }
      />

      <div className="border-x-2 border-[#59412F] bg-[#241912] p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* LEFT: TABLERO DE PISTAS */}
          <div className="lg:col-span-6">
            <CorkboardPanel
              clues={boardClues}
              notes={detectiveNotes}
              onAddNote={handleAddLocalNote}
            />
          </div>

          {/* RIGHT: SOSPECHOSOS — VOTACIÓN */}
          <div className="flex flex-col rounded-xl border-4 border-[#4A3424] bg-[#2D1F16] p-3 text-[#F5ECD8] shadow-inner lg:col-span-6">
            <div className="rounded-lg border border-[#6E5038] bg-[#201610] px-3 py-2 text-center">
              <h3 className="font-display text-base font-bold tracking-wider text-[#F5ECD8] uppercase">
                SOSPECHOSOS — VOTACIÓN
              </h3>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`${phase}-${activeIndex}-${voterReady ? 'open' : 'locked'}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="text-xs text-[#CBB799]"
                >
                  {phase === 'DEBATE'
                    ? 'Cada detective comparte una pista en voz alta. ¡Cuidado con el impostor!'
                    : phase === 'PASS_VOTE' && activePlayer
                    ? `Turno de voto secreto para ${activePlayer.name} (${activeIndex + 1}/${players.length})`
                    : 'Resultado final del caso'}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mt-3 flex-1 overflow-y-auto pr-0.5">
              <AnimatePresence mode="wait" initial={false}>
                {phase === 'PASS_VOTE' && activePlayer && !voterReady ? (
                  <motion.div
                    key={`pass-shield-${activeIndex}`}
                    initial={{ opacity: 0, y: 14, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.97 }}
                    transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-xl border-2 border-[#8C6A4A] bg-[#EFE6D5] p-5 text-center text-stone-900 shadow-md"
                  >
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#7C4D2B] text-white">
                      <Lock className="h-5 w-5" />
                    </div>
                    <p className="font-mono text-xs font-bold text-stone-600">
                      VOTO SECRETO {activeIndex + 1} DE {players.length}
                    </p>
                    <h4 className="mt-1 font-display text-xl font-bold">
                      Pasa el celular a {activePlayer.name}
                    </h4>
                    <p className="mt-1 text-xs text-stone-700">
                      Elige en secreto quién crees que no tuvo pistas del caso.
                    </p>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        soundFX.woodTap();
                        setVoterReady(true);
                      }}
                      className="mt-4 min-h-[48px] w-full rounded-xl bg-[#7C4D2B] px-4 font-display text-xs font-bold tracking-wider text-white uppercase hover:bg-[#643C1F]"
                    >
                      Soy {activePlayer.name} · Elegir sospechoso
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={
                      phase === 'PASS_VOTE'
                        ? `pass-ballot-${activeIndex}`
                        : `pass-list-${phase}`
                    }
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-2.5"
                  >
                    {phase === 'PASS_VOTE' && activePlayer && (
                      <div className="rounded-xl border-2 border-[#C88D4B] bg-[#362214] p-3 text-[#F5ECD8] shadow-md">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 shrink-0 text-[#F3D590]" />
                            <span className="font-display text-xs font-bold tracking-wider text-white uppercase">
                              Boleta Secreta de {activePlayer.name}
                            </span>
                          </div>
                          <span className="rounded bg-[#1C1008] px-2 py-0.5 font-mono text-[11px] font-bold text-[#F3D590] tabular-nums">
                            {activeIndex + 1}/{players.length}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#E7D8BE]">
                          Toca Votar en el sospechoso elegido. El celular volverá a bloquearse automáticamente.
                        </p>
                      </div>
                    )}

                    {phase === 'RESULTS' && (
                      <div className="space-y-3 rounded-xl border-2 border-[#8C6A4A] bg-[#EFE6D5] p-3.5 text-stone-900">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-700" />
                          <h4 className="font-display text-sm font-bold uppercase">
                            {caught
                              ? `¡Impostor descubierto! Era ${eliminatedPlayer?.name}`
                              : eliminatedPlayer
                              ? `${eliminatedPlayer.name} era inocente · Impostor: ${impostorNames}`
                              : `Empate · El impostor (${impostorNames}) escapa`}
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg border border-[#C6B393] bg-white p-2.5">
                            <span className="text-[11px] font-bold text-[#6E4423] uppercase">
                              Foto Detectives
                            </span>
                            <EvidenceArtwork
                              itemId={currentPair.detectiveItem.id}
                              className="mt-1 h-24 w-full"
                            />
                            <p className="mt-1 text-xs font-bold">{currentPair.detectiveItem.name}</p>
                          </div>
                          <div className="rounded-lg border border-amber-500 bg-amber-50 p-2.5">
                            <span className="text-[11px] font-bold text-amber-800 uppercase">
                              Foto Impostor
                            </span>
                            <EvidenceArtwork
                              itemId={currentPair.impostorItem.id}
                              className="mt-1 h-24 w-full"
                            />
                            <p className="mt-1 text-xs font-bold">{currentPair.impostorItem.name}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {players.map((p, idx) => {
                      const cluesByPlayer = boardClues.filter((c) => c.authorId === p.id);
                      const latestClue =
                        cluesByPlayer.length > 0
                          ? `Pista en tablero: "${cluesByPlayer[cluesByPlayer.length - 1].text}"`
                          : 'Sin pista fijada en tablero.';
                      const isImpReveal = phase === 'RESULTS' && impostorIds.includes(p.id);

                      return (
                        <SuspectDossierCard
                          key={p.id}
                          letter={letters[idx % letters.length]}
                          name={p.name}
                          color={p.color}
                          avatarId={p.avatarId}
                          roleLine={
                            isImpReveal
                              ? 'IMPOSTOR (Sin pistas)'
                              : phase === 'RESULTS'
                              ? 'Detective'
                              : 'Sospechoso'
                          }
                          clueLine={latestClue}
                          statusTag={
                            phase === 'RESULTS'
                              ? `${tally.get(p.id) ?? 0} votos · ${p.score} pts`
                              : `${p.score} pts`
                          }
                          canVote={phase === 'PASS_VOTE' && voterReady}
                          voteButtonLabel={`Votar por ${p.name}`}
                          onVote={() => handleVoteForTarget(p.id)}
                        />
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <BoardBottomBar
        objectiveText={
          phase === 'DEBATE'
            ? 'Compartan sus pistas en voz alta (y fíjenlas en el tablero) antes de votar.'
            : phase === 'PASS_VOTE'
            ? `Pasa el celular en secreto para votar (${Object.keys(votes).length}/${players.length}).`
            : `Ronda ${round}/${maxRounds} completada. ¡Listos para un caso nuevo!`
        }
        leftActionLabel={phase === 'RESULTS' ? 'Cambiar Jugadores' : '+ Añadir Pista al Tablero'}
        onLeftAction={() => {
          soundFX.woodTap();
          if (phase === 'RESULTS') {
            setPhase('SETUP');
          } else {
            setShowClueModal(true);
          }
        }}
        leftDisabled={phase === 'PASS_VOTE'}
        rightActionLabel={
          phase === 'DEBATE'
            ? 'Abrir Votación Secreta'
            : phase === 'RESULTS'
            ? round >= maxRounds
              ? 'Nueva Partida'
              : 'Siguiente Caso'
            : undefined
        }
        onRightAction={
          phase === 'DEBATE'
            ? handleStartVote
            : phase === 'RESULTS'
            ? () => (round >= maxRounds ? startRound(1, true) : startRound(round + 1, false))
            : undefined
        }
      />

      {showClueModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 sm:items-center sm:p-4">
          <form
            onSubmit={handlePinSpokenClue}
            className="w-full max-w-md rounded-t-2xl border-2 border-[#59412F] bg-[#241912] p-5 text-[#F5ECD8] shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-display text-base font-bold text-[#F3D590] uppercase">
                Fijar Pista en el Tablero
              </h4>
              <button
                type="button"
                onClick={() => setShowClueModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[#CBB799] hover:bg-[#332419]"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="mt-3 block text-xs font-semibold text-[#D6C3A3]">
              ¿Quién dio esta pista?
            </label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {players.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setClueAuthorId(p.id)}
                  className={`min-h-[36px] rounded-lg border px-3 text-xs font-semibold ${
                    clueAuthorId === p.id
                      ? 'border-[#C88D4B] bg-[#7C4D2B] text-white'
                      : 'border-[#59402E] bg-[#16100C] text-[#D6C3A3]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <textarea
              value={clueText}
              onChange={(e) => setClueText(e.target.value)}
              rows={3}
              maxLength={180}
              placeholder="Escribe la pista que compartió..."
              className="mt-3 w-full rounded-xl border border-[#59402E] bg-[#140E0A] p-3 text-sm text-[#F5ECD8] placeholder:text-[#8E7C64] focus:border-[#B6783C] focus:outline-none"
              autoFocus
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowClueModal(false)}
                className="min-h-[44px] rounded-lg border border-[#59402E] px-4 text-xs font-semibold text-[#D6C3A3]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!clueText.trim()}
                className="min-h-[44px] rounded-lg bg-[#7C4D2B] px-5 text-xs font-bold tracking-wide text-white uppercase hover:bg-[#643C1F] disabled:opacity-40"
              >
                Fijar en Tablero
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
