// src/app/pages/discussion/discussion.page.ts
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { GameService, GameState } from "../../services/game.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-discussion",
  templateUrl: "discussion.page.html",
  styleUrls: ["discussion.page.scss"],
})
export class DiscussionPage implements OnInit, OnDestroy {
  state!: GameState;
  timeLeft = 0;
  totalTime = 0;
  timerRunning = false;
  timerFinished = false;

  private sub!: Subscription;
  private interval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private gameService: GameService,
    private router: Router,
  ) {
    console.log(">>> CONSTRUCTOR DiscussionPage EJECUTADO <<<");
  }

  ngOnInit(): void {
    // Suscribirse al estado
    this.sub = this.gameService.state$.subscribe((s) => {
      this.state = s;

      // Inicializar timer cuando llega el estado
      if (this.totalTime === 0) {
        const minutes = s.config.timerMinutes;
        this.totalTime = minutes * 60;
        this.timeLeft = this.totalTime;

        // Iniciar automáticamente si está habilitado
        if (s.config.showTimer) {
          this.startTimer();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
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

  goToVoting(): void {
    this.clearTimer();
    this.gameService.startVoting();
    this.router.navigateByUrl("/voting");
  }
}
