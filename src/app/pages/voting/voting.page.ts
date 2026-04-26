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

  // Tracking FIFO: voterId -> [candidateIds en orden de selección]
  private voteOrder = new Map<string, string[]>();

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
    const state = this.gameService.currentState;
    this.players = [...state.players];
    this.requiredVotes = state.config.impostorCount;

    // Obtener jugadores activos
    const activePlayers = this.players.filter((p) => !p.isEliminated);

    // ✅ FIX: Rotación circular basada en resolvedStartingPlayerId
    const startingId = state.resolvedStartingPlayerId;
    let orderedPlayers = [...activePlayers];

    if (startingId) {
      const startIndex = activePlayers.findIndex((p) => p.id === startingId);

      // ✅ Rotar SIEMPRE que encontremos el jugador (sin condición extra)
      if (startIndex >= 0) {
        orderedPlayers = [
          ...activePlayers.slice(startIndex), // Desde el starter hasta el final
          ...activePlayers.slice(0, startIndex), // Desde el inicio hasta el starter
        ];
      }
    }

    // Inicializar turnos con el orden rotado correcto
    this.voterTurns = orderedPlayers.map((p) => ({
      voter: p,
      selectedVotes: [],
      done: false,
    }));

    // Suscribirse a cambios de estado
    if (this.sub) this.sub.unsubscribe();
    this.sub = this.gameService.state$.subscribe((state) => {
      if (state.phase !== "voting") return;
      this.requiredVotes = state.config.impostorCount;
    });
  }

  ionViewWillLeave(): void {
    if (this.sub) this.sub.unsubscribe();
    this.voteOrder.clear(); // Limpieza
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
    this.voteOrder.clear(); // Limpieza final
  }

  get currentTurn() {
    return this.voterTurns[this.currentVoterIndex] ?? null;
  }

  get candidates(): Player[] {
    // ✅ FIX #2: Excluir al jugador que está votando + solo activos
    const currentVoterId = this.currentTurn?.voter.id;
    return this.players.filter(
      (p) => !p.isEliminated && p.id !== currentVoterId,
    );
  }

  get allDone(): boolean {
    return this.voterTurns.every((t) => t.done);
  }

  // ========== UTILS ==========

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

  // ========== LÓGICA PRINCIPAL: SELECT VOTE CON FIFO ==========

  selectVote(candidateId: string): void {
    const currentTurn = this.currentTurn;
    if (!currentTurn || this.voteConfirmed) return;

    const voterId = currentTurn.voter.id;
    let selected = [...currentTurn.selectedVotes];

    // Obtener o inicializar el orden de votos para este jugador
    let order = this.voteOrder.get(voterId) || [];

    // CASO 1: El candidato ya está seleccionado → Toggle OFF
    if (selected.includes(candidateId)) {
      // Remover de la selección
      selected = selected.filter((id) => id !== candidateId);
      // Remover del orden
      order = order.filter((id) => id !== candidateId);
    }
    // CASO 2: Candidato nuevo y NO estamos al máximo → Agregar normalmente
    else if (selected.length < this.requiredVotes) {
      selected.push(candidateId);
      order = [...order, candidateId];
    }
    // CASO 3: Candidato nuevo y YA estamos al máximo → FIFO: reemplazar el más viejo
    else {
      const oldestVote = order[0]; // El primero en entrar es el primero en salir

      if (oldestVote) {
        // Remover el más viejo de la selección
        selected = selected.filter((id) => id !== oldestVote);
        // Remover del orden
        order = order.filter((id) => id !== oldestVote);
      }

      // Agregar el nuevo al final
      selected.push(candidateId);
      order = [...order, candidateId];
    }

    // Actualizar tracking y estado
    this.voteOrder.set(voterId, order);
    this.updateTurnSelection(voterId, selected);
  }

  private updateTurnSelection(voterId: string, selectedVotes: string[]): void {
    this.voterTurns = this.voterTurns.map((turn) =>
      turn.voter.id === voterId
        ? { ...turn, selectedVotes: [...selectedVotes] }
        : turn,
    );

    // Guardar en el servicio (para persistencia si es necesario)
    this.gameService.castVote(voterId, selectedVotes);
  }

  // ========== CONFIRMAR VOTO ==========

  confirmVote(): void {
    const currentTurn = this.currentTurn;
    if (!currentTurn) return;

    // Validar que tenga la cantidad correcta de votos
    if (currentTurn.selectedVotes.length < this.requiredVotes) return;

    // Marcar como confirmado y avanzar
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
    // Resetear tracking para el próximo votante
    this.voteConfirmed = false;

    const nextIndex = this.currentVoterIndex + 1;

    if (nextIndex < this.voterTurns.length) {
      // Hay más votantes
      this.currentVoterIndex = nextIndex;

      // Resetear orden para el nuevo votante
      const nextVoter = this.voterTurns[nextIndex]?.voter;
      if (nextVoter) {
        this.voteOrder.set(nextVoter.id, []);
      }
    } else {
      // Todos votaron → mostrar resumen
      this.showAllDone();
    }
  }

  private showAllDone(): void {
    // El template detecta `allDone` automáticamente
    // Opcional: pequeño delay para animación
  }

  // ========== REVELAR RESULTADO ==========

  showResults(): void {
    this.gameService.showResult();
    this.navCtrl.navigateRoot("/result", { animated: true });
  }

  // ========== CANCELAR PARTIDA ==========

  async cancelGame(): Promise<void> {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) activeElement.blur();

    setTimeout(() => {
      this.gameService.fullReset();
      this.navCtrl.navigateRoot("/home", { animated: true });
    }, 100);
  }
}
