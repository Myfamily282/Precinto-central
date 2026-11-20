export type GameMode = 'online' | 'local_multi';

export type RoomPhase =
  | 'LOBBY'
  | 'REVEAL_CARD'
  | 'DESCRIBE'
  | 'VOTE'
  | 'RESULTS'
  | 'MINIGAME_DUEL';

export type PlayerRole = 'detective' | 'impostor';

export interface EvidenceItem {
  id: string;
  name: string;
  category: string;
  subtleHint: string;
}

export interface PrivateClue {
  id: string;
  title: string;
  detail: string;
}

export interface EvidencePair {
  id: string;
  caseCode: string;
  title: string;
  caseDescription: string;
  detectiveBriefing: string;
  impostorBriefing: string;
  detectiveItem: EvidenceItem;
  impostorItem: EvidenceItem;
  cluesPool: PrivateClue[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  text: string;
  timestamp: number;
  isClue?: boolean;
  system?: boolean;
}

export interface PublicPlayer {
  id: string;
  name: string;
  color: string;
  avatarId: string;
  isHost: boolean;
  connected: boolean;
  score: number;
  hasVoted: boolean;
  hasReadyCard: boolean;
  duelFound: number;
  duelTotal: number;
  duelFinishedAt: number | null;
}

export interface RoomSettings {
  impostorCount: 1 | 2;
  maxRounds: number;
  turnSeconds: number;
}

export interface RoomResults {
  eliminatedPlayerId: string | null;
  eliminatedPlayerName: string | null;
  wasTie: boolean;
  wasImpostor: boolean;
  impostorIds: string[];
  detectiveItem: EvidenceItem;
  impostorItem: EvidenceItem;
  voteBreakdown: Record<string, number>;
  voterChoices: Array<{ voterName: string; targetName: string }>;
}

export interface BoardClue {
  id: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  title: string;
  text: string;
  timestamp: number;
}

export interface DetectiveNote {
  id: string;
  authorName: string;
  text: string;
  timestamp: number;
}

export interface RoomPublicState {
  code: string;
  mode: GameMode;
  hostId: string;
  phase: RoomPhase;
  round: number;
  caseCode: string;
  caseTitle: string;
  caseDescription: string;
  settings: RoomSettings;
  players: PublicPlayer[];
  chatMessages: ChatMessage[];
  boardClues: BoardClue[];
  detectiveNotes: DetectiveNote[];
  turnOrder: string[];
  currentTurnIndex: number;
  phaseEndsAt: number | null;
  revealedResult: RoomResults | null;
  activeDuelCaseId: string | null;
}

export interface PrivateRolePayload {
  round: number;
  role: PlayerRole;
  caseCode: string;
  caseTitle: string;
  caseDescription: string;
  caseBriefing: string;
  item: EvidenceItem;
  privateClues: PrivateClue[];
}

export type ClientEvent =
  | { type: 'room:create'; name: string; color: string; avatarId: string; mode: GameMode }
  | { type: 'room:join'; code: string; name: string; color: string; avatarId: string }
  | { type: 'room:reconnect'; code: string; playerId: string }
  | { type: 'room:update_settings'; settings: Partial<RoomSettings> }
  | { type: 'room:leave' }
  | { type: 'game:start' }
  | { type: 'game:ready_card' }
  | { type: 'game:start_describe' }
  | { type: 'game:start_vote' }
  | { type: 'game:next_round' }
  | { type: 'game:return_lobby' }
  | { type: 'chat:send'; text: string; isClue?: boolean }
  | { type: 'clue:add'; text: string; title?: string }
  | { type: 'note:add'; text: string }
  | { type: 'vote:cast'; targetPlayerId: string }
  | { type: 'duel:start'; caseId: string }
  | { type: 'duel:progress'; found: number; total: number; finished: boolean };

export type ServerEvent =
  | { type: 'session:joined'; playerId: string; room: RoomPublicState }
  | { type: 'room:state'; room: RoomPublicState }
  | { type: 'role:assigned'; payload: PrivateRolePayload }
  | { type: 'chat:message'; message: ChatMessage }
  | { type: 'error'; message: string };
