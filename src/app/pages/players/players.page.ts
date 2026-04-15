// src/app/pages/players/players.page.ts
import { Component, ChangeDetectorRef, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { ToastController, NavController } from "@ionic/angular";
import { GameService, GameConfig, Player } from "../../services/game.service";
import { WordCategory, WORD_CATEGORIES } from "../../data/words";
import { Subscription } from "rxjs";

@Component({
  selector: "app-players",
  templateUrl: "players.page.html",
  styleUrls: ["players.page.scss"],
})
export class PlayersPage implements OnDestroy {
  players: Player[] = [];
  config: GameConfig = {
    impostorCount: 1,
    timerMinutes: 3,
    selectedCategories: [],
    showTimer: true,
    startingPlayerId: null, // NEW #7
  };
  isStarting = false;
  newPlayerName = "";
  categories: WordCategory[] = WORD_CATEGORIES;
  showConfig = false;
  private sub?: Subscription;

  playerColors = [
    "#d4a728", "#2a6bb5", "#2ec478", "#dc5050",
    "#8b5a2b", "#8e44ad", "#1abc9c", "#e67e22",
  ];

  constructor(
    private gameService: GameService,
    private router: Router,
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
    // FIX #6: Al seleccionar un tiempo, activar el timer Y establecer los minutos juntos
    this.config.timerMinutes = minutes;
    this.config.showTimer = true;
    this.gameService.updateConfig({ timerMinutes: minutes, showTimer: true });
  }

  // FIX #6: toggleTimer ahora es un setter limpio de estado booleano
  setTimerOff(): void {
    this.config.showTimer = false;
    this.gameService.updateConfig({ showTimer: false });
  }

  toggleConfig(): void {
    this.showConfig = !this.showConfig;
  }

  // NEW #7: Seleccionar quién empieza diciendo una palabra
  setStartingPlayer(playerId: string): void {
    // Si ya está seleccionado, deseleccionar (toggle)
    const newId = this.config.startingPlayerId === playerId ? null : playerId;
    this.config.startingPlayerId = newId;
    this.gameService.updateConfig({ startingPlayerId: newId });
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
      setTimeout(() => { this.isStarting = false; }, 500);
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
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: "top",
    });
    await toast.present();
  }
}
