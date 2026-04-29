// src/app/pages/result/result.page.ts
import { Component, OnInit, OnDestroy } from "@angular/core";
import { NavController } from "@ionic/angular";
import { GameService, Player } from "../../services/game.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-result",
  templateUrl: "result.page.html",
  styleUrls: ["result.page.scss"],
})
export class ResultPage implements OnInit, OnDestroy {
  private sub?: Subscription;

  // Datos del resultado (nueva estructura simplificada)
  eliminatedPlayers: Player[] = [];
  eliminatedImpostors: Player[] = [];
  eliminatedCivilians: Player[] = [];
  remainingImpostors = 0;
  remainingCivilians = 0;
  isCivilVictory = false;
  isImpostorVictory = false;
  canContinue = false;
  summaryTitle = "";
  summaryMessage = "";

  // Datos para mostrar en la UI
  players: Player[] = [];
  activePlayers: Player[] = [];

  constructor(
    private gameService: GameService,
    private navCtrl: NavController,
  ) {}

  ngOnInit(): void {
    this.loadResult();
  }

  ionViewWillEnter(): void {
    this.loadResult();

    // Suscribirse por si cambia el estado (aunque en result no debería)
    if (this.sub) this.sub.unsubscribe();
    this.sub = this.gameService.state$.subscribe((state) => {
      if (state.phase === "players" || state.phase === "home") {
        this.navCtrl.navigateRoot("/home", { animated: true });
      }
    });
  }

  ionViewWillLeave(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  // ✅ Cargar resultado desde el servicio (estructura nueva)
  loadResult(): void {
    const result = this.gameService.votingResult;

    // Mapear nueva estructura a propiedades locales
    this.eliminatedPlayers = result.eliminatedPlayers || [];
    this.eliminatedImpostors = result.eliminatedImpostors || [];
    this.eliminatedCivilians = result.eliminatedCivilians || [];
    this.remainingImpostors = result.remainingImpostors || 0;
    this.remainingCivilians = result.remainingCivilians || 0;
    this.isCivilVictory = result.isCivilVictory || false;
    this.isImpostorVictory = result.isImpostorVictory || false;
    this.canContinue = result.canContinue || false;
    this.summaryTitle = result.summaryTitle || "Resultado";
    this.summaryMessage = result.summaryMessage || "";

    // Cargar jugadores para mostrar en la UI
    const state = this.gameService.currentState;
    this.players = [...state.players];
    this.activePlayers = this.players.filter((p) => !p.isEliminated);
  }

  // ========== GETTERS PARA EL TEMPLATE ==========

  // ✅ Para el icono del veredicto
  get victoryIcon(): string {
    if (this.isCivilVictory) return "trophy-outline";
    if (this.isImpostorVictory) return "skull-outline";
    return "alert-circle-outline";
  }

  // ✅ Para la clase CSS del fondo/estilos
  get victoryClass(): string {
    if (this.isCivilVictory) return "victory";
    if (this.isImpostorVictory) return "defeat";
    return "";
  }

  // ✅ Para mostrar botón "Nueva ronda" (si no hay victoria definitiva)
  get showContinueOption(): boolean {
    return !this.isCivilVictory && !this.isImpostorVictory;
  }

  // ✅ Mensaje adaptado
  get victoryMessage(): string {
    if (this.isCivilVictory) {
      return this.eliminatedImpostors.length === 2
        ? "¡Ambos impostores fueron eliminados!"
        : "¡Los impostores han sido descubiertos!";
    }
    if (this.isImpostorVictory) {
      return this.remainingCivilians === 0
        ? "No quedan civiles en el juego."
        : "Los impostores son mayoría.";
    }
    return this.summaryMessage;
  }

  // ========== UTILIDADES ==========

  getPlayerColor(index: number): string {
    const colors = [
      "#d4a728",
      "#2a6bb5",
      "#2ec478",
      "#dc5050",
      "#8b5a2b",
      "#8e44ad",
      "#1abc9c",
      "#e67e22",
    ];
    return colors[index % colors.length];
  }

  getPlayerInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  getPlayerIndex(playerId: string): number {
    return this.players.findIndex((p) => p.id === playerId);
  }

  // ========== ACCIONES ==========

  newRound(): void {
    this.gameService.newRound();
    this.navCtrl.navigateRoot("/players", { animated: true });
  }

  continueGame(): void {
    if (this.canContinue) {
      const success = this.gameService.continueWithSameWord();
      if (success) {
        this.navCtrl.navigateRoot("/discussion", { animated: true });
      } else {
        // Si no se puede continuar, ir a nueva ronda
        this.newRound();
      }
    }
  }

  goHome(): void {
    this.gameService.fullReset();
    this.navCtrl.navigateRoot("/home", { animated: true });
  }

  // Inspiración final (opcional)
  get inspireMessage(): string {
    const state = this.gameService.currentState;
    return state.inspireMessage || "La verdad siempre sale a la luz.";
  }
}
