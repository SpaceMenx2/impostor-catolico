// src/app/pages/voting/voting.page.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { NavController, AlertController } from "@ionic/angular";
import { GameService, GameState, Player } from "../../services/game.service";
import { Subscription } from "rxjs";

interface VoterTurn {
  voter: Player;
  selectedVote: string | null;
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

    this.voterTurns = this.gameService.activePlayers.map((p) => ({
      voter: p,
      selectedVote: null,
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

  get candidates(): Player[] {
    const active = this.gameService.activePlayers;
    const currentVoterId = this.currentTurn?.voter?.id;

    return active.filter((p) => p.id !== currentVoterId);
  }

  selectVote(candidateId: string): void {
    if (!this.currentTurn || this.voteConfirmed) return;
    this.currentTurn.selectedVote = candidateId;
  }

  confirmVote(): void {
    if (!this.currentTurn?.selectedVote) return;

    this.gameService.castVote(
      this.currentTurn.voter.id,
      this.currentTurn.selectedVote,
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
