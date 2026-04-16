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
  vote: string | null;
}

export interface GameConfig {
  impostorCount: number;
  timerMinutes: number;
  selectedCategories: string[];
  showTimer: boolean;
  startingPlayerId: string | null;
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
}

const DEFAULT_CONFIG: GameConfig = {
  impostorCount: 1,
  timerMinutes: 3,
  selectedCategories: [],
  showTimer: true,
  startingPlayerId: null,
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

  addPlayer(name: string): boolean {
    const trimmed = name.trim();
    if (!trimmed) return false;

    const state = this.currentState;
    const exists = state.players.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) return false;

    const newPlayer: Player = {
      id: this.generateId(),
      name: trimmed,
      isImpostor: false,
      hasSeenRole: false,
      vote: null,
    };

    this.updateState({ players: [...state.players, newPlayer] });
    return true;
  }

  removePlayer(playerId: string): void {
    const state = this.currentState;
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

    const minPlayers = state.config.impostorCount + 2;
    if (state.players.length < minPlayers) {
      return false;
    }

    const orderedPlayers: Player[] = state.players.map((p) => ({
      ...p,
      isImpostor: false,
      hasSeenRole: false,
      vote: null,
    }));

    const impostorIndices = this.pickRandomIndices(
      orderedPlayers.length,
      state.config.impostorCount,
    );
    impostorIndices.forEach((i) => {
      orderedPlayers[i].isImpostor = true;
    });

    const { word, category } = getRandomWord(
      state.config.selectedCategories.length > 0
        ? state.config.selectedCategories
        : undefined,
    );

    this.updateState({
      phase: "role-reveal",
      players: orderedPlayers,
      currentWord: word,
      currentCategory: category,
      currentRevealIndex: 0,
      roundNumber: state.roundNumber + 1,
      inspireMessage: getRandomInspireMessage(),
    });

    return true;
  }

  markRoleSeen(): void {
    const state = this.currentState;
    const players = [...state.players];

    players[state.currentRevealIndex] = {
      ...players[state.currentRevealIndex],
      hasSeenRole: true,
    };

    const nextIndex = state.currentRevealIndex + 1;

    if (nextIndex >= players.length) {
      this.updateState({
        players,
        currentRevealIndex: 0,
        phase: "discussion",
      });
    } else {
      this.updateState({ players, currentRevealIndex: nextIndex });
    }
  }

  get currentRevealPlayer(): Player | null {
    const state = this.currentState;
    return state.players[state.currentRevealIndex] ?? null;
  }

  startVoting(): void {
    this.updateState({ phase: "voting" });
  }

  castVote(voterId: string, votedId: string): void {
    const state = this.currentState;
    const players = state.players.map((p) =>
      p.id === voterId ? { ...p, vote: votedId } : p,
    );
    this.updateState({ players });
  }

  get allVotesCast(): boolean {
    return this.currentState.players.every((p) => p.vote !== null);
  }

  showResult(): void {
    this.updateState({ phase: "result" });
  }

  get votingResult(): {
    mostVoted: Player | null;
    voteCounts: { player: Player; votes: number }[];
    impostors: Player[];
    isCorrect: boolean;
    canContinue: boolean;
  } {
    const state = this.currentState;
    const voteMap: { [id: string]: number } = {};

    state.players.forEach((p) => {
      if (p.vote) {
        voteMap[p.vote] = (voteMap[p.vote] || 0) + 1;
      }
    });

    const voteCounts = state.players.map((p) => ({
      player: p,
      votes: voteMap[p.id] || 0,
    }));

    voteCounts.sort((a, b) => b.votes - a.votes);

    const mostVoted = voteCounts[0]?.player ?? null;
    const impostors = state.players.filter((p) => p.isImpostor);
    const isCorrect = mostVoted?.isImpostor ?? false;

    const remainingAfterElimination = state.players.filter(
      (p) => p.id !== mostVoted?.id,
    );
    const impostorCount = impostors.length;
    const civilianCount = remainingAfterElimination.filter(
      (p) => !p.isImpostor,
    ).length;
    const canContinue = !isCorrect && civilianCount > impostorCount;

    return { mostVoted, voteCounts, impostors, isCorrect, canContinue };
  }

  continueWithSameWord(): boolean {
    const state = this.currentState;
    const result = this.votingResult;
    const mostVoted = result.mostVoted;

    if (!mostVoted) return false;

    const remainingPlayers = state.players
      .filter((p) => p.id !== mostVoted.id)
      .map((p) => ({ ...p, vote: null, hasSeenRole: p.hasSeenRole }));

    const impostors = remainingPlayers.filter((p) => p.isImpostor);
    const civilians = remainingPlayers.filter((p) => !p.isImpostor);

    if (civilians.length <= impostors.length) return false;

    this.updateState({
      phase: "discussion",
      players: remainingPlayers,
      currentRevealIndex: 0,
    });
    return true;
  }

  newRound(): void {
    const state = this.currentState;
    this.updateState({
      phase: "players",
      currentWord: null,
      currentCategory: null,
      currentRevealIndex: 0,
      roundNumber: 0,
      players: state.players.map((p) => ({
        ...p,
        isImpostor: false,
        hasSeenRole: false,
        vote: null,
      })),
    });
  }

  continueGame(): boolean {
    const state = this.currentState;
    const result = this.votingResult;
    const mostVoted = result.mostVoted;

    if (!mostVoted) return false;

    const remainingPlayers = state.players
      .filter((p) => p.id !== mostVoted.id)
      .map((p) => ({ ...p, hasSeenRole: false, vote: null }));

    const impostors = remainingPlayers.filter((p) => p.isImpostor);
    const civilians = remainingPlayers.filter((p) => !p.isImpostor);

    if (impostors.length >= civilians.length) return false;

    this.updateState({
      phase: "role-reveal",
      players: remainingPlayers,
      currentWord: null,
      currentCategory: null,
      currentRevealIndex: 0,
      roundNumber: state.roundNumber + 1,
      inspireMessage: getRandomInspireMessage(),
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
