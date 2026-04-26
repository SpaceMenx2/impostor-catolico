// src/app/pages/voting/voting.page.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { NavController, AlertController } from "@ionic/angular";
import { GameService, GameState, Player } from "../../services/game.service";
import { Subscription } from "rxjs";

interface VoterTurn {
  voter: Player;
  selectedVotes: string[];
  done: boolean;
}

@Component({
  selector: "app-voting",
  templateUrl: "voting.page.html",
  styleUrls: ["voting.page.scss"],
})
export class VotingPage implements OnInit, OnDestroy {
  state!: GameState;
  voterTurns: VoterTurn[] = [];
  currentVoterIndex = 0;
  voteConfirmed = false;
  allDone = false;

  private sub!: Subscription;

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
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.sub = this.gameService.state$.subscribe((s) => {
      this.state = s;
    });

    // Bug 1: ordenar el turno de votación empezando desde el jugador inicial
    const activePlayers = this.gameService.activePlayers;
    const startingId = this.gameService.currentState.resolvedStartingPlayerId;
    let startIndex = startingId
      ? activePlayers.findIndex((p) => p.id === startingId)
      : 0;
    if (startIndex < 0) startIndex = 0;

    const ordered = [
      ...activePlayers.slice(startIndex),
      ...activePlayers.slice(0, startIndex),
    ];

    this.voterTurns = ordered.map((p) => ({
      voter: p,
      selectedVotes: [],
      done: false,
    }));

    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get currentTurn(): VoterTurn | null {
    return this.voterTurns[this.currentVoterIndex] ?? null;
  }

  // Bug 2: cuántos votos debe emitir cada jugador = cantidad de impostores activos
  get requiredVotes(): number {
    return this.gameService.activePlayers.filter((p) => p.isImpostor).length;
  }

  get candidates(): Player[] {
    const active = this.gameService.activePlayers;
    const currentVoterId = this.currentTurn?.voter?.id;
    return active.filter((p) => p.id !== currentVoterId);
  }

  // Bug 2: toggle de selección múltiple hasta el límite requerido
  selectVote(candidateId: string): void {
    if (!this.currentTurn || this.voteConfirmed) return;
    const votes = this.currentTurn.selectedVotes;
    const idx = votes.indexOf(candidateId);
    if (idx >= 0) {
      this.currentTurn.selectedVotes = votes.filter((id) => id !== candidateId);
    } else if (votes.length < this.requiredVotes) {
      this.currentTurn.selectedVotes = [...votes, candidateId];
    }
  }

  // Bug 2: confirmar voto solo cuando se hayan elegido exactamente los votos requeridos
  confirmVote(): void {
    if (!this.currentTurn || this.currentTurn.selectedVotes.length < this.requiredVotes) return;

    this.gameService.castVote(
      this.currentTurn.voter.id,
      this.currentTurn.selectedVotes,
    );
    this.currentTurn.done = true;
    this.voteConfirmed = true;

    setTimeout(() => {
      this.voteConfirmed = false;
      const next = this.currentVoterIndex + 1;
      if (next >= this.voterTurns.length) {
        this.allDone = true;
        this.cdr.detectChanges();
      } else {
        this.currentVoterIndex = next;
      }
    }, 600);
  }

  getPlayerColor(index: number): string {
    return this.playerColors[index % this.playerColors.length];
  }

  getPlayerIndex(playerId: string): number {
    return this.state?.players?.findIndex((p) => p.id === playerId) ?? 0;
  }

  getCandidateName(candidateId: string): string {
    return this.state.players.find((p) => p.id === candidateId)?.name ?? "";
  }

  getCandidateNames(candidateIds: string[]): string {
    return candidateIds
      .map((id) => this.getCandidateName(id))
      .join(" y ");
  }

  showResults(): void {
    this.gameService.showResult();
    this.navCtrl
      .navigateRoot("/result", { animated: true, replaceUrl: true })
      .catch((err) => console.error("[VOTING] Nav error:", err));
  }

  async cancelGame(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: "¿Cancelar partida?",
      message: "Se perderá el progreso de la ronda actual.",
      cssClass: "cancel-alert",
      buttons: [
        { text: "Continuar jugando", role: "cancel" },
        {
          text: "Sí, cancelar",
          role: "destructive",
          handler: () => {
            if (this.sub) this.sub.unsubscribe();
            this.gameService.newRound();
            this.navCtrl.navigateRoot("/players", {
              animated: true,
              replaceUrl: true,
            });
          },
        },
      ],
    });
    await alert.present();
  }
}
