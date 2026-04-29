// src/app/pages/players/players.page.ts
import { Component, ChangeDetectorRef, OnDestroy, HostListener, ViewEncapsulation } from "@angular/core";
import { ToastController, NavController } from "@ionic/angular";
import {
  GameService,
  GameConfig,
  Player,
  DEFAULT_CONFIG,
} from "../../services/game.service";
import { WordCategory, WORD_CATEGORIES } from "../../data/words";
import { Subscription } from "rxjs";

@Component({
  selector: "app-players",
  templateUrl: "players.page.html",
  styleUrls: ["players.page.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class PlayersPage implements OnDestroy {
  showed!: boolean;
  players: Player[] = [];
  config: GameConfig = DEFAULT_CONFIG;
  isStarting = false;
  newPlayerName = "";
  categories: WordCategory[] = WORD_CATEGORIES;
  
  // ✅ Para modal de configuración
  showConfigModal = false;
  tempConfig: GameConfig | null = null;

  private sub?: Subscription;

  playerColors = [
    "#d4a728", "#2a6bb5", "#2ec478", "#dc5050",
    "#8b5a2b", "#8e44ad", "#1abc9c", "#e67e22",
  ];

  difficultyOptions = [
    { id: "easy", label: "Fácil", icon: "leaf-outline", color: "#2ec478" },
    { id: "medium", label: "Media", icon: "speedometer-outline", color: "#f39c12" },
    { id: "hard", label: "Difícil", icon: "flame-outline", color: "#dc5050" },
  ];

  constructor(
    private gameService: GameService,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private cdr: ChangeDetectorRef,
  ) {}

  ionViewWillEnter(): void {
    const currentState = this.gameService.currentState;
    this.players = [...currentState.players];
    this.config = { ...currentState.config };
    this.cdr.detectChanges();

    if (this.sub) this.sub.unsubscribe();
    this.sub = this.gameService.state$.subscribe((state) => {
      this.players = [...state.players];
      this.config = { ...state.config };
      this.cdr.detectChanges();
    });
  }

  ionViewWillLeave(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  // ✅ HostListener para cerrar modal con ESC
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    if (this.showConfigModal) {
      event.preventDefault();
      this.closeConfigModal(false);
    }
  }

  get canStart(): boolean {
    const minPlayers = this.config.impostorCount + 2;
    return this.players.length >= minPlayers;
  }

  get minPlayersNeeded(): number {
    return this.config.impostorCount + 2;
  }

  addPlayer(): void {
    if (!this.newPlayerName.trim()) return;
    const success = this.gameService.addPlayer(this.newPlayerName);
    if (success) {
      this.newPlayerName = "";
    } else {
      this.showToast("Ese nombre ya existe o está vacío", "warning");
    }
  }

  removePlayer(id: string): void {
    this.gameService.removePlayer(id);
  }

  getPlayerColor(index: number): string {
    return this.playerColors[index % this.playerColors.length];
  }

  getPlayerInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  toggleCategory(categoryId: string): void {
    const selected = [...this.config.selectedCategories];
    const idx = selected.indexOf(categoryId);
    if (idx >= 0) selected.splice(idx, 1);
    else selected.push(categoryId);
    this.config.selectedCategories = selected;
    this.gameService.updateConfig({ selectedCategories: selected });
  }

  updateImpostorCount(count: number): void {
    this.config.impostorCount = count;
    this.gameService.updateConfig({ impostorCount: count });
  }

  updateTimer(minutes: number): void {
    this.config.timerMinutes = minutes;
    this.config.showTimer = true;
    this.gameService.updateConfig({ timerMinutes: minutes, showTimer: true });
  }

  setTimerOff(): void {
    this.config.showTimer = false;
    this.gameService.updateConfig({ showTimer: false });
  }

  toggleDifficulty(difficultyId: string): void {
    const selected = [...this.config.selectedDifficulties];
    const idx = selected.indexOf(difficultyId);
    if (idx >= 0) selected.splice(idx, 1);
    else selected.push(difficultyId);
    this.config.selectedDifficulties = selected;
    this.gameService.updateConfig({ selectedDifficulties: selected });
  }

  setStartingPlayer(playerId: string): void {
    const newId = this.config.startingPlayerId === playerId ? null : playerId;
    this.config.startingPlayerId = newId;
    this.gameService.updateConfig({ startingPlayerId: newId });
  }

  updateImpostorHints(): void {
    this.config.impostorHints = !this.config.impostorHints;
    this.gameService.updateConfig({ impostorHints: this.config.impostorHints });
  }

  // ✅ MÉTODOS PARA EL MODAL DE CONFIGURACIÓN

  openConfigModal(): void {
    this.tempConfig = { ...this.config };
    this.showConfigModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeConfigModal(save: boolean): void {
    if (save && this.tempConfig) {
      this.gameService.updateConfig(this.tempConfig);
      this.config = { ...this.tempConfig };
    }
    this.showConfigModal = false;
    this.tempConfig = null;
    document.body.style.overflow = '';
  }

  // Helpers para categorías
  toggleCategoryModal(categoryId: string): void {
    if (!this.tempConfig) return;
    const selected = [...(this.tempConfig.selectedCategories ?? [])];
    const idx = selected.indexOf(categoryId);
    if (idx >= 0) selected.splice(idx, 1);
    else selected.push(categoryId);
    this.tempConfig.selectedCategories = selected;
  }

  isCategorySelectedInModal(categoryId: string): boolean {
    return (this.tempConfig?.selectedCategories ?? []).includes(categoryId);
  }

  // Helpers para dificultades
  toggleDifficultyModal(difficultyId: string): void {
    if (!this.tempConfig) return;
    const selected = [...(this.tempConfig.selectedDifficulties ?? [])];
    const idx = selected.indexOf(difficultyId);
    if (idx >= 0) selected.splice(idx, 1);
    else selected.push(difficultyId);
    this.tempConfig.selectedDifficulties = selected;
  }

  isDifficultySelectedInModal(difficultyId: string): boolean {
    return (this.tempConfig?.selectedDifficulties ?? []).includes(difficultyId);
  }

  // Helpers para impostores
  updateImpostorCountModal(count: number): void {
    if (!this.tempConfig) return;
    this.tempConfig.impostorCount = count;
  }

  getImpostorCountInModal(): number {
    return this.tempConfig?.impostorCount ?? 1;
  }

  // Helpers para timer
  updateTimerModal(minutes: number): void {
    if (!this.tempConfig) return;
    this.tempConfig.timerMinutes = minutes;
    this.tempConfig.showTimer = true;
  }

  setTimerOffModal(): void {
    if (!this.tempConfig) return;
    this.tempConfig.showTimer = false;
  }

  isTimerOffInModal(): boolean {
    return !(this.tempConfig?.showTimer ?? true);
  }

  getTimerMinutesInModal(): number {
    return this.tempConfig?.timerMinutes ?? 3;
  }

  // Helpers para pistas
  updateImpostorHintsModal(): void {
    if (!this.tempConfig) return;
    this.tempConfig.impostorHints = !(this.tempConfig.impostorHints ?? true);
  }

  getImpostorHintsInModal(): boolean {
    return this.tempConfig?.impostorHints ?? true;
  }

  // Helpers para quién empieza
  setStartingPlayerModal(playerId: string): void {
    if (!this.tempConfig) return;
    const newId = (this.tempConfig.startingPlayerId ?? null) === playerId ? null : playerId;
    this.tempConfig.startingPlayerId = newId;
  }

  isStartingPlayerInModal(playerId: string): boolean {
    return (this.tempConfig?.startingPlayerId ?? null) === playerId;
  }

  // ✅ Helpers para NUEVAS reglas de votación
  updateVoteModeModal(mode: 'impostor-count' | 'one-per-player'): void {
    if (!this.tempConfig) return;
    this.tempConfig.voteMode = mode;
  }

  getVoteModeInModal(): 'impostor-count' | 'one-per-player' {
    return this.tempConfig?.voteMode ?? 'impostor-count';
  }

  updateEliminationModeModal(mode: 'match-votes' | 'most-voted-only'): void {
    if (!this.tempConfig) return;
    this.tempConfig.eliminationMode = mode;
  }

  getEliminationModeInModal(): 'match-votes' | 'most-voted-only' {
    return this.tempConfig?.eliminationMode ?? 'most-voted-only';
  }

  async startGame(): Promise<void> {
    if (this.isStarting) return;
    this.isStarting = true;

    try {
      if (!this.canStart) {
        await this.showToast(
          `Necesitás al menos ${this.minPlayersNeeded} jugadores`,
          "danger",
        );
        return;
      }

      const success = this.gameService.startGame();

      if (success) {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) activeElement.blur();
        await new Promise((resolve) => setTimeout(resolve, 100));
        await this.navCtrl.navigateRoot("/role-reveal", { animated: true });
      } else {
        await this.showToast("No se pudo iniciar la partida", "danger");
      }
    } finally {
      setTimeout(() => {
        this.isStarting = false;
      }, 500);
    }
  }

  goHome(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) activeElement.blur();
    setTimeout(() => {
      this.navCtrl.navigateRoot("/home", { animated: true });
    }, 100);
  }

  private async showToast(message: string, color: string): Promise<void> {
    if (this.showed) return;
    this.showed = true;

    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: "bottom",
      cssClass: `toast-catequesis toast-${color}`,
      animated: true,
    });

    await toast.present();
    toast.onDidDismiss().then(() => { this.showed = false; });
  }
}