import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ClientEvent,
  GameMode,
  PrivateRolePayload,
  RoomPublicState,
  RoomSettings,
  ServerEvent,
} from '../shared/types.ts';
import { soundFX } from '../utils/sound.ts';

const SESSION_KEY = 'precinto_ws_session';
const SERVER_URL_KEY = 'precinto_server_url';

export function normalizeServerOrigin(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return '';

  let candidate = trimmed;
  if (candidate.startsWith('wss://')) {
    candidate = `https://${candidate.slice(6)}`;
  } else if (candidate.startsWith('ws://')) {
    candidate = `http://${candidate.slice(5)}`;
  } else if (!candidate.startsWith('https://') && !candidate.startsWith('http://')) {
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    return parsed.origin;
  } catch {
    return candidate.replace(/\/ws$/, '');
  }
}

export function toWebSocketUrl(origin: string): string {
  const clean = normalizeServerOrigin(origin);
  if (!clean) return '';
  if (clean.startsWith('https://')) return `wss://${clean.slice(8)}/ws`;
  if (clean.startsWith('http://')) return `ws://${clean.slice(7)}/ws`;
  return `wss://${clean}/ws`;
}

function readStoredServerUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    return normalizeServerOrigin(window.localStorage.getItem(SERVER_URL_KEY) ?? '');
  } catch {
    return '';
  }
}

function detectStandaloneApk(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  if (cap?.isNativePlatform?.()) return true;
  if (window.location.protocol === 'capacitor:' || window.location.protocol === 'file:') return true;
  // Capacitor Android WebView serves dist on https://localhost (no port)
  if (window.location.hostname === 'localhost' && window.location.port === '') return true;
  return false;
}

function resolveEffectiveServerOrigin(customOverride: string): string {
  if (customOverride) return customOverride;
  const envUrl = normalizeServerOrigin(
    (import.meta.env.VITE_SERVER_URL as string | undefined) ?? ''
  );
  if (envUrl) return envUrl;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export function useRoomSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);

  const [customServerUrl, setCustomServerUrl] = useState<string>(() => readStoredServerUrl());
  const [connected, setConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomPublicState | null>(null);
  const [privateRole, setPrivateRole] = useState<PrivateRolePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const envServerUrl = normalizeServerOrigin(
    (import.meta.env.VITE_SERVER_URL as string | undefined) ?? ''
  );
  const isStandaloneApk = detectStandaloneApk();
  const needsServerConfig = isStandaloneApk && !customServerUrl && !envServerUrl;
  const serverUrl = resolveEffectiveServerOrigin(customServerUrl);
  const serverUrlRef = useRef(serverUrl);
  serverUrlRef.current = serverUrl;
  const needsServerConfigRef = useRef(needsServerConfig);
  needsServerConfigRef.current = needsServerConfig;

  const send = useCallback((event: ClientEvent) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      if (needsServerConfigRef.current) {
        setError('Falta configurar la URL de tu servidor Online (toca "Configurar URL").');
      } else {
        setError(
          'Conectando o despertando el servidor Online... Si usa plan gratuito, espera ~30 segundos e intenta de nuevo.'
        );
      }
      return;
    }
    ws.send(JSON.stringify(event));
  }, []);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (needsServerConfigRef.current) {
      setConnected(false);
      return;
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const targetOrigin = serverUrlRef.current;
    const wsUrl = toWebSocketUrl(targetOrigin);
    if (!wsUrl) return;

    // Wake up sleeping cloud hosts (e.g. Render free tier) over HTTPS in parallel
    if (targetOrigin.startsWith('https://') || targetOrigin.startsWith('http://')) {
      fetch(`${targetOrigin}/api/health`, { method: 'GET' }).catch(() => {
        // Ignore wake-up ping failures; WebSocket reconnect loop handles retries
      });
    }

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
    } catch {
      setConnected(false);
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      const saved = window.sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as { code: string; playerId: string };
          if (parsed.code && parsed.playerId) {
            ws.send(
              JSON.stringify({
                type: 'room:reconnect',
                code: parsed.code,
                playerId: parsed.playerId,
              })
            );
          }
        } catch {
          window.sessionStorage.removeItem(SESSION_KEY);
        }
      }
    };

    ws.onmessage = (evt) => {
      let event: ServerEvent;
      try {
        event = JSON.parse(evt.data as string) as ServerEvent;
      } catch {
        return;
      }

      switch (event.type) {
        case 'session:joined':
          setPlayerId(event.playerId);
          setRoom(event.room);
          setError(null);
          window.sessionStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ code: event.room.code, playerId: event.playerId })
          );
          break;

        case 'room:state':
          setRoom((prev) => {
            if (prev?.phase !== event.room.phase) {
              if (event.room.phase === 'RESULTS') {
                if (event.room.revealedResult?.wasImpostor) {
                  soundFX.revealSuccess();
                } else {
                  soundFX.revealAlert();
                }
              } else if (event.room.phase === 'VOTE') {
                soundFX.cardFlip();
              }
            }
            return event.room;
          });
          if (event.room.phase === 'LOBBY') {
            setPrivateRole(null);
          }
          break;

        case 'role:assigned':
          soundFX.cardFlip();
          setPrivateRole(event.payload);
          break;

        case 'chat:message':
          if (!event.message.system) {
            soundFX.chatPop();
          }
          setRoom((prev) => {
            if (!prev) return prev;
            if (prev.chatMessages.some((m) => m.id === event.message.id)) return prev;
            return {
              ...prev,
              chatMessages: [...prev.chatMessages, event.message].slice(-80),
            };
          });
          break;

        case 'error':
          soundFX.errorThud();
          setError(event.message);
          if (event.message.includes('expiró') || event.message.includes('cerrada')) {
            window.sessionStorage.removeItem(SESSION_KEY);
          }
          break;
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
      if (shouldReconnectRef.current && !needsServerConfigRef.current) {
        if (reconnectTimerRef.current) {
          window.clearTimeout(reconnectTimerRef.current);
        }
        reconnectTimerRef.current = window.setTimeout(() => {
          connect();
        }, 2500);
      }
    };
  }, []);

  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();
    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  const updateServerUrl = useCallback(
    (nextRawUrl: string) => {
      const normalized = normalizeServerOrigin(nextRawUrl);
      try {
        if (normalized) {
          window.localStorage.setItem(SERVER_URL_KEY, normalized);
        } else {
          window.localStorage.removeItem(SERVER_URL_KEY);
        }
      } catch {
        // Ignore storage errors
      }
      setCustomServerUrl(normalized);
      const nextNeedsConfig = isStandaloneApk && !normalized && !envServerUrl;
      needsServerConfigRef.current = nextNeedsConfig;
      serverUrlRef.current = resolveEffectiveServerOrigin(normalized);
      setError(null);
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (!nextNeedsConfig) {
        window.setTimeout(() => {
          connect();
        }, 120);
      }
    },
    [connect, envServerUrl, isStandaloneApk]
  );

  const testServerConnection = useCallback(
    async (
      candidateUrl?: string
    ): Promise<{ ok: boolean; activeRooms?: number; error?: string }> => {
      const target = normalizeServerOrigin(candidateUrl ?? '') || serverUrlRef.current;
      if (!target || target.includes('localhost') && isStandaloneApk) {
        return {
          ok: false,
          error: 'Escribe la URL pública de tu servidor en Render o Railway (por ejemplo https://precinto-central.onrender.com).',
        };
      }
      const controller = new AbortController();
      // Render free tier cold starts can take 25-45s
      const timeoutId = window.setTimeout(() => controller.abort(), 45000);
      try {
        const res = await fetch(`${target}/api/health`, {
          method: 'GET',
          signal: controller.signal,
        });
        window.clearTimeout(timeoutId);
        if (!res.ok) {
          return {
            ok: false,
            error: `El servidor respondió con código ${res.status}. Asegúrate de usar la URL de tu servidor Node (Render/Railway), no la de la vista previa.`,
          };
        }
        const data = (await res.json()) as { ok?: boolean; activeRooms?: number };
        if (data.ok) {
          return { ok: true, activeRooms: data.activeRooms ?? 0 };
        }
        return { ok: false, error: 'Respuesta inesperada del servidor.' };
      } catch {
        window.clearTimeout(timeoutId);
        return {
          ok: false,
          error:
            'No respondió a tiempo. Verifica que la URL esté bien escrita y que tu servicio en Render ya aparezca como "Live".',
        };
      }
    },
    [isStandaloneApk]
  );

  const createRoom = (name: string, color: string, avatarId: string, mode: GameMode) => {
    setError(null);
    send({ type: 'room:create', name, color, avatarId, mode });
  };

  const joinRoom = (code: string, name: string, color: string, avatarId: string) => {
    setError(null);
    send({ type: 'room:join', code, name, color, avatarId });
  };

  const leaveRoom = () => {
    window.sessionStorage.removeItem(SESSION_KEY);
    send({ type: 'room:leave' });
    setRoom(null);
    setPlayerId(null);
    setPrivateRole(null);
  };

  const updateSettings = (settings: Partial<RoomSettings>) => {
    send({ type: 'room:update_settings', settings });
  };

  const startGame = () => send({ type: 'game:start' });
  const markReadyCard = () => send({ type: 'game:ready_card' });
  const startDescribe = () => send({ type: 'game:start_describe' });
  const startVote = () => send({ type: 'game:start_vote' });
  const sendChat = (text: string, isClue?: boolean) => send({ type: 'chat:send', text, isClue });
  const addClue = (text: string, title?: string) => send({ type: 'clue:add', text, title });
  const addNote = (text: string) => send({ type: 'note:add', text });
  const castVote = (targetPlayerId: string) => {
    soundFX.voteCast();
    send({ type: 'vote:cast', targetPlayerId });
  };
  const nextRound = () => send({ type: 'game:next_round' });
  const returnLobby = () => send({ type: 'game:return_lobby' });
  const startDuel = (caseId: string) => send({ type: 'duel:start', caseId });
  const sendDuelProgress = (found: number, total: number, finished: boolean) =>
    send({ type: 'duel:progress', found, total, finished });

  return {
    connected,
    serverUrl,
    customServerUrl,
    isStandaloneApk,
    needsServerConfig,
    updateServerUrl,
    testServerConnection,
    playerId,
    room,
    privateRole,
    error,
    clearError: () => setError(null),
    createRoom,
    joinRoom,
    leaveRoom,
    updateSettings,
    startGame,
    markReadyCard,
    startDescribe,
    startVote,
    sendChat,
    addClue,
    addNote,
    castVote,
    nextRound,
    returnLobby,
    startDuel,
    sendDuelProgress,
  };
}
