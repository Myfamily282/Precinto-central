import { EVIDENCE_PAIRS } from '../data/evidenceCatalog.ts';
import type { EvidencePair, PrivateClue } from '../shared/types.ts';

export interface RoundHistoryTracker {
  usedPairIds: string[];
  lastPairId: string | null;
  usedClueIds: string[];
  lastImpostorIds: string[];
  impostorHistoryCount: Record<string, number>;
  lastTurnOrder: string[];
}

export interface GenerateRoundOptions {
  playerIds: string[];
  impostorCount: 1 | 2;
  history: RoundHistoryTracker;
}

export interface UniqueRoundSetup {
  pair: EvidencePair;
  impostorIds: string[];
  detectiveIds: string[];
  playerClues: Map<string, PrivateClue[]>;
  turnOrder: string[];
  nextHistory: RoundHistoryTracker;
}

export function createInitialRoundHistory(): RoundHistoryTracker {
  return {
    usedPairIds: [],
    lastPairId: null,
    usedClueIds: [],
    lastImpostorIds: [],
    impostorHistoryCount: {},
    lastTurnOrder: [],
  };
}

export function shuffleFisherYates<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sameSequence(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Genera una ronda completamente única garantizando:
 * 1) Un caso de robo distinto a rondas y partidas consecutivas.
 * 2) Asignación de rol de impostor sin repetir al mismo jugador de la ronda anterior
 *    y equilibrando quién ha sido impostor menos veces.
 * 3) Pistas privadas únicas y sin repetición entre detectives.
 * 4) Orden de turnos distinto cuando hay 3 o más jugadores.
 */
export function generateUniqueRoundSetup({
  playerIds,
  impostorCount,
  history,
}: GenerateRoundOptions): UniqueRoundSetup {
  // 1. Selección de caso único (excluyendo usados y el último caso jugado)
  let nextUsedPairIds = [...history.usedPairIds];
  let availablePairs = EVIDENCE_PAIRS.filter(
    (p) => !nextUsedPairIds.includes(p.id) && p.id !== history.lastPairId
  );

  if (availablePairs.length === 0) {
    nextUsedPairIds = [];
    availablePairs = EVIDENCE_PAIRS.filter((p) => p.id !== history.lastPairId);
    if (availablePairs.length === 0) {
      availablePairs = [...EVIDENCE_PAIRS];
    }
  }

  const pickedPair = shuffleFisherYates(availablePairs)[0];
  nextUsedPairIds.push(pickedPair.id);

  // 2. Asignación única y justa de roles (evita repetir impostores consecutivos)
  const desiredImpostors = playerIds.length >= 6 && impostorCount === 2 ? 2 : 1;
  const nonRepeatingPool = playerIds.filter((id) => !history.lastImpostorIds.includes(id));
  const candidatePool =
    nonRepeatingPool.length >= desiredImpostors ? nonRepeatingPool : [...playerIds];

  // Agrupar por menor cantidad de veces como impostor y mezclar dentro de cada nivel
  const shuffledCandidates = shuffleFisherYates(candidatePool).sort(
    (a, b) =>
      (history.impostorHistoryCount[a] ?? 0) - (history.impostorHistoryCount[b] ?? 0)
  );

  const impostorIds = shuffledCandidates.slice(0, desiredImpostors);
  const impostorSet = new Set(impostorIds);
  const detectiveIds = playerIds.filter((id) => !impostorSet.has(id));

  const nextImpostorHistoryCount: Record<string, number> = {
    ...history.impostorHistoryCount,
  };
  for (const id of impostorIds) {
    nextImpostorHistoryCount[id] = (nextImpostorHistoryCount[id] ?? 0) + 1;
  }

  // 3. Pistas únicas y exclusivas para cada detective (priorizando pistas no vistas)
  const unseenClues = shuffleFisherYates(
    pickedPair.cluesPool.filter((c) => !history.usedClueIds.includes(c.id))
  );
  const seenClues = shuffleFisherYates(
    pickedPair.cluesPool.filter((c) => history.usedClueIds.includes(c.id))
  );
  const orderedClues = [...unseenClues, ...seenClues];

  const playerClues = new Map<string, PrivateClue[]>();
  const shuffledDetectives = shuffleFisherYates(detectiveIds);
  shuffledDetectives.forEach((id) => playerClues.set(id, []));

  const assignedClueIds: string[] = [];
  if (shuffledDetectives.length > 0) {
    orderedClues.forEach((clue, idx) => {
      const targetDetectiveId = shuffledDetectives[idx % shuffledDetectives.length];
      playerClues.get(targetDetectiveId)?.push(clue);
      assignedClueIds.push(clue.id);
    });
  }

  const allPoolIds = new Set(pickedPair.cluesPool.map((c) => c.id));
  const mergedUsedClues = Array.from(new Set([...history.usedClueIds, ...assignedClueIds]));
  const nextUsedClueIds =
    mergedUsedClues.length >= EVIDENCE_PAIRS.length * 8
      ? assignedClueIds.filter((id) => allPoolIds.has(id))
      : mergedUsedClues;

  // 4. Orden de turnos único respecto a la ronda anterior
  let turnOrder = shuffleFisherYates(playerIds);
  if (playerIds.length >= 3 && sameSequence(turnOrder, history.lastTurnOrder)) {
    turnOrder = [...turnOrder.slice(1), turnOrder[0]];
  }

  return {
    pair: pickedPair,
    impostorIds,
    detectiveIds,
    playerClues,
    turnOrder,
    nextHistory: {
      usedPairIds: nextUsedPairIds,
      lastPairId: pickedPair.id,
      usedClueIds: nextUsedClueIds,
      lastImpostorIds: impostorIds,
      impostorHistoryCount: nextImpostorHistoryCount,
      lastTurnOrder: turnOrder,
    },
  };
}
