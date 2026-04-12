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
  };

  newPlayerName = "";
  categories: WordCategory[] = WORD_CATEGORIES;
  showConfig = false;
  private sub?: Subscription;

  playerColors = [
    "#d4a728",
    "#2a6bb5",
    "#2ec478",
    "#dc5050",
    "#8b5a2b",
    "#8e44ad",
    "#1abc9c",
    "#e67e22",
  ];

  constructor(
    private gameService: GameService,
    private router: Router,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private cdr: ChangeDetectorRef, // <-- CRUCIAL PARA FORZAR RENDERIZADO
  ) {}

  // En players.page.ts - ionViewWillEnter
  ionViewWillEnter(): void {
    console.log(">>> [1] ionViewWillEnter iniciado");

    const currentState = this.gameService.currentState;
    console.log(">>> [2] Fase actual:", currentState.phase);
    console.log(">>> [3] Jugadores:", currentState.players.length);

    if (currentState.phase !== "home" && currentState.phase !== "players") {
      console.log(">>> [4] Fase inválida, redirigiendo a home");
      this.navCtrl.navigateRoot("/home", { animated: true });
      return;
    }

    this.players = [...currentState.players];
    this.config = { ...currentState.config };
    console.log(">>> [5] Datos cargados, players:", this.players.length);

    this.cdr.detectChanges();
    console.log(">>> [6] detectChanges() ejecutado");

    if (this.sub) this.sub.unsubscribe();

    this.sub = this.gameService.state$.subscribe((state) => {
      console.log(
        ">>> [SUB] Fase:",
        state.phase,
        "Jugadores:",
        state.players.length,
      );

      // DEBUG: Si la fase cambió inesperadamente, loguealo
      if (state.phase !== "home" && state.phase !== "players") {
        console.warn(">>> [SUB] Fase inválida detectada:", state.phase);
      }

      this.players = [...state.players];
      this.config = { ...state.config };
      this.cdr.detectChanges();
    });

    console.log(">>> [7] ionViewWillEnter finalizado");
  }

  ionViewWillLeave(): void {
    // Limpiar suscripción al salir para evitar memory leaks o conflictos
    if (this.sub) this.sub.unsubscribe();
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  // ... [EL RESTO DE TUS MÉTODOS (addPlayer, removePlayer, startGame, etc.) SE QUEDAN IGUAL] ...

  get canStart(): boolean {
    const minPlayers = this.config.impostorCount + 2;
    return this.players.length >= minPlayers;
  }

  get minPlayersNeeded(): number {
    return this.config.impostorCount + 2;
  }

  addPlayer(): void {
    console.log(">>> [ADD] addPlayer() llamado");

    if (!this.newPlayerName.trim()) {
      console.log(">>> [ADD] Nombre vacío");
      return;
    }

    const success = this.gameService.addPlayer(this.newPlayerName);
    console.log(
      ">>> [ADD] Resultado:",
      success,
      "Jugadores ahora:",
      this.gameService.currentState.players.length,
    );

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
    this.gameService.updateConfig({ timerMinutes: minutes });
  }

  toggleTimer(): void {
    this.config.showTimer = !this.config.showTimer;
    this.gameService.updateConfig({ showTimer: this.config.showTimer });
  }

  toggleConfig(): void {
    this.showConfig = !this.showConfig;
  }

  async startGame(): Promise<void> {
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
      await new Promise((resolve) => setTimeout(resolve, 50));
      await this.navCtrl.navigateForward("/role-reveal", { animated: true });
    } else {
      await this.showToast("No se pudo iniciar la partida", "danger");
    }
  }

  // En goHome():
  goHome(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) activeElement.blur();

    setTimeout(() => {
      // Usar navigateRoot para ir al home limpiando el stack de navegación
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
