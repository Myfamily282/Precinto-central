import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Crown,
  Lock,
  LogOut,
  MessageSquare,
  Play,
  SearchCheck,
  Send,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { SPOT_DIFFERENCE_CASES } from '../data/spotDifferenceCases.ts';
import type { PrivateRolePayload, RoomPublicState, RoomSettings } from '../shared/types.ts';
import { soundFX } from '../utils/sound.ts';
import {
  BoardBottomBar,
  BoardHeader,
  CorkboardPanel,
  RoleIdentityCard,
  SuspectDossierCard,
} from './DetectiveBoardUI.tsx';
import { EvidenceArtwork } from './EvidenceArtwork.tsx';
import { SpotDifferenceGame } from './minigames/SpotDifferenceGame.tsx';
import { SuspectPortraitArtwork } from './SuspectPortraitArtwork.tsx';
import { TopSecretFolderReveal } from './TopSecretFolderReveal.tsx';

interface OnlineRoomViewProps {
  room: RoomPublicState;
  playerId: string;
  privateRole: PrivateRolePayload | null;
  connected: boolean;
  onUpdateSettings: (s: Partial<RoomSettings>) => void;
  onStartGame: () => void;
  onMarkReadyCard: () => void;
  onStartDescribe: () => void;
  onStartVote: () => void;
  onSendChat: (text: string, isClue?: boolean) => void;
  onAddClue: (text: string, title?: string) => void;
  onAddNote: (text: string) => void;
  onCastVote: (targetId: string) => void;
  onNextRound: () => void;
  onReturnLobby: () => void;
  onStartDuel: (caseId: string) => void;
  onSendDuelProgress: (found: number, total: number, finished: boolean) => void;
  onLeave: () => void;
}

export const OnlineRoomView: React.FC<OnlineRoomViewProps> = ({
  room,
  playerId,
  privateRole,
  connected,
  onUpdateSettings,
  onStartGame,
  onMarkReadyCard,
  onStartDescribe,
  onStartVote,
  onSendChat,
  onAddClue,
  onAddNote,
  onCastVote,
  onNextRound,
  onReturnLobby,
  onStartDuel,
  onSendDuelProgress,
  onLeave,
}) => {
  const isHost = room.hostId === playerId;
  const me = room.players.find((p) => p.id === playerId);

  const [copiedCode, setCopiedCode] = useState(false);
  const [chatText, setChatText] = useState('');
  const [peekCard, setPeekCard] = useState(true);
  const [turnSecondsLeft, setTurnSecondsLeft] = useState<number>(0);
  const [rightTab, setRightTab] = useState<'suspects' | 'chat'>('suspects');
  const [showClueModal, setShowClueModal] = useState(false);
  const [newClueText, setNewClueText] = useState('');
  const [showFolderReveal, setShowFolderReveal] = useState(false);
  const lastRevealedKeyRef = useRef<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPeekCard(room.mode === 'online');
    if (room.phase === 'VOTE' || room.phase === 'RESULTS') {
      setRightTab('suspects');
      setShowFolderReveal(false);
    }
  }, [room.phase, room.round, room.mode]);

  useEffect(() => {
    if (room.phase === 'LOBBY') {
      lastRevealedKeyRef.current = null;
      setShowFolderReveal(false);
      return;
    }
    if (room.phase === 'REVEAL_CARD' && privateRole) {
      const assignmentKey = `${room.round}-${privateRole.caseCode}-${privateRole.role}`;
      if (lastRevealedKeyRef.current !== assignmentKey) {
        lastRevealedKeyRef.current = assignmentKey;
        setShowFolderReveal(true);
      }
    }
  }, [room.phase, room.round, privateRole]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room.chatMessages.length]);

  useEffect(() => {
    if (!room.phaseEndsAt) {
      setTurnSecondsLeft(0);
      return;
    }
    const update = () => {
      const diff = Math.max(0, Math.ceil((room.phaseEndsAt! - Date.now()) / 1000));
      setTurnSecondsLeft(diff);
    };
    update();
    const id = window.setInterval(update, 500);
    return () => window.clearInterval(id);
  }, [room.phaseEndsAt]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopiedCode(true);
      soundFX.woodTap();
      setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    const isMyTurn =
      room.phase === 'DESCRIBE' && room.turnOrder[room.currentTurnIndex] === playerId;
    onSendChat(chatText, isMyTurn);
    setChatText('');
  };

  const handleSubmitBoardClue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClueText.trim()) return;
    soundFX.pinTack();
    onAddClue(newClueText.trim());
    setNewClueText('');
    setShowClueModal(false);
  };

  const currentTurnPlayerId = room.turnOrder[room.currentTurnIndex];
  const currentTurnPlayer = room.players.find((p) => p.id === currentTurnPlayerId);
  const votedCount = room.players.filter((p) => p.hasVoted).length;
  const readyCount = room.players.filter((p) => p.hasReadyCard).length;

  const activeStep: 1 | 2 | 3 | 4 =
    room.phase === 'REVEAL_CARD'
      ? 1
      : room.phase === 'DESCRIBE'
      ? 2
      : room.phase === 'VOTE'
      ? 3
      : 4;

  // LOBBY
  if (room.phase === 'LOBBY') {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D9C5A9] bg-[#FBF6EE] px-4 py-3 dark:border-[#4A3222] dark:bg-[#22160F]">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void handleCopyCode()}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-[#C8A67D] bg-[#EFE2CE] px-3.5 py-1.5 font-mono text-sm font-bold tracking-wider text-[#5C3A21] dark:border-[#7C4D2B] dark:bg-[#362214] dark:text-[#F3D590]"
            >
              <span>SALA {room.code}</span>
              {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-[#7A5E46] dark:text-[#C8B297]">
              <span>{room.mode === 'online' ? 'Online a distancia' : 'Presencial multi-celular'}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{room.players.length}/10 jugadores</span>
              <span aria-hidden="true">·</span>
              <span className={connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}>
                {connected ? 'Conectado' : 'Reconectando...'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onLeave}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#D4BC9C] px-3 py-1.5 text-xs font-semibold text-[#5C3A21] hover:bg-[#EFE2CE] dark:border-[#593C28] dark:text-[#EAD8BE] dark:hover:bg-[#332116]"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="space-y-4 rounded-2xl border border-[#D9C5A9] bg-[#FBF6EE] p-5 lg:col-span-7 dark:border-[#4A3222] dark:bg-[#22160F]">
            <div>
              <h2 className="font-display text-xl font-bold text-[#2E1C10] dark:text-[#FBF3E6]">
                Sala de Espera
              </h2>
              <p className="mt-1 text-xs text-[#7A5E46] dark:text-[#C8B297]">
                En cada ronda tocará un caso nuevo. Cada detective recibirá pistas distintas, y el impostor no tendrá pistas.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-[#DFCBB0] bg-[#F5ECE0] px-3 py-2 dark:border-[#4A3222] dark:bg-[#19100B]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="h-10 w-9 shrink-0 overflow-hidden rounded-lg border-2 bg-[#E8D9C3]"
                      style={{ borderColor: p.color }}
                    >
                      <SuspectPortraitArtwork avatarId={p.avatarId} className="h-full w-full" />
                    </div>
                    <span className="truncate text-sm font-semibold text-[#2E1C10] dark:text-[#FBF3E6]">
                      {p.name} {p.id === playerId ? '(Tú)' : ''}
                    </span>
                    {p.isHost && <Crown className="h-4 w-4 shrink-0 text-amber-500" />}
                  </div>
                  <span className="font-mono text-xs font-bold text-[#7A5E46] tabular-nums dark:text-[#C8B297]">
                    {p.score} pts
                  </span>
                </div>
              ))}
            </div>

            {isHost ? (
              <div className="space-y-4 border-t border-[#DFCBB0] pt-4 dark:border-[#4A3222]">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#7A5E46] dark:text-[#C8B297]">
                      Cantidad de Impostores
                    </label>
                    <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-xl bg-[#EFE2CE] p-1 dark:bg-[#19100B]">
                      {[1, 2].map((n) => (
                        <button
                          key={n}
                          type="button"
                          disabled={n === 2 && room.players.length < 6}
                          onClick={() => onUpdateSettings({ impostorCount: n as 1 | 2 })}
                          className={`min-h-[42px] rounded-lg text-xs font-semibold disabled:opacity-40 ${
                            room.settings.impostorCount === n
                              ? 'bg-[#7C4D2B] text-white shadow-sm dark:bg-[#8B5A2B]'
                              : 'text-[#6E4E37] dark:text-[#C8B297]'
                          }`}
                        >
                          {n} {n === 1 ? 'Impostor' : 'Impostores (6+)'}
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
                          onClick={() => onUpdateSettings({ maxRounds: r })}
                          className={`min-h-[42px] rounded-lg font-mono text-xs font-semibold ${
                            room.settings.maxRounds === r
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

                <div className="flex flex-col gap-2 sm:flex-row">
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onStartGame}
                    className="inline-flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5C3A21] via-[#8B5A2B] to-[#B6783C] px-5 text-sm font-bold text-white shadow-md shadow-[#5C3A21]/30 hover:brightness-110"
                  >
                    <Play className="h-4 w-4" />
                    Iniciar Investigación (3+ jug.)
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => onStartDuel(SPOT_DIFFERENCE_CASES[0].id)}
                    className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl border border-[#D4BC9C] bg-[#F5ECE0] px-4 text-sm font-semibold text-[#3D2414] hover:bg-[#EAD8BE] dark:border-[#593C28] dark:bg-[#2B1C12] dark:text-[#F5ECD8]"
                  >
                    <SearchCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    Duelo Diferencias
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[#DFCBB0] bg-[#F5ECE0] p-4 text-center text-xs font-medium text-[#7A5E46] dark:border-[#4A3222] dark:bg-[#19100B] dark:text-[#C8B297]">
                Esperando a que el jefe de sala inicie la partida...
              </div>
            )}
          </div>

          {/* Chat in Lobby */}
          <div className="flex h-[420px] flex-col rounded-2xl border border-[#D9C5A9] bg-[#FBF6EE] lg:col-span-5 dark:border-[#4A3222] dark:bg-[#22160F]">
            <div className="flex items-center justify-between border-b border-[#DFCBB0] px-4 py-3 dark:border-[#4A3222]">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#8B5A2B] dark:text-[#F3D590]" />
                <h3 className="font-display text-sm font-bold text-[#2E1C10] dark:text-[#FBF3E6]">
                  Chat de Sala
                </h3>
              </div>
              <span className="text-xs text-[#7A5E46] dark:text-[#C8B297]">En vivo</span>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
              {room.chatMessages.map((msg) =>
                msg.system ? (
                  <div
                    key={msg.id}
                    className="rounded-xl bg-[#EFE2CE] px-3 py-2 text-center text-xs font-medium text-[#6E4E37] dark:bg-[#19100B] dark:text-[#C8B297]"
                  >
                    {msg.text}
                  </div>
                ) : (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.senderId === playerId ? 'items-end' : 'items-start'}`}
                  >
                    <span className="mb-0.5 text-[11px] font-semibold text-[#7A5E46] dark:text-[#C8B297]">
                      {msg.senderName}
                    </span>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                        msg.senderId === playerId
                          ? 'bg-[#7C4D2B] text-white dark:bg-[#8B5A2B]'
                          : 'border border-[#DFCBB0] bg-[#F5ECE0] text-[#2E1C10] dark:border-[#4A3222] dark:bg-[#2E1E13] dark:text-[#F5ECD8]'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                )
              )}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={handleSendChat}
              className="flex items-center gap-2 border-t border-[#DFCBB0] p-3 dark:border-[#4A3222]"
            >
              <input
                type="text"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Saluda o coordina la partida..."
                className="min-h-[44px] flex-1 rounded-xl border border-[#D4BC9C] bg-[#F5ECE0] px-3 text-sm text-[#2E1C10] placeholder:text-[#9A7F64] focus:border-[#8B5A2B] focus:outline-none dark:border-[#593C28] dark:bg-[#19100B] dark:text-[#FBF3E6]"
              />
              <button
                type="submit"
                disabled={!chatText.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7C4D2B] text-white hover:bg-[#643C1F] disabled:opacity-40 dark:bg-[#8B5A2B]"
                aria-label="Enviar mensaje"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // MINIGAME DUEL
  if (room.phase === 'MINIGAME_DUEL') {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#D9C5A9] bg-[#FBF6EE] p-4 dark:border-[#4A3222] dark:bg-[#22160F]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-sm font-bold text-[#2E1C10] dark:text-[#FBF3E6]">
              Carrera en vivo · Sala {room.code}
            </h3>
            {isHost && (
              <button
                type="button"
                onClick={onReturnLobby}
                className="min-h-[38px] rounded-lg border border-[#D4BC9C] px-3 text-xs font-semibold text-[#5C3A21] dark:border-[#593C28] dark:text-[#EAD8BE]"
              >
                Volver al lobby
              </button>
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {room.players.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-[#DFCBB0] bg-[#F5ECE0] px-3 py-2 dark:border-[#4A3222] dark:bg-[#19100B]"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="truncate text-[#2E1C10] dark:text-[#FBF3E6]">{p.name}</span>
                  <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                    {p.duelFound}/{p.duelTotal}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#DFCBB0] dark:bg-[#3A2416]">
                  <div
                    className="h-full rounded-full bg-[#B6783C] transition-all"
                    style={{ width: `${(p.duelFound / Math.max(1, p.duelTotal)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <SpotDifferenceGame
          forcedCaseId={room.activeDuelCaseId}
          isDuel
          onProgress={onSendDuelProgress}
        />
      </div>
    );
  }

  // ACTIVE INVESTIGATOR BOARD INTERFACE (REVEAL_CARD | DESCRIBE | VOTE | RESULTS)
  const roleCardSlot = privateRole ? (
    <RoleIdentityCard
      role={privateRole.role}
      caseCode={privateRole.caseCode}
      caseTitle={privateRole.caseTitle}
      caseBriefing={privateRole.caseBriefing}
      item={privateRole.item}
      privateClues={privateRole.privateClues}
      peekCard={peekCard}
      onTogglePeek={() => setPeekCard((v) => !v)}
      onQuickShareClue={
        room.phase === 'DESCRIBE'
          ? (detail) => {
              soundFX.pinTack();
              onAddClue(detail);
            }
          : undefined
      }
      footerSlot={
        room.phase === 'REVEAL_CARD' ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-semibold text-white/90 tabular-nums">
              Listos: {readyCount}/{room.players.length}
            </span>
            <div className="flex flex-wrap gap-2">
              {!me?.hasReadyCard ? (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.woodTap();
                    onMarkReadyCard();
                  }}
                  className="min-h-[42px] rounded-lg bg-white px-4 text-xs font-bold text-slate-900 hover:bg-slate-100"
                >
                  Ya vi mi rol y pistas
                </button>
              ) : (
                <span className="rounded-lg bg-emerald-500/25 px-3 py-2 text-xs font-bold text-emerald-100">
                  Esperando equipo...
                </span>
              )}
              {isHost && (
                <button
                  type="button"
                  onClick={onStartDescribe}
                  className="min-h-[42px] rounded-lg border border-white/30 px-3 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Pasar a pistas ahora
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  soundFX.woodTap();
                  setShowFolderReveal(true);
                }}
                className="min-h-[42px] rounded-lg border border-amber-300/40 bg-amber-950/40 px-3 text-xs font-semibold text-[#F3D590] hover:bg-amber-900/50"
              >
                Abrir expediente
              </button>
            </div>
          </div>
        ) : undefined
      }
    />
  ) : null;

  const letters = 'ABCDEFGHIJ';

  const objectiveLabel =
    room.phase === 'REVEAL_CARD'
      ? 'Revisa si eres Detective o Impostor y confirma cuando estés listo.'
      : room.phase === 'DESCRIBE'
      ? currentTurnPlayer?.id === playerId
        ? 'Es tu turno: fija una pista en el tablero sin regalar tu objeto.'
        : `Turno de ${currentTurnPlayer?.name ?? 'Detective'} · Lee el tablero y compara las pistas.`
      : room.phase === 'VOTE'
      ? `Elige quién crees que es el Impostor (${votedCount}/${room.players.length} votos).`
      : 'Caso resuelto. Revisa quién era el impostor y avanza al siguiente caso.';

  return (
    <div className="overflow-hidden rounded-2xl shadow-2xl">
      <BoardHeader
        subtitle={`SALA ${room.code} · RONDA ${room.round}/${room.settings.maxRounds} · ${
          room.mode === 'online' ? 'ONLINE' : 'PRESENCIAL'
        }`}
        caseTitle={`${room.caseCode}: ${room.caseTitle.toUpperCase()}`}
        playerName={me?.name ?? 'Detective'}
        playerScore={me?.score ?? 0}
        activeStep={activeStep}
        rightExtra={
          <button
            type="button"
            onClick={onLeave}
            className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-[#59412F] bg-[#16100C] px-2.5 text-xs font-semibold text-[#D6C3A3] hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Salir
          </button>
        }
      />

      <div className="border-x-2 border-[#59412F] bg-[#241912] p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* LEFT: TABLERO DE PISTAS */}
          <div className="lg:col-span-6">
            <CorkboardPanel
              clues={room.boardClues}
              notes={room.detectiveNotes}
              topSlot={roleCardSlot}
              onAddNote={onAddNote}
            />
          </div>

          {/* RIGHT: SOSPECHOSOS — VOTACIÓN & CHAT */}
          <div className="flex flex-col rounded-xl border-4 border-[#4A3424] bg-[#2D1F16] p-3 text-[#F5ECD8] shadow-inner lg:col-span-6">
            <div className="rounded-lg border border-[#6E5038] bg-[#201610] px-3 py-2 text-center">
              <h3 className="font-display text-base font-bold tracking-wider text-[#F5ECD8] uppercase">
                SOSPECHOSOS — VOTACIÓN
              </h3>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`${room.phase}-${votedCount}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="text-xs text-[#CBB799]"
                >
                  {room.phase === 'DESCRIBE' && turnSecondsLeft > 0
                    ? `Turno de ${currentTurnPlayer?.name ?? ''} (${turnSecondsLeft}s)`
                    : room.phase === 'VOTE'
                    ? `Votación secreta activa · (${votedCount}/${room.players.length} votos)`
                    : 'Revisa las pistas compartidas por cada jugador'}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-lg bg-[#1C130E] p-1">
              <button
                type="button"
                onClick={() => {
                  soundFX.tabSwitch();
                  setRightTab('suspects');
                }}
                className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-md text-xs font-bold uppercase transition-colors ${
                  rightTab === 'suspects'
                    ? 'bg-[#7C4D2B] text-white'
                    : 'text-[#CBB799] hover:text-white'
                }`}
              >
                <Users className="h-4 w-4" />
                Sospechosos ({room.players.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.tabSwitch();
                  setRightTab('chat');
                }}
                className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-md text-xs font-bold uppercase transition-colors ${
                  rightTab === 'chat'
                    ? 'bg-[#7C4D2B] text-white'
                    : 'text-[#CBB799] hover:text-white'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Chat ({room.chatMessages.length})
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {rightTab === 'suspects' ? (
                <motion.div
                  key="tab-suspects"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-3 flex-1 space-y-2.5 overflow-y-auto pr-0.5"
                >
                  <AnimatePresence mode="wait">
                    {room.phase === 'VOTE' && (
                      <motion.div
                        key="online-secret-vote-banner"
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                        className="rounded-xl border-2 border-[#C88D4B] bg-[#362214] p-3 text-[#F5ECD8] shadow-md"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 shrink-0 text-[#F3D590]" />
                            <span className="font-display text-xs font-bold tracking-wider uppercase text-white">
                              Votación Secreta en Curso
                            </span>
                          </div>
                          <span className="rounded bg-[#1C1008] px-2 py-0.5 font-mono text-[11px] font-bold text-[#F3D590] tabular-nums">
                            {votedCount}/{room.players.length}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-[#E7D8BE]">
                          {me?.hasVoted
                            ? 'Tu voto secreto ya fue registrado. Esperando a los demás detectives...'
                            : 'Nadie verá por quién votas hasta que todos emitan su voto.'}
                        </p>
                      </motion.div>
                    )}

                    {room.phase === 'RESULTS' && room.revealedResult && (
                      <motion.div
                        key="online-results-banner"
                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-3 rounded-xl border-2 border-[#8C6A4A] bg-[#EFE6D5] p-3.5 text-stone-900"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-700" />
                          <h4 className="font-display text-sm font-bold uppercase">
                            {room.revealedResult.wasTie
                              ? 'Empate: El impostor escapa'
                              : room.revealedResult.wasImpostor
                              ? `¡Impostor atrapado! Era ${room.revealedResult.eliminatedPlayerName}`
                              : `${room.revealedResult.eliminatedPlayerName} era inocente`}
                          </h4>
                        </div>
                        <p className="text-xs font-semibold text-stone-700">
                          El impostor era:{' '}
                          <strong>
                            {room.players
                              .filter((p) => room.revealedResult!.impostorIds.includes(p.id))
                              .map((p) => p.name)
                              .join(', ')}
                          </strong>
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg border border-[#C6B393] bg-white p-2.5">
                            <span className="text-[11px] font-bold text-[#6E4423] uppercase">
                              Foto Detectives
                            </span>
                            <EvidenceArtwork
                              itemId={room.revealedResult.detectiveItem.id}
                              className="mt-1 h-24 w-full"
                            />
                            <p className="mt-1 text-xs font-bold">
                              {room.revealedResult.detectiveItem.name}
                            </p>
                          </div>
                          <div className="rounded-lg border border-amber-500 bg-amber-50 p-2.5">
                            <span className="text-[11px] font-bold text-amber-800 uppercase">
                              Foto Impostor
                            </span>
                            <EvidenceArtwork
                              itemId={room.revealedResult.impostorItem.id}
                              className="mt-1 h-24 w-full"
                            />
                            <p className="mt-1 text-xs font-bold">
                              {room.revealedResult.impostorItem.name}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {room.players.map((p, idx) => {
                    const playerClues = room.boardClues.filter((c) => c.authorId === p.id);
                    const latestClue =
                      playerClues.length > 0
                        ? `Pista en tablero: "${playerClues[playerClues.length - 1].text}"`
                        : room.phase === 'DESCRIBE' && currentTurnPlayerId === p.id
                        ? 'Turno activo: redactando pista...'
                        : 'Sin pista compartida aún.';

                    const isImpostorReveal =
                      room.phase === 'RESULTS' &&
                      room.revealedResult?.impostorIds.includes(p.id);
                    const votesReceived =
                      room.phase === 'RESULTS'
                        ? room.revealedResult?.voteBreakdown[p.id] ?? 0
                        : 0;

                    return (
                      <SuspectDossierCard
                        key={p.id}
                        letter={letters[idx % letters.length]}
                        name={`${p.name}${p.id === playerId ? ' (Tú)' : ''}`}
                        color={p.color}
                        avatarId={p.avatarId}
                        roleLine={
                          isImpostorReveal
                            ? 'IMPOSTOR (Sin pistas)'
                            : room.phase === 'RESULTS'
                            ? 'Detective'
                            : p.isHost
                            ? 'Jefe de Sala'
                            : 'Participante'
                        }
                        clueLine={latestClue}
                        statusTag={
                          room.phase === 'RESULTS'
                            ? `${votesReceived} votos · ${p.score} pts`
                            : p.hasVoted
                            ? 'Ya votó'
                            : `${p.score} pts`
                        }
                        canVote={room.phase === 'VOTE'}
                        voteDisabled={Boolean(me?.hasVoted)}
                        voteButtonLabel={me?.hasVoted ? 'Voto emitido' : `Votar por ${p.name}`}
                        onVote={() => onCastVote(p.id)}
                      />
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="tab-chat"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-3 flex h-[390px] flex-col rounded-lg border border-[#59402E] bg-[#19110C]"
                >
                <div className="flex-1 space-y-2 overflow-y-auto p-3">
                  {room.chatMessages.map((msg) =>
                    msg.system ? (
                      <div
                        key={msg.id}
                        className="rounded bg-[#2A1D15] px-2.5 py-1.5 text-center text-xs text-[#D6C3A3]"
                      >
                        {msg.text}
                      </div>
                    ) : (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.senderId === playerId ? 'items-end' : 'items-start'
                        }`}
                      >
                        <span className="mb-0.5 text-[11px] text-[#CBB799]">
                          {msg.senderName} {msg.isClue ? '· Pista' : ''}
                        </span>
                        <div
                          className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                            msg.senderId === playerId
                              ? 'bg-[#7C4D2B] text-white'
                              : 'border border-[#59402E] bg-[#2D1F16] text-[#F5ECD8]'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    )
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form
                  onSubmit={handleSendChat}
                  className="flex items-center gap-2 border-t border-[#59402E] p-2.5"
                >
                  <input
                    type="text"
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    placeholder="Escribe pista o mensaje..."
                    className="min-h-[44px] flex-1 rounded-lg border border-[#59402E] bg-[#120C08] px-3 text-sm text-[#F5ECD8] placeholder:text-[#8E7C64] focus:border-[#B6783C] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!chatText.trim()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#7C4D2B] text-white hover:bg-[#643C1F] disabled:opacity-40"
                    aria-label="Enviar"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <BoardBottomBar
        objectiveText={objectiveLabel}
        leftActionLabel="+ Añadir Pista al Tablero"
        onLeftAction={() => {
          soundFX.woodTap();
          setShowClueModal(true);
        }}
        leftDisabled={room.phase === 'RESULTS'}
        rightActionLabel={
          room.phase === 'RESULTS'
            ? isHost
              ? room.round >= room.settings.maxRounds
                ? 'Finalizar Partida'
                : 'Siguiente Caso'
              : 'Esperando Jefe'
            : room.phase === 'VOTE'
            ? `Votos: ${votedCount}/${room.players.length}`
            : isHost
            ? 'Abrir Votación Secreta'
            : 'Esperando Votación'
        }
        onRightAction={
          room.phase === 'RESULTS' && isHost
            ? onNextRound
            : (room.phase === 'DESCRIBE' || room.phase === 'REVEAL_CARD') && isHost
            ? onStartVote
            : undefined
        }
        rightDisabled={!isHost && room.phase !== 'RESULTS'}
      />

      {showClueModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 sm:items-center sm:p-4">
          <form
            onSubmit={handleSubmitBoardClue}
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
            <p className="mt-1 text-xs text-[#D6C3A3]">
              {privateRole?.role === 'impostor'
                ? 'Eres el Impostor: improvisa una pista convincente para no levantar sospechas.'
                : 'Comparte una pista sobre tu objeto o tus pistas privadas sin decir el nombre exacto.'}
            </p>
            <textarea
              value={newClueText}
              onChange={(e) => setNewClueText(e.target.value)}
              rows={3}
              maxLength={180}
              placeholder="Ej. Tiene piezas metálicas y se usa con una mano..."
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
                disabled={!newClueText.trim()}
                className="min-h-[44px] rounded-lg bg-[#7C4D2B] px-5 text-xs font-bold tracking-wide text-white uppercase hover:bg-[#643C1F] disabled:opacity-40"
              >
                Fijar en Tablero
              </button>
            </div>
          </form>
        </div>
      )}

      <AnimatePresence>
        {showFolderReveal && privateRole && (
          <TopSecretFolderReveal
            key={`modal-folder-${room.round}-${privateRole.caseCode}-${privateRole.role}`}
            variant="modal"
            role={privateRole.role}
            playerName={me?.name}
            caseCode={privateRole.caseCode}
            caseTitle={privateRole.caseTitle}
            caseBriefing={privateRole.caseBriefing}
            item={privateRole.item}
            privateClues={privateRole.privateClues}
            requireTapToOpen={room.mode === 'local_multi'}
            primaryActionLabel={
              room.phase === 'REVEAL_CARD' && !me?.hasReadyCard
                ? 'Confirmar rol e ir al tablero'
                : 'Ir al tablero'
            }
            onPrimaryAction={() => {
              soundFX.click();
              if (room.phase === 'REVEAL_CARD' && !me?.hasReadyCard) {
                onMarkReadyCard();
              }
              setPeekCard(true);
              setShowFolderReveal(false);
            }}
            secondaryActionLabel="Ocultar expediente"
            onSecondaryAction={() => {
              soundFX.click();
              setShowFolderReveal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
