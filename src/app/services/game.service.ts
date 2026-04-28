// src/app/services/game.service.ts
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import {
  WORD_CATEGORIES,
  WordCategory,
  WordEntry,
  getRandomWord,
  getRandomInspireMessage,
} from "../data/words";

export interface Player {
  id: string;
  name: string;
  isImpostor: boolean;
  hasSeenRole: boolean;
  votes: string[];
  isEliminated: boolean;
}

export interface GameConfig {
  impostorCount: number;
  timerMinutes: number;
  selectedCategories: string[];
  showTimer: boolean;
  startingPlayerId: string | null;
  selectedDifficulties: string[];
  impostorHints: boolean;
  voteMode: "impostor-count" | "one-per-player";
  eliminationMode: "match-votes" | "most-voted-only";
}

export type GamePhase =
  | "home"
  | "players"
  | "role-reveal"
  | "discussion"
  | "voting"
  | "result";

export interface GameState {
  phase: GamePhase;
  players: Player[];
  config: GameConfig;
  currentWord: WordEntry | null;
  currentCategory: WordCategory | null;
  currentRevealIndex: number;
  roundNumber: number;
  inspireMessage: string;
  resolvedStartingPlayerId: string | null;
}

export const DEFAULT_CONFIG: GameConfig = {
  impostorCount: 1,
  timerMinutes: 3,
  selectedCategories: [],
  showTimer: true,
  startingPlayerId: null,
  selectedDifficulties: [],
  impostorHints: true,
  voteMode: "impostor-count",
  eliminationMode: "most-voted-only",
};

const INITIAL_STATE: GameState = {
  phase: "home",
  players: [],
  config: { ...DEFAULT_CONFIG },
  currentWord: null,
  currentCategory: null,
  currentRevealIndex: 0,
  roundNumber: 0,
  inspireMessage: "",
  resolvedStartingPlayerId: null,
};

@Injectable({ providedIn: "root" })
export class GameService {
  private state = new BehaviorSubject<GameState>({ ...INITIAL_STATE });
  public state$ = this.state.asObservable();

  get currentState(): GameState {
    return this.state.getValue();
  }

  get categories(): WordCategory[] {
    return WORD_CATEGORIES;
  }

  get activePlayers(): Player[] {
    return this.currentState.players.filter((p) => !p.isEliminated);
  }

  get currentRevealPlayer(): Player | null {
    const active = this.activePlayers;
    return active[this.currentState.currentRevealIndex] ?? null;
  }

  get allVotesCast(): boolean {
    const state = this.currentState;
    const required =
      state.config.voteMode === "one-per-player"
        ? 1
        : state.config.impostorCount;
    return this.activePlayers.every((p) => p.votes.length >= required);
  }

  addPlayer(name: string): boolean {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const state = this.currentState;
    const exists = state.players.some(
      (p) => !p.isEliminated && p.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return false;
    const newPlayer: Player = {
      id: this.generateId(),
      name: trimmed,
      isImpostor: false,
      hasSeenRole: false,
      votes: [],
      isEliminated: false,
    };
    this.updateState({ players: [...state.players, newPlayer] });
    return true;
  }

  removePlayer(playerId: string): void {
    const state = this.currentState;
    if (state.phase !== "home" && state.phase !== "players") return;
    const players = state.players.filter((p) => p.id !== playerId);
    const startingPlayerId =
      state.config.startingPlayerId === playerId
        ? null
        : state.config.startingPlayerId;
    this.updateState({
      players,
      config: { ...state.config, startingPlayerId },
    });
  }

  clearPlayers(): void {
    this.updateState({ players: [] });
  }

  updateConfig(config: Partial<GameConfig>): void {
    const state = this.currentState;
    this.updateState({ config: { ...state.config, ...config } });
  }

  startGame(): boolean {
    const state = this.currentState;
    const active = this.activePlayers;
    const minPlayers = state.config.impostorCount + 2;
    if (active.length < minPlayers) return false;
    const updatedPlayers = state.players.map((p) => ({
      ...p,
      isImpostor: false,
      hasSeenRole: false,
      votes: [],
    }));
    const activeIndices = updatedPlayers
      .map((p, i) => ({ active: !p.isEliminated, index: i }))
      .filter(({ active }) => active)
      .map(({ index }) => index);
    const impostorLocalIndices = this.pickRandomIndices(
      activeIndices.length,
      state.config.impostorCount
    );
    impostorLocalIndices.forEach((localIdx) => {
      const globalIdx = activeIndices[localIdx];
      updatedPlayers[globalIdx].isImpostor = true;
    });
    const { word, category } = getRandomWord(
      state.config.selectedCategories.length > 0
        ? state.config.selectedCategories
        : undefined,
      state.config.selectedDifficulties.length > 0
        ? state.config.selectedDifficulties
        : undefined
    );
    let resolvedStartingPlayerId = state.config.startingPlayerId;
    if (!resolvedStartingPlayerId && active.length > 0) {
      resolvedStartingPlayerId =
        active[Math.floor(Math.random() * active.length)].id;
    }
    this.updateState({
      phase: "role-reveal",
      players: updatedPlayers,
      currentWord: word,
      currentCategory: category,
      currentRevealIndex: 0,
      roundNumber: state.roundNumber + 1,
      inspireMessage: getRandomInspireMessage(),
      resolvedStartingPlayerId,
    });
    return true;
  }

  markRoleSeen(): void {
    const state = this.currentState;
    const active = this.activePlayers;
    if (state.currentRevealIndex >= active.length) return;
    const targetPlayer = active[state.currentRevealIndex];
    const players = state.players.map((p) =>
      p.id === targetPlayer.id ? { ...p, hasSeenRole: true } : p
    );
    const nextIndex = state.currentRevealIndex + 1;
    const shouldAdvance = nextIndex < active.length;
    this.updateState({
      players,
      currentRevealIndex: shouldAdvance ? nextIndex : 0,
      phase: shouldAdvance ? state.phase : "discussion",
    });
  }

  startVoting(): void {
    this.updateState({ phase: "voting" });
  }

  castVote(voterId: string, votedIds: string[]): void {
    const state = this.currentState;
    const players = state.players.map((p) =>
      p.id === voterId ? { ...p, votes: votedIds } : p
    );
    this.updateState({ players });
  }

  showResult(): void {
    this.updateState({ phase: "result" });
  }

  // ✅ RESULTADO SIMPLIFICADO: Todo en uno
  get votingResult(): {
    eliminatedPlayers: Player[];
    eliminatedImpostors: Player[];
    eliminatedCivilians: Player[];
    remainingImpostors: number;
    remainingCivilians: number;
    isCivilVictory: boolean;
    isImpostorVictory: boolean;
    canContinue: boolean;
    summaryTitle: string;
    summaryMessage: string;
  } {
    const state = this.currentState;
    const active = this.activePlayers;

    // Contar votos
    const voteMap: { [id: string]: number } = {};
    active.forEach((p) => {
      p.votes.forEach((votedId) => {
        voteMap[votedId] = (voteMap[votedId] || 0) + 1;
      });
    });

    // Calcular cuántos votos puede emitir cada jugador
    const votesPerPlayer =
      state.config.voteMode === "one-per-player" ? 1 : state.config.impostorCount;

    // Calcular cuántos eliminar
    const maxEliminable =
      state.config.eliminationMode === "match-votes"
        ? Math.min(votesPerPlayer, Math.max(1, active.length - 1))
        : 1;

    // Obtener top N más votados
    const voteCounts = active
      .map((p) => ({ player: p, votes: voteMap[p.id] || 0 }))
      .sort((a, b) => b.votes - a.votes);

    const eliminatedPlayers: Player[] = [];
    for (const entry of voteCounts) {
      if (eliminatedPlayers.length >= maxEliminable) break;
      if (entry.votes > 0) {
        eliminatedPlayers.push(entry.player);
      }
    }

    // Separar por rol
    const eliminatedImpostors = eliminatedPlayers.filter((p) => p.isImpostor);
    const eliminatedCivilians = eliminatedPlayers.filter((p) => !p.isImpostor);

    // Calcular restantes
    const remaining = active.filter((p) => !eliminatedPlayers.includes(p));
    const remainingImpostors = remaining.filter((p) => p.isImpostor).length;
    const remainingCivilians = remaining.filter((p) => !p.isImpostor).length;

    // ✅ Determinar victorias (lógica simple)
    const isCivilVictory = remainingImpostors === 0 && eliminatedImpostors.length > 0;
    const isImpostorVictory =
      remainingCivilians === 0 || remainingImpostors >= remainingCivilians;

    // ¿Se puede continuar? Solo si NO hay victoria y hubo eliminaciones
    const canContinue = !isCivilVictory && !isImpostorVictory && eliminatedPlayers.length > 0;

    // ✅ Mensajes claros
    let summaryTitle = "";
    let summaryMessage = "";

    if (isCivilVictory) {
      summaryTitle = "🎉 ¡Victoria de los Civiles!";
      summaryMessage = `Los impostores ${eliminatedImpostors
        .map((p) => p.name)
        .join(", ")} han sido eliminados.`;
    } else if (isImpostorVictory) {
      summaryTitle = "😈 ¡Victoria de los Impostores!";
      summaryMessage =
        remainingCivilians === 0
          ? "No quedan civiles en el juego."
          : "Los impostores son mayoría.";
    } else if (eliminatedImpostors.length > 0) {
      summaryTitle = "✅ Impostor eliminado";
      const civPart =
        eliminatedCivilians.length > 0
          ? ` También: ${eliminatedCivilians.map((p) => p.name).join(", ")}.`
          : "";
      summaryMessage = `Se eliminó a ${eliminatedImpostors
        .map((p) => p.name)
        .join(", ")}.${civPart} ¡La búsqueda continúa!`;
    } else if (eliminatedCivilians.length > 0) {
      summaryTitle = "⚠️ Civiles eliminados";
      summaryMessage = `Se eliminaron ${eliminatedCivilians
        .map((p) => p.name)
        .join(", ")}. ¡Cuidado con los impostores!`;
    } else {
      summaryTitle = "🔄 Sin eliminaciones";
      summaryMessage = "Nadie fue eliminado en esta ronda.";
    }

    return {
      eliminatedPlayers,
      eliminatedImpostors,
      eliminatedCivilians,
      remainingImpostors,
      remainingCivilians,
      isCivilVictory,
      isImpostorVictory,
      canContinue,
      summaryTitle,
      summaryMessage,
    };
  }

  // ✅ Continuar con misma palabra (solo si canContinue)
  continueWithSameWord(): boolean {
    const state = this.currentState;
    const result = this.votingResult;
    const { eliminatedPlayers } = result;

    if (!eliminatedPlayers || eliminatedPlayers.length === 0) return false;

    const players = state.players.map((p) => {
      if (eliminatedPlayers.some((ep) => ep.id === p.id)) {
        return { ...p, isEliminated: true, votes: [] };
      }
      return { ...p, votes: [] };
    });

    const active = players.filter((p) => !p.isEliminated);
    const impostors = active.filter((p) => p.isImpostor);
    const civilians = active.filter((p) => !p.isImpostor);

    if (civilians.length <= impostors.length) return false;

    this.updateState({
      phase: "discussion",
      players,
      currentRevealIndex: 0,
    });
    return true;
  }

  newRound(): void {
    const state = this.currentState;
    const players = state.players.map((p) => ({
      ...p,
      isImpostor: false,
      hasSeenRole: false,
      votes: [],
    }));
    this.updateState({
      phase: "players",
      players,
      currentWord: null,
      currentCategory: null,
      currentRevealIndex: 0,
      roundNumber: 0,
      resolvedStartingPlayerId: null,
    });
  }

  continueGame(): boolean {
    const state = this.currentState;
    const result = this.votingResult;
    const { eliminatedPlayers } = result;
    if (!eliminatedPlayers || eliminatedPlayers.length === 0) return false;
    const players = state.players.map((p) => {
      if (eliminatedPlayers.some((ep) => ep.id === p.id)) {
        return { ...p, isEliminated: true, hasSeenRole: false, votes: [] };
      }
      return { ...p, hasSeenRole: false, votes: [] };
    });
    const active = players.filter((p) => !p.isEliminated);
    const impostors = active.filter((p) => p.isImpostor);
    const civilians = active.filter((p) => !p.isImpostor);
    if (impostors.length >= civilians.length) return false;
    const { word, category } = getRandomWord(
      state.config.selectedCategories.length > 0
        ? state.config.selectedCategories
        : undefined,
      state.config.selectedDifficulties.length > 0
        ? state.config.selectedDifficulties
        : undefined
    );
    this.updateState({
      phase: "role-reveal",
      players,
      currentWord: word,
      currentCategory: category,
      currentRevealIndex: 0,
      roundNumber: state.roundNumber + 1,
      inspireMessage: getRandomInspireMessage(),
      resolvedStartingPlayerId: null,
    });
    return true;
  }

  fullReset(): void {
    this.state.next({ ...INITIAL_STATE });
  }

  private updateState(partial: Partial<GameState>): void {
    this.state.next({ ...this.state.getValue(), ...partial });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private pickRandomIndices(length: number, count: number): number[] {
    const indices: number[] = [];
    const pool = Array.from({ length }, (_, i) => i);
    for (let i = 0; i < count && pool.length > 0; i++) {
      const j = Math.floor(Math.random() * pool.length);
      indices.push(pool.splice(j, 1)[0]);
    }
    return indices;
  }
}