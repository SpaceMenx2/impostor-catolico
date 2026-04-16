// src/app/pages/result/result.page.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { NavController } from "@ionic/angular";
import { GameService, GameState, Player } from "../../services/game.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-result",
  templateUrl: "result.page.html",
  styleUrls: ["result.page.scss"],
})
export class ResultPage implements OnInit, OnDestroy {
  state!: GameState;
  private sub!: Subscription;

  mostVoted: Player | null = null;
  voteCounts: { player: Player; votes: number }[] = [];
  impostors: Player[] = [];

  get isCorrect(): boolean {
    return this.mostVoted?.isImpostor ?? false;
  }

  get canContinue(): boolean {
    if (!this.mostVoted) return false;
    const impostorCount = this.state.players.filter((p) => p.isImpostor).length;
    const remaining = this.state.players.filter(
      (p) => p.id !== this.mostVoted!.id,
    );
    const civilianCount = remaining.filter((p) => !p.isImpostor).length;
    return !this.isCorrect && civilianCount > impostorCount;
  }

  get remainingImpostors(): number {
    if (!this.mostVoted) return 0;
    return this.state.players.filter(
      (p) => p.isImpostor && p.id !== this.mostVoted!.id,
    ).length;
  }

  reflexionMessage = "";
  revealed = false;

  playerColors = [
    "#D4A728",
    "#2A6BB5",
    "#2EC478",
    "#DC5050",
    "#8B5A2B",
    "#8E44AD",
    "#1ABC9C",
    "#E67E22",
    "#C0392B",
    "#2980B9",
    "#27AE60",
    "#D35400",
    "#6C5CE7",
    "#00B894",
    "#E84393",
    "#F39C12",
    "#16A085",
    "#9B59B6",
    "#34495E",
    "#E17055",
    "#0984E3",
    "#00CEC9",
    "#A0522D",
    "#5F27CD",
  ];

  constructor(
    private gameService: GameService,
    private navCtrl: NavController,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.sub = this.gameService.state$.subscribe((s) => {
      this.state = s;
    });

    const result = this.gameService.votingResult;
    this.mostVoted = result.mostVoted;
    this.voteCounts = result.voteCounts;
    this.impostors = result.impostors;

    setTimeout(() => {
      const content = document.querySelector("ion-content.result-content");
      if (content && !this.isCorrect) content.classList.add("lose-result");
    }, 100);

    const WIN_MESSAGES = [
      "¡Bien hecho! Así como en el juego descubrieron la verdad, en nuestra vida estamos llamados a buscar la verdad que Cristo nos enseña.",
      "¡La comunidad funcionó! Cuando trabajamos juntos, la verdad siempre sale a la luz.",
      '"La verdad os hará libres." — Jn 8,32. ¡Esta ronda lo demostraron!',
      "Encontraron al impostor porque se escucharon y observaron juntos. Así también funciona la comunidad cristiana.",
    ];
    const LOSE_MESSAGES = [
      "El impostor los engañó esta vez. En la fe también debemos discernir con cuidado las voces que nos rodean.",
      "¡El impostor ganó! Jesús nos enseña a ser astutos como serpientes y sencillos como palomas. ¡Próxima vez!",
      "No lo encontraron... recuerden: en comunidad, vale la pena escucharse con más atención.",
      '"Sed sagaces como serpientes." — Mt 10,16. ¡El impostor aplicó bien este consejo! 😄',
    ];

    const pool = this.isCorrect ? WIN_MESSAGES : LOSE_MESSAGES;
    this.reflexionMessage = pool[Math.floor(Math.random() * pool.length)];

    setTimeout(() => {
      this.revealed = true;
      this.cdr.detectChanges();
    }, 400);

    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  getPlayerColor(index: number): string {
    return this.playerColors[index % this.playerColors.length];
  }

  getPlayerIndex(playerId: string): number {
    return this.state?.players?.findIndex((p) => p.id === playerId) ?? 0;
  }

  playAgain(): void {
    const currentResult = this.gameService.votingResult;
    const isCorrect = currentResult.isCorrect;
    const canContinue = currentResult.canContinue;

    if (!isCorrect && canContinue) {
      this.navCtrl.navigateRoot("/discussion", {
        animated: true,
        replaceUrl: true,
      });

      setTimeout(() => {
        this.gameService.continueWithSameWord();
      }, 50);
    } else {
      this.navCtrl.navigateRoot("/players", {
        animated: true,
        replaceUrl: true,
      });

      setTimeout(() => {
        this.gameService.newRound();
      }, 50);
    }
  }

  goHome(): void {
    this.gameService.fullReset();
    setTimeout(() => {
      this.navCtrl.navigateRoot("/home", { animated: true, replaceUrl: true });
    }, 100);
  }
}
