import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocket, WebSocketServer } from 'ws';
import {
  createInitialRoundHistory,
  generateUniqueRoundSetup,
  type RoundHistoryTracker,
} from './src/utils/roundGenerator.ts';
import type {
  BoardClue,
  ChatMessage,
  ClientEvent,
  DetectiveNote,
  EvidencePair,
  GameMode,
  PrivateClue,
  PrivateRolePayload,
  PublicPlayer,
  RoomPhase,
  RoomPublicState,
  RoomResults,
  RoomSettings,
  ServerEvent,
} from './src/shared/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface InternalPlayer extends PublicPlayer {
  ws: WebSocket | null;
}

interface InternalRoom {
  code: string;
  mode: GameMode;
  hostId: string;
  phase: RoomPhase;
  round: number;
  settings: RoomSettings;
  players: Map<string, InternalPlayer>;
  chatMessages: ChatMessage[];
  boardClues: BoardClue[];
  detectiveNotes: DetectiveNote[];
  turnOrder: string[];
  currentTurnIndex: number;
  phaseEndsAt: number | null;
  roundHistory: RoundHistoryTracker;
  currentPair: EvidencePair | null;
  impostorIds: Set<string>;
  playerClues: Map<string, PrivateClue[]>;
  votes: Map<string, string>; // voterId -> targetId
  revealedResult: RoomResults | null;
  activeDuelCaseId: string | null;
  duelWinnerAnnounced: boolean;
  lastActivity: number;
}

interface SocketSession {
  roomCode: string | null;
  playerId: string | null;
}

const rooms = new Map<string, InternalRoom>();
const socketSessions = new WeakMap<WebSocket, SocketSession>();

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomCode(): string {
  for (let attempt = 0; attempt < 20; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    if (!rooms.has(code)) return code;
  }
  return `P${Date.now().toString(36).slice(-5).toUpperCase()}`;
}

function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function sendEvent(ws: WebSocket | null, event: ServerEvent) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(event));
}

function toPublicRoom(room: InternalRoom): RoomPublicState {
  const players: PublicPlayer[] = Array.from(room.players.values()).map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    avatarId: p.avatarId,
    isHost: p.isHost,
    connected: p.connected,
    score: p.score,
    hasVoted: p.hasVoted,
    hasReadyCard: p.hasReadyCard,
    duelFound: p.duelFound,
    duelTotal: p.duelTotal,
    duelFinishedAt: p.duelFinishedAt,
  }));

  return {
    code: room.code,
    mode: room.mode,
    hostId: room.hostId,
    phase: room.phase,
    round: room.round,
    caseCode: room.currentPair ? room.currentPair.caseCode : 'CASO #000',
    caseTitle: room.currentPair ? room.currentPair.title : 'Expediente Abierto',
    caseDescription: room.currentPair
      ? room.currentPair.caseDescription
      : 'Esperando asignación de caso policial.',
    settings: room.settings,
    players,
    chatMessages: room.chatMessages.slice(-80),
    boardClues: room.boardClues,
    detectiveNotes: room.detectiveNotes.slice(-12),
    turnOrder: room.turnOrder,
    currentTurnIndex: room.currentTurnIndex,
    phaseEndsAt: room.phaseEndsAt,
    revealedResult: room.revealedResult,
    activeDuelCaseId: room.activeDuelCaseId,
  };
}

function broadcastRoomState(room: InternalRoom) {
  room.lastActivity = Date.now();
  const payload: ServerEvent = { type: 'room:state', room: toPublicRoom(room) };
  for (const player of room.players.values()) {
    sendEvent(player.ws, payload);
  }
}

function addSystemMessage(room: InternalRoom, text: string) {
  const msg: ChatMessage = {
    id: generateId('sys'),
    senderId: 'system',
    senderName: 'Precinto',
    senderColor: '#64748B',
    text,
    timestamp: Date.now(),
    system: true,
  };
  room.chatMessages.push(msg);
  if (room.chatMessages.length > 100) {
    room.chatMessages = room.chatMessages.slice(-80);
  }
  const event: ServerEvent = { type: 'chat:message', message: msg };
  for (const player of room.players.values()) {
    sendEvent(player.ws, event);
  }
}

function sendPrivateRole(room: InternalRoom, player: InternalPlayer) {
  if (!room.currentPair) return;
  const isImpostor = room.impostorIds.has(player.id);
  const payload: PrivateRolePayload = {
    round: room.round,
    role: isImpostor ? 'impostor' : 'detective',
    caseCode: room.currentPair.caseCode,
    caseTitle: room.currentPair.title,
    caseDescription: room.currentPair.caseDescription,
    caseBriefing: isImpostor
      ? room.currentPair.impostorBriefing
      : room.currentPair.detectiveBriefing,
    item: isImpostor ? room.currentPair.impostorItem : room.currentPair.detectiveItem,
    privateClues: isImpostor ? [] : room.playerClues.get(player.id) ?? [],
  };
  sendEvent(player.ws, { type: 'role:assigned', payload });
}

function startImpostorRound(room: InternalRoom, incrementRound: boolean) {
  const playerIds = Array.from(room.players.keys());
  const setup = generateUniqueRoundSetup({
    playerIds,
    impostorCount: room.settings.impostorCount,
    history: room.roundHistory,
  });

  room.roundHistory = setup.nextHistory;
  const picked = setup.pair;

  room.currentPair = picked;
  room.round = incrementRound ? room.round + 1 : 1;
  room.phase = 'REVEAL_CARD';
  room.votes.clear();
  room.revealedResult = null;
  room.activeDuelCaseId = null;
  room.boardClues = [
    {
      id: generateId('clue'),
      authorId: 'system',
      authorName: 'Comisaría',
      authorColor: '#3B82F6',
      title: `${picked.caseCode}: ${picked.title.toUpperCase()}`,
      text: picked.caseDescription,
      timestamp: Date.now(),
    },
  ];
  room.detectiveNotes = [
    {
      id: generateId('note'),
      authorName: 'Comisaría',
      text: `Cada detective recibió pistas exclusivas distintas. El impostor no tiene pistas.`,
      timestamp: Date.now(),
    },
  ];

  room.impostorIds = new Set(setup.impostorIds);
  room.playerClues = setup.playerClues;
  room.turnOrder = setup.turnOrder;
  room.currentTurnIndex = 0;
  room.phaseEndsAt = null;

  for (const player of room.players.values()) {
    player.hasVoted = false;
    player.hasReadyCard = false;
    sendPrivateRole(room, player);
  }

  addSystemMessage(room, `Ronda ${room.round} iniciada. Revisa tu tarjeta de evidencia en secreto.`);
  broadcastRoomState(room);
}

function finalizeVote(room: InternalRoom) {
  if (!room.currentPair) return;
  const tally = new Map<string, number>();
  const voterChoices: Array<{ voterName: string; targetName: string }> = [];

  for (const [voterId, targetId] of room.votes.entries()) {
    tally.set(targetId, (tally.get(targetId) ?? 0) + 1);
    const voter = room.players.get(voterId);
    const target = room.players.get(targetId);
    if (voter && target) {
      voterChoices.push({ voterName: voter.name, targetName: target.name });
    }
  }

  let maxVotes = 0;
  let topTargets: string[] = [];
  for (const [targetId, count] of tally.entries()) {
    if (count > maxVotes) {
      maxVotes = count;
      topTargets = [targetId];
    } else if (count === maxVotes) {
      topTargets.push(targetId);
    }
  }

  const wasTie = topTargets.length !== 1 || maxVotes === 0;
  const eliminatedId = wasTie ? null : topTargets[0];
  const eliminatedPlayer = eliminatedId ? room.players.get(eliminatedId) ?? null : null;
  const wasImpostor = eliminatedId ? room.impostorIds.has(eliminatedId) : false;

  if (wasImpostor) {
    for (const player of room.players.values()) {
      if (!room.impostorIds.has(player.id)) {
        const votedRight = room.votes.get(player.id) === eliminatedId;
        player.score += votedRight ? 100 : 50;
      }
    }
  } else {
    for (const impostorId of room.impostorIds) {
      const imp = room.players.get(impostorId);
      if (imp) imp.score += 150;
    }
  }

  const voteBreakdown: Record<string, number> = {};
  for (const [id, count] of tally.entries()) {
    voteBreakdown[id] = count;
  }

  room.revealedResult = {
    eliminatedPlayerId: eliminatedId,
    eliminatedPlayerName: eliminatedPlayer ? eliminatedPlayer.name : null,
    wasTie,
    wasImpostor,
    impostorIds: Array.from(room.impostorIds),
    detectiveItem: room.currentPair.detectiveItem,
    impostorItem: room.currentPair.impostorItem,
    voteBreakdown,
    voterChoices,
  };
  room.phase = 'RESULTS';
  room.phaseEndsAt = null;

  if (wasTie) {
    addSystemMessage(room, 'Hubo empate en la votación. El impostor escapa esta ronda.');
  } else if (wasImpostor && eliminatedPlayer) {
    addSystemMessage(room, `¡Caso resuelto! ${eliminatedPlayer.name} era el impostor.`);
  } else if (eliminatedPlayer) {
    addSystemMessage(room, `${eliminatedPlayer.name} era inocente. El impostor logró engañar al equipo.`);
  }

  broadcastRoomState(room);
}

function handleClientMessage(ws: WebSocket, raw: string) {
  let msg: ClientEvent;
  try {
    msg = JSON.parse(raw) as ClientEvent;
  } catch {
    sendEvent(ws, { type: 'error', message: 'Mensaje inválido.' });
    return;
  }

  const session = socketSessions.get(ws) ?? { roomCode: null, playerId: null };

  switch (msg.type) {
    case 'room:create': {
      const cleanName = msg.name.trim().slice(0, 18) || 'Detective';
      const code = generateRoomCode();
      const playerId = generateId('p');
      const player: InternalPlayer = {
        id: playerId,
        name: cleanName,
        color: msg.color || '#2563EB',
        avatarId: msg.avatarId || 'av_1',
        isHost: true,
        connected: true,
        score: 0,
        hasVoted: false,
        hasReadyCard: false,
        duelFound: 0,
        duelTotal: 6,
        duelFinishedAt: null,
        ws,
      };
      const room: InternalRoom = {
        code,
        mode: msg.mode,
        hostId: playerId,
        phase: 'LOBBY',
        round: 0,
        settings: {
          impostorCount: 1,
          maxRounds: 3,
          turnSeconds: 45,
        },
        players: new Map([[playerId, player]]),
        chatMessages: [],
        boardClues: [],
        detectiveNotes: [],
        turnOrder: [],
        currentTurnIndex: 0,
        phaseEndsAt: null,
        roundHistory: createInitialRoundHistory(),
        currentPair: null,
        impostorIds: new Set(),
        playerClues: new Map(),
        votes: new Map(),
        revealedResult: null,
        activeDuelCaseId: null,
        duelWinnerAnnounced: false,
        lastActivity: Date.now(),
      };
      rooms.set(code, room);
      socketSessions.set(ws, { roomCode: code, playerId });
      addSystemMessage(
        room,
        `${cleanName} abrió la sala ${code} (${msg.mode === 'online' ? 'Online' : 'Presencial multi-celular'}).`
      );
      sendEvent(ws, { type: 'session:joined', playerId, room: toPublicRoom(room) });
      break;
    }

    case 'room:join': {
      const code = msg.code.trim().toUpperCase();
      const room = rooms.get(code);
      if (!room) {
        sendEvent(ws, { type: 'error', message: `No existe ninguna sala con el código ${code}.` });
        return;
      }
      if (room.players.size >= 10) {
        sendEvent(ws, { type: 'error', message: 'La sala está llena (máximo 10 detectives).' });
        return;
      }
      const cleanName = msg.name.trim().slice(0, 18) || `Detective ${room.players.size + 1}`;
      const playerId = generateId('p');
      const player: InternalPlayer = {
        id: playerId,
        name: cleanName,
        color: msg.color || '#D97706',
        avatarId: msg.avatarId || `av_${((room.players.size) % 8) + 1}`,
        isHost: false,
        connected: true,
        score: 0,
        hasVoted: false,
        hasReadyCard: false,
        duelFound: 0,
        duelTotal: 6,
        duelFinishedAt: null,
        ws,
      };
      room.players.set(playerId, player);
      socketSessions.set(ws, { roomCode: code, playerId });
      addSystemMessage(room, `${cleanName} ingresó a la comisaría.`);
      sendEvent(ws, { type: 'session:joined', playerId, room: toPublicRoom(room) });
      broadcastRoomState(room);
      break;
    }

    case 'room:reconnect': {
      const code = msg.code.trim().toUpperCase();
      const room = rooms.get(code);
      if (!room) {
        sendEvent(ws, { type: 'error', message: 'La sala ya expiró o fue cerrada.' });
        return;
      }
      const existing = room.players.get(msg.playerId);
      if (!existing) {
        sendEvent(ws, { type: 'error', message: 'Tu sesión anterior expiró. Vuelve a unirte con el código.' });
        return;
      }
      existing.ws = ws;
      existing.connected = true;
      socketSessions.set(ws, { roomCode: code, playerId: existing.id });
      sendEvent(ws, { type: 'session:joined', playerId: existing.id, room: toPublicRoom(room) });
      if (room.phase !== 'LOBBY' && room.phase !== 'MINIGAME_DUEL') {
        sendPrivateRole(room, existing);
      }
      broadcastRoomState(room);
      break;
    }

    case 'room:update_settings': {
      if (!session.roomCode || !session.playerId) return;
      const room = rooms.get(session.roomCode);
      if (!room || room.hostId !== session.playerId) return;
      room.settings = {
        ...room.settings,
        ...msg.settings,
      };
      broadcastRoomState(room);
      break;
    }

    case 'room:leave': {
      if (!session.roomCode || !session.playerId) return;
      const room = rooms.get(session.roomCode);
      if (!room) return;
      const leaving = room.players.get(session.playerId);
      room.players.delete(session.playerId);
      socketSessions.set(ws, { roomCode: null, playerId: null });
      if (room.players.size === 0) {
        rooms.delete(room.code);
        return;
      }
      if (room.hostId === session.playerId) {
        const nextHost = room.players.values().next().value;
        if (nextHost) {
          nextHost.isHost = true;
          room.hostId = nextHost.id;
          addSystemMessage(room, `${nextHost.name} ahora es el jefe de sala.`);
        }
      }
      if (leaving) {
        addSystemMessage(room, `${leaving.name} salió de la sala.`);
      }
      broadcastRoomState(room);
      break;
    }

    case 'game:start': {
      if (!session.roomCode || !session.playerId) return;
      const room = rooms.get(session.roomCode);
      if (!room || room.hostId !== session.playerId) return;
      if (room.players.size < 3) {
        sendEvent(ws, {
          type: 'error',
          message: 'Se necesitan al menos 3 jugadores para iniciar El Impostor. Con 2 jugadores pueden probar Duelo de Escena del Crimen.',
        });
        return;
      }
      for (const p of room.players.values()) {
        p.score = 0;
      }
      startImpostorRound(room, false);
      break;
    }

    case 'game:ready_card': {
      if (!session.roomCode || !session.playerId) return;
      const room = rooms.get(session.roomCode);
      if (!room || room.phase !== 'REVEAL_CARD') return;
      const player = room.players.get(session.playerId);
      if (!player) return;
      player.hasReadyCard = true;
      const connectedPlayers = Array.from(room.players.values()).filter((p) => p.connected);
      const allReady = connectedPlayers.length > 0 && connectedPlayers.every((p) => p.hasReadyCard);
      if (allReady) {
        room.phase = 'DESCRIBE';
        room.phaseEndsAt = Date.now() + room.settings.turnSeconds * 1000;
        addSystemMessage(room, 'Todos vieron su evidencia. Comienza la ronda de pistas en el chat o en voz.');
      }
      broadcastRoomState(room);
      break;
    }

    case 'game:start_describe': {
      if (!session.roomCode || !session.playerId) return;
      const room = rooms.get(session.roomCode);
      if (!room || room.hostId !== session.playerId) return;
      room.phase = 'DESCRIBE';
      room.phaseEndsAt = Date.now() + room.settings.turnSeconds * 1000;
      addSystemMessage(room, 'Comienza la fase de pistas. Describan su foto sin dar detalles demasiado obvios.');
      broadcastRoomState(room);
      break;
    }

    case 'game:start_vote': {
      if (!session.roomCode || !session.playerId) return;
      const room = rooms.get(session.roomCode);
      if (!room || room.hostId !== session.playerId) return;
      room.phase = 'VOTE';
      room.votes.clear();
      room.phaseEndsAt = null;
      for (const p of room.players.values()) {
        p.hasVoted = false;
      }
      addSystemMessage(room, 'Votación secreta abierta. Elige quién crees que es el impostor.');
      broadcastRoomState(room);
      break;
    }

    case 'chat:send': {
      if (!session.roomCode || !session.playerId) return;
      const room = rooms.get(session.roomCode);
      if (!room) return;
      const player = room.players.get(session.playerId);
      if (!player) return;
      const text = msg.text.trim().slice(0, 220);
      if (!text) return;

      const isCurrentTurn =
        room.phase === 'DESCRIBE' && room.turnOrder[room.currentTurnIndex] === player.id;
      const message: ChatMessage = {
        id: generateId('msg'),
        senderId: player.id,
        senderName: player.name,
        senderColor: player.color,
        text,
        timestamp: Date.now(),
        isClue: Boolean(msg.isClue || isCurrentTurn),
      };
      room.chatMessages.push(message);
      if (room.chatMessages.length > 100) {
        room.chatMessages = room.chatMessages.slice(-80);
      }

      const event: ServerEvent = { type: 'chat:message', message };
      for (const p of room.players.values()) {
        sendEvent(p.ws, event);
      }

      if (isCurrentTurn && room.turnOrder.length > 0) {
        room.boardClues.push({
          id: generateId('clue'),
          authorId: player.id,
          authorName: player.name,
          authorColor: player.color,
          title: `PISTA ${room.boardClues.length}: ${player.name.toUpperCase()}`,
          text,
          timestamp: Date.now(),
        });
        room.currentTurnIndex = (room.currentTurnIndex + 1) % room.turnOrder.length;
        room.phaseEndsAt = Date.now() + room.settings.turnSeconds * 1000;
        broadcastRoomState(room);
      } else if (msg.isClue) {
        room.boardClues.push({
          id: generateId('clue'),
          authorId: player.id,
          authorName: player.name,
          authorColor: player.color,
          title: `PISTA ${room.boardClues.length}: ${player.name.toUpperCase()}`,
          text,
          timestamp: Date.now(),
        });
        broadcastRoomState(room);
      }
      break;
    }

    case 'clue:add': {
      if (!session.roomCode || !session.playerId) return;
      const room = rooms.get(session.roomCode);
      if (!room) return;
      const player = room.players.get(session.playerId);
      if (!player) return;
      const text = msg.text.trim().slice(0, 180);
      if (!text) return;

      const clueTitle =
        msg.title?.trim().slice(0, 40) ||
        `PISTA ${room.boardClues.length}: ${player.name.toUpperCase()}`;
      room.boardClues.push({
        id: generateId('clue'),
        authorId: player.id,
        authorName: player.name,
        authorColor: player.color,
        title: clueTitle,
        text,
        timestamp: Date.now(),
      });

      const chatMsg: ChatMessage = {
        id: generateId('msg'),
        senderId: player.id,
        senderName: player.name,
        senderColor: player.color,
        text,
        timestamp: Date.now(),
        isClue: true,
      };
      room.chatMessages.push(chatMsg);
      const event: ServerEvent = { type: 'chat:message', message: chatMsg };
      for (const p of room.players.values()) {
        sendEvent(p.ws, event);
      }

      if (room.phase === 'DESCRIBE' && room.turnOrder[room.currentTurnIndex] === player.id) {
        room.currentTurnIndex = (room.currentTurnIndex + 1) % room.turnOrder.length;
        room.phaseEndsAt = Date.now() + room.settings.turnSeconds * 1000;
      }
      broadcastRoomState(room);
      break;
    }

    case 'note:add': {
      if (!session.roomCode || !session.playerId) return;
      const room = rooms.get(session.roomCode);
      if (!room) return;
      const player = room.players.get(session.playerId);
      if (!player) return;
      const text = msg.text.trim().slice(0, 140);
      if (!text) return;

      room.detectiveNotes.push({
        id: generateId('note'),
        authorName: player.name,
        text,
        timestamp: Date.now(),
      });
      broadcastRoomState(room);
      break;
    }

    case 'vote:cast': {
      if (!session.roomCode || !session.playerId) return;
      const room = rooms.get(session.roomCode);
      if (!room || room.phase !== 'VOTE') return;
      const voter = room.players.get(session.playerId);
      if (!voter || voter.hasVoted) return;
      if (!room.players.has(msg.targetPlayerId)) return;

      room.votes.set(voter.id, msg.targetPlayerId);
      voter.hasVoted = true;

      const activePlayers = Array.from(room.players.values()).filter((p) => p.connected);
      const allVoted = activePlayers.length > 0 && activePlayers.every((p) => p.hasVoted);
      if (allVoted) {
        finalizeVote(room);
      } else {
        broadcastRoomState(room);
      }
      break;
    }

    case 'game:next_round': {
      if (!session.roomCode || !session.playerId) return;
      const room = rooms.get(session.roomCode);
      if (!room || room.hostId !== session.playerId) return;
      if (room.round >= room.settings.maxRounds) {
        room.phase = 'LOBBY';
        room.round = 0;
        room.revealedResult = null;
        addSystemMessage(room, 'Partida finalizada. ¡Pueden iniciar una nueva cuando quieran!');
        broadcastRoomState(room);
        return;
      }
      startImpostorRound(room, true);
      break;
    }

    case 'game:return_lobby': {
      if (!session.roomCode || !session.playerId) return;
      const room = rooms.get(session.roomCode);
      if (!room || room.hostId !== session.playerId) return;
      room.phase = 'LOBBY';
      room.revealedResult = null;
      room.activeDuelCaseId = null;
      broadcastRoomState(room);
      break;
    }

    case 'duel:start': {
      if (!session.roomCode || !session.playerId) return;
      const room = rooms.get(session.roomCode);
      if (!room || room.hostId !== session.playerId) return;
      room.phase = 'MINIGAME_DUEL';
      room.activeDuelCaseId = msg.caseId;
      room.duelWinnerAnnounced = false;
      for (const p of room.players.values()) {
        p.duelFound = 0;
        p.duelTotal = 6;
        p.duelFinishedAt = null;
      }
      addSystemMessage(room, 'Duelo de Escena del Crimen iniciado: ¡encuentra las 6 diferencias primero!');
      broadcastRoomState(room);
      break;
    }

    case 'duel:progress': {
      if (!session.roomCode || !session.playerId) return;
      const room = rooms.get(session.roomCode);
      if (!room || room.phase !== 'MINIGAME_DUEL') return;
      const player = room.players.get(session.playerId);
      if (!player) return;
      player.duelFound = msg.found;
      player.duelTotal = msg.total;
      if (msg.finished && !player.duelFinishedAt) {
        player.duelFinishedAt = Date.now();
        if (!room.duelWinnerAnnounced) {
          room.duelWinnerAnnounced = true;
          player.score += 80;
          addSystemMessage(room, `🏆 ${player.name} completó la escena del crimen primero (+80 pts).`);
        }
      }
      broadcastRoomState(room);
      break;
    }
  }
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  app.use(express.json());

  app.use('/api', (_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, activeRooms: rooms.size });
  });

  wss.on('connection', (ws) => {
    socketSessions.set(ws, { roomCode: null, playerId: null });

    ws.on('message', (data) => {
      handleClientMessage(ws, data.toString());
    });

    ws.on('close', () => {
      const session = socketSessions.get(ws);
      if (!session?.roomCode || !session.playerId) return;
      const room = rooms.get(session.roomCode);
      if (!room) return;
      const player = room.players.get(session.playerId);
      if (player && player.ws === ws) {
        player.connected = false;
        player.ws = null;
        broadcastRoomState(room);
      }
    });
  });

  // Periodic cleanup of stale rooms (> 3 hours inactive)
  setInterval(() => {
    const cutoff = Date.now() - 3 * 60 * 60 * 1000;
    for (const [code, room] of rooms.entries()) {
      if (room.lastActivity < cutoff) {
        rooms.delete(code);
      }
    }
  }, 15 * 60 * 1000);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  server.listen(port, '0.0.0.0', () => {
    console.log(`Precinto Central server listening on http://0.0.0.0:${port}`);
  });
}

void startServer();
