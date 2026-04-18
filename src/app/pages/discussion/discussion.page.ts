// src/app/pages/discussion/discussion.page.ts
import { Component, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { NavController, AlertController } from "@ionic/angular";
import { DEFAULT_CONFIG, GameService, GameState } from "../../services/game.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-discussion",
  templateUrl: "discussion.page.html",
  styleUrls: ["discussion.page.scss"],
})
export class DiscussionPage implements OnDestroy {
  state: GameState = {
    phase: "discussion",
    players: [],
    config: DEFAULT_CONFIG,
    currentWord: null,
    currentCategory: null,
    currentRevealIndex: 0,
    roundNumber: 1,
    inspireMessage: "",
  };

  timeLeft = 0;
  totalTime = 0;
  timerRunning = false;
  timerFinished = false;

  private sub!: Subscription;
  private interval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private gameService: GameService,
    private navCtrl: NavController,
    private alertCtrl: AlertController, // NEW #3
    private cdr: ChangeDetectorRef,
  ) {}

  ionViewWillEnter(): void {
    const currentState = this.gameService.currentState;
    this.state = { ...currentState };
    this.cdr.detectChanges();

    const minutes = currentState.config.timerMinutes;
    this.totalTime = minutes * 60;
    this.timeLeft = this.totalTime;
    this.timerFinished = false;

    if (currentState.config.showTimer) {
      this.startTimer();
    }

    if (this.sub) this.sub.unsubscribe();
    this.sub = this.gameService.state$.subscribe((s) => {
      this.state = { ...s };
      this.cdr.detectChanges();
    });
  }

  ionViewWillLeave(): void {
    if (this.sub) this.sub.unsubscribe();
    this.clearTimer();
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
    this.clearTimer();
  }

  startTimer(): void {
    if (this.timerRunning) return;
    this.timerRunning = true;
    this.timerFinished = false;

    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timerFinished = true;
        this.timerRunning = false;
        this.clearTimer();
      }
    }, 1000);
  }

  pauseTimer(): void {
    this.timerRunning = false;
    this.clearTimer();
  }

  resetTimer(): void {
    this.clearTimer();
    this.timeLeft = this.totalTime;
    this.timerRunning = false;
    this.timerFinished = false;
  }

  private clearTimer(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.timerRunning = false;
  }

  get timerDisplay(): string {
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  get timerPercent(): number {
    if (this.totalTime === 0) return 100;
    return (this.timeLeft / this.totalTime) * 100;
  }

  get timerColor(): string {
    if (this.timerPercent > 50) return "#2ec478";
    if (this.timerPercent > 20) return "#f0b429";
    return "#dc5050";
  }

  get roundNumber(): number {
    return this.state?.roundNumber ?? 1;
  }

  get playerNames(): string[] {
    return this.state?.players?.map((p) => p.name) ?? [];
  }

  // NEW #3: Mostrar quién empieza si fue configurado
  get startingPlayerName(): string | null {
    const id = this.state?.config?.startingPlayerId;
    if (!id) return null;
    return this.state?.players?.find((p) => p.id === id)?.name ?? null;
  }

  goToVoting(): void {
    this.clearTimer();
    this.gameService.startVoting();
    this.navCtrl.navigateForward("/voting", {
      animated: true,
      replaceUrl: true,
    });
  }

  // NEW #3: Cancelar partida con confirmación + limpieza de timer
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
            // NEW #3: Limpiar timer antes de navegar (evitar fugas de memoria)
            this.clearTimer();
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
