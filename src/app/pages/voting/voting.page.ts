// src/app/pages/voting/voting.page.ts
import { Component, OnDestroy } from "@angular/core";
import { ToastController, NavController } from "@ionic/angular";
import { GameService, Player } from "../../services/game.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-voting",
  templateUrl: "voting.page.html",
  styleUrls: ["voting.page.scss"],
})
export class VotingPage implements OnDestroy {
  private sub?: Subscription;
  private voteOrder = new Map<string, string[]>();
  private _result: any = null; // Cache del resultado

  players: Player[] = [];
  voterTurns: { voter: Player; selectedVotes: string[]; done: boolean }[] = [];
  currentVoterIndex = 0;
  requiredVotes = 1;
  voteConfirmed = false;

  constructor(
    private gameService: GameService,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
  ) {}

  ionViewWillEnter(): void {
    this._result = null; // Resetear cache

    const state = this.gameService.currentState;
    this.players = [...state.players];

    // ✅ Calcular votos requeridos según impostores RESTANTES, no configuración inicial
    const activePlayers = this.players.filter((p) => !p.isEliminated);
    const currentImpostorCount = activePlayers.filter(
      (p) => p.isImpostor,
    ).length;
    this.requiredVotes =
      state.config.voteMode === "one-per-player"
        ? 1
        : Math.max(1, currentImpostorCount);

    // Rotación circular para orden de votación
    const startingId = state.resolvedStartingPlayerId;
    let orderedPlayers = [...activePlayers];

    if (startingId) {
      const startIndex = activePlayers.findIndex((p) => p.id === startingId);
      if (startIndex >= 0) {
        orderedPlayers = [
          ...activePlayers.slice(startIndex),
          ...activePlayers.slice(0, startIndex),
        ];
      }
    }

    this.voterTurns = orderedPlayers.map((p) => ({
      voter: p,
      selectedVotes: [],
      done: false,
    }));

    if (this.sub) this.sub.unsubscribe();
    this.sub = this.gameService.state$.subscribe((state) => {
      if (state.phase !== "voting" && state.phase !== "result") {
        this.navCtrl.navigateRoot("/home", { animated: true });
      }
    });
  }

  ionViewWillLeave(): void {
    if (this.sub) this.sub.unsubscribe();
    this.voteOrder.clear();
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
    this.voteOrder.clear();
  }

  // ========== GETTERS PARA EL TEMPLATE ==========

  get currentTurn() {
    return this.voterTurns[this.currentVoterIndex] ?? null;
  }

  get candidates(): Player[] {
    const currentVoterId = this.currentTurn?.voter.id;
    return this.players.filter(
      (p) => !p.isEliminated && p.id !== currentVoterId,
    );
  }

  get allDone(): boolean {
    return this.voterTurns.every((t) => t.done);
  }

  // Resultado con cache
  get result() {
    if (!this._result) {
      this._result = this.gameService.votingResult;
    }
    return this._result;
  }

  // Helpers para el template
  get eliminatedPlayers() {
    return this.result.eliminatedPlayers || [];
  }
  get eliminatedImpostors() {
    return this.result.eliminatedImpostors || [];
  }
  get eliminatedCivilians() {
    return this.result.eliminatedCivilians || [];
  }
  get summaryTitle() {
    return this.result.summaryTitle || "";
  }
  get summaryMessage() {
    return this.result.summaryMessage || "";
  }
  get showContinueButton() {
    return this.result.canContinue;
  }
  get showVictoryBanner() {
    return this.result.isCivilVictory || this.result.isImpostorVictory;
  }
  get victoryType() {
    if (this.result.isCivilVictory) return "civil";
    if (this.result.isImpostorVictory) return "impostor";
    return null;
  }

  // Utilidades visuales
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

  getPlayerIndex(playerId: string): number {
    return this.players.findIndex((p) => p.id === playerId);
  }

  getCandidateNames(ids: string[]): string {
    return ids
      .map((id) => this.players.find((p) => p.id === id)?.name || "?")
      .join(", ");
  }

  getPlayerInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  // ========== LÓGICA DE VOTACIÓN ==========

  selectVote(candidateId: string): void {
    const currentTurn = this.currentTurn;
    if (!currentTurn || this.voteConfirmed) return;

    const voterId = currentTurn.voter.id;
    let selected = [...currentTurn.selectedVotes];
    let order = this.voteOrder.get(voterId) || [];

    if (selected.includes(candidateId)) {
      selected = selected.filter((id) => id !== candidateId);
      order = order.filter((id) => id !== candidateId);
    } else if (selected.length < this.requiredVotes) {
      selected.push(candidateId);
      order = [...order, candidateId];
    } else {
      const oldestVote = order[0];
      if (oldestVote) {
        selected = selected.filter((id) => id !== oldestVote);
        order = order.filter((id) => id !== oldestVote);
      }
      selected.push(candidateId);
      order = [...order, candidateId];
    }

    this.voteOrder.set(voterId, order);
    this.updateTurnSelection(voterId, selected);
  }

  private updateTurnSelection(voterId: string, selectedVotes: string[]): void {
    this.voterTurns = this.voterTurns.map((turn) =>
      turn.voter.id === voterId
        ? { ...turn, selectedVotes: [...selectedVotes] }
        : turn,
    );
    this.gameService.castVote(voterId, selectedVotes);
  }

  confirmVote(): void {
    const currentTurn = this.currentTurn;
    if (!currentTurn) return;
    if (currentTurn.selectedVotes.length < this.requiredVotes) return;

    this.voteConfirmed = true;
    setTimeout(() => {
      this.markTurnDone();
      this.advanceToNextVoter();
    }, 300);
  }

  private markTurnDone(): void {
    const voterId = this.currentTurn?.voter.id;
    if (!voterId) return;
    this.voterTurns = this.voterTurns.map((turn) =>
      turn.voter.id === voterId ? { ...turn, done: true } : turn,
    );
  }

  private advanceToNextVoter(): void {
    this.voteConfirmed = false;
    const nextIndex = this.currentVoterIndex + 1;

    if (nextIndex < this.voterTurns.length) {
      this.currentVoterIndex = nextIndex;
      const nextVoter = this.voterTurns[nextIndex]?.voter;
      if (nextVoter) {
        this.voteOrder.set(nextVoter.id, []);
      }
    }
  }

  // ========== ACCIONES ==========

  continueGame(): void {
    if (this.result.canContinue) {
      const success = this.gameService.continueWithSameWord();
      if (success) {
        this._result = null;
        this.navCtrl.navigateRoot("/discussion", { animated: true });
      } else {
        this.showResults();
      }
    } else {
      this.showResults();
    }
  }

  showResults(): void {
    this._result = this.gameService.votingResult;
    this.gameService.showResult();
    this.navCtrl.navigateRoot("/result", { animated: true });
  }

  async cancelGame(): Promise<void> {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) activeElement.blur();
    setTimeout(() => {
      this.gameService.fullReset();
      this.navCtrl.navigateRoot("/home", { animated: true });
    }, 100);
  }
}
