// src/app/services/game.service.ts
// ============================================================
// Servicio central del juego "Impostor de Catequesis"
// Contiene toda la lógica de estado y flujo del juego
// ============================================================

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  WORD_CATEGORIES,
  WordCategory,
  WordEntry,
  getRandomWord,
  getRandomInspireMessage,
} from '../data/words';

// ---- Interfaces de modelo ----

export interface Player {
  id: string;
  name: string;
  isImpostor: boolean;
  hasSeenRole: boolean;
  vote: string | null; // id del jugador votado
}

export interface GameConfig {
  impostorCount: number;           // Cuántos impostores hay (1 o 2)
  timerMinutes: number;            // Duración del temporizador de discusión
  selectedCategories: string[];    // IDs de categorías activas (vacío = todas)
  showTimer: boolean;              // Mostrar u ocultar el temporizador
}

export type GamePhase =
  | 'home'         // ← Pantalla de inicio (menú principal)
  | 'players'      // ← Configurar jugadores (agregar/remover)
  | 'role-reveal'  // ← Revelar roles uno a uno
  | 'discussion'   // ← Discusión con timer
  | 'voting'       // ← Votación
  | 'result';      // ← Resultado final

export interface GameState {
  phase: GamePhase;
  players: Player[];
  config: GameConfig;
  currentWord: WordEntry | null;
  currentCategory: WordCategory | null;
  currentRevealIndex: number;     // Índice del jugador que está viendo su rol
  roundNumber: number;
  inspireMessage: string;
}

// ---- Estado inicial por defecto ----
const DEFAULT_CONFIG: GameConfig = {
  impostorCount: 1,
  timerMinutes: 3,
  selectedCategories: [],
  showTimer: true,
};

const INITIAL_STATE: GameState = {
  phase: 'home',  // ← Empezar en home, no en setup
  players: [],
  config: { ...DEFAULT_CONFIG },
  currentWord: null,
  currentCategory: null,
  currentRevealIndex: 0,
  roundNumber: 0,
  inspireMessage: '',
};

// ============================================================
@Injectable({ providedIn: 'root' })
export class GameService {
  // Estado reactivo accesible desde cualquier componente
  private state = new BehaviorSubject<GameState>({ ...INITIAL_STATE });
  public state$ = this.state.asObservable();

  // Getter conveniente del estado actual
  get currentState(): GameState {
    return this.state.getValue();
  }

  // Obtener todas las categorías disponibles
  get categories(): WordCategory[] {
    return WORD_CATEGORIES;
  }

  // ---- GESTIÓN DE JUGADORES ----

  /** Agrega un jugador nuevo si el nombre no está vacío ni repetido */
  addPlayer(name: string): boolean {
    const trimmed = name.trim();
    if (!trimmed) return false;

    const state = this.currentState;
    const exists = state.players.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
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

  /** Elimina un jugador por ID */
  removePlayer(playerId: string): void {
    const state = this.currentState;
    this.updateState({
      players: state.players.filter((p) => p.id !== playerId),
    });
  }

  /** Limpia todos los jugadores */
  clearPlayers(): void {
    this.updateState({ players: [] });
  }

  // ---- CONFIGURACIÓN ----

  /** Actualiza la configuración del juego */
  updateConfig(config: Partial<GameConfig>): void {
    const state = this.currentState;
    this.updateState({ config: { ...state.config, ...config } });
  }

  // ---- INICIO DE PARTIDA ----

  /**
   * Inicia la partida:
   * 1. Mezcla jugadores
   * 2. Selecciona impostores al azar
   * 3. Selecciona una palabra al azar
   * 4. Cambia la fase a 'role-reveal'
   */
  startGame(): boolean {
    const state = this.currentState;

    // Mínimo de jugadores necesarios
    const minPlayers = state.config.impostorCount + 2;
    if (state.players.length < minPlayers) {
      return false;
    }

    // Mezclar jugadores (Fisher-Yates)
    const shuffledPlayers = this.shuffle([...state.players]).map((p) => ({
      ...p,
      isImpostor: false,
      hasSeenRole: false,
      vote: null,
    }));

    // Asignar impostores
    for (let i = 0; i < state.config.impostorCount; i++) {
      shuffledPlayers[i].isImpostor = true;
    }

    // Mezclar de nuevo para que los impostores no sean siempre los primeros
    const finalPlayers = this.shuffle(shuffledPlayers);

    // Seleccionar palabra
    const { word, category } = getRandomWord(
      state.config.selectedCategories.length > 0
        ? state.config.selectedCategories
        : undefined
    );

    this.updateState({
      phase: 'role-reveal',
      players: finalPlayers,
      currentWord: word,
      currentCategory: category,
      currentRevealIndex: 0,
      roundNumber: state.roundNumber + 1,
      inspireMessage: getRandomInspireMessage(),
    });

    return true;
  }

  // ---- REVELACIÓN DE ROLES ----

  /** Marca que el jugador actual ya vio su rol y avanza al siguiente */
  markRoleSeen(): void {
    const state = this.currentState;
    const players = [...state.players];

    players[state.currentRevealIndex] = {
      ...players[state.currentRevealIndex],
      hasSeenRole: true,
    };

    const nextIndex = state.currentRevealIndex + 1;

    if (nextIndex >= players.length) {
      // Todos vieron su rol → pasar a discusión
      this.updateState({
        players,
        currentRevealIndex: 0,
        phase: 'discussion',
      });
    } else {
      this.updateState({ players, currentRevealIndex: nextIndex });
    }
  }

  /** Jugador actual en la fase de revelación */
  get currentRevealPlayer(): Player | null {
    const state = this.currentState;
    return state.players[state.currentRevealIndex] ?? null;
  }

  // ---- VOTACIÓN ----

  /** Cambia a la fase de votación */
  startVoting(): void {
    this.updateState({ phase: 'voting' });
  }

  /**
   * Registra el voto de un jugador
   * @param voterId ID del jugador que vota
   * @param votedId ID del jugador votado
   */
  castVote(voterId: string, votedId: string): void {
    const state = this.currentState;
    const players = state.players.map((p) =>
      p.id === voterId ? { ...p, vote: votedId } : p
    );
    this.updateState({ players });
  }

  /** Verifica si todos los jugadores ya votaron */
  get allVotesCast(): boolean {
    return this.currentState.players.every((p) => p.vote !== null);
  }

  // ---- RESULTADO ----

  /** Cambia a la fase de resultado */
  showResult(): void {
    this.updateState({ phase: 'result' });
  }

  /** Calcula los votos y devuelve el jugador más votado */
  get votingResult(): {
    mostVoted: Player | null;
    voteCounts: { player: Player; votes: number }[];
    impostors: Player[];
    isCorrect: boolean;
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

    return { mostVoted, voteCounts, impostors, isCorrect };
  }

  // ---- NUEVA PARTIDA / RESET ----

  /** Comienza una nueva partida manteniendo los jugadores y configuración */
  newRound(): void {
    this.updateState({
      phase: 'players',
      currentWord: null,
      currentCategory: null,
      currentRevealIndex: 0,
      players: this.currentState.players.map((p) => ({
        ...p,
        isImpostor: false,
        hasSeenRole: false,
        vote: null,
      })),
    });
  }

  /** Reinicia el juego completamente */
  fullReset(): void {
    this.state.next({ ...INITIAL_STATE });
  }

  // ---- UTILIDADES PRIVADAS ----

  private updateState(partial: Partial<GameState>): void {
    this.state.next({ ...this.state.getValue(), ...partial });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
