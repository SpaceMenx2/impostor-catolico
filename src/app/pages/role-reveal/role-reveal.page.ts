// src/app/pages/role-reveal/role-reveal.page.ts
import { Component, OnDestroy, ChangeDetectorRef, ViewEncapsulation } from "@angular/core";
import { NavController, AlertController } from "@ionic/angular";
import { GameService, GameState, Player } from "../../services/game.service";
import { Subscription } from "rxjs";

type RevealStep = "waiting" | "showing" | "hidden";

const BASE = (name: string) => `assets/backgrounds/${name}.webp`

const SAINT_BACKGROUNDS = [
  BASE("saint-francis"),
  BASE("saint-teresa"),
  BASE("saint-mary"),
  BASE("saint-peter"),
  BASE("saint-paul"),
  BASE("saint-carlo-acutis"),
  BASE("saint-pier-giorgio")
];
const JUDAS_BACKGROUND =  BASE("judas");

@Component({
  selector: "app-role-reveal",
  templateUrl: "role-reveal.page.html",
  styleUrls: ["role-reveal.page.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class RoleRevealPage implements OnDestroy {
  state!: GameState;
  revealStep: RevealStep = "waiting";

  roleBgImage = "";
  roleBgLoaded = false;

  private sub!: Subscription;
  private hasNavigated = false;

  constructor(
    private gameService: GameService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
  ) {}

  ionViewWillEnter(): void {
    const currentState = this.gameService.currentState;

    if (currentState.phase !== "role-reveal") return;

    this.state = { ...currentState };
    this.revealStep = "waiting";
    this.hasNavigated = false;
    this.roleBgImage = "";
    this.roleBgLoaded = false;
    this.cdr.detectChanges();

    if (this.sub) this.sub.unsubscribe();

    this.sub = this.gameService.state$.subscribe({
      next: (s) => {
        if (s.phase !== "role-reveal" && !this.hasNavigated) {
          this.hasNavigated = true;

          requestAnimationFrame(() => {
            this.navCtrl
              .navigateRoot("/" + s.phase, {
                animated: false,
                replaceUrl: true,
              })
              .catch((err) => console.error("[REVEAL] Nav error:", err));
          });
          return;
        }

        this.state = { ...s };
        this.cdr.detectChanges();
      },
      error: (err) => console.error("[REVEAL] Observable error:", err),
    });
  }

  ionViewWillLeave(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  get currentPlayer(): Player | null {
    const players = this.state?.players;
    const index = this.state?.currentRevealIndex ?? 0;
    if (!players || index < 0 || index >= players.length) return null;
    return players[index];
  }

  get totalPlayers(): number {
    return this.state?.players?.length ?? 0;
  }

  get currentIndex(): number {
    return this.state?.currentRevealIndex ?? 0;
  }

  get progressPercent(): number {
    const total = this.totalPlayers;
    if (total === 0) return 0;
    return ((this.currentIndex + 1) / total) * 100;
  }

  showRole(): void {
    this.revealStep = "showing";

    if (this.currentPlayer) {
      const url = this.currentPlayer.isImpostor
        ? JUDAS_BACKGROUND
        : SAINT_BACKGROUNDS[
            Math.floor(Math.random() * SAINT_BACKGROUNDS.length)
          ];
      this.roleBgImage = url;
      this.roleBgLoaded = false;

      const img = new Image();
      img.onload = () => {
        this.roleBgLoaded = true;
        this.cdr.detectChanges();
      };
      img.onerror = () => {
        this.roleBgImage = "";
        this.cdr.detectChanges();
      };
      img.src = url;
    }
  }

  get showImpostorHint(): boolean {
    return (
      this.currentPlayer?.isImpostor as boolean &&
      this.state?.config?.impostorHints &&
      !!this.state.currentWord?.hint
    );
  }

  get impostorHintText(): string {
    return (this.state.currentWord)?.hint || "";
  }

  hideAndPass(): void {
    const isLastPlayer = this.currentIndex + 1 >= this.totalPlayers;

    this.revealStep = "hidden";
    this.roleBgImage = "";
    this.roleBgLoaded = false;
    this.cdr.detectChanges();

    setTimeout(() => {
      if (isLastPlayer) {
        this.hasNavigated = true;
        this.gameService.markRoleSeen();
        requestAnimationFrame(() => {
          this.navCtrl
            .navigateRoot("/discussion", { animated: false, replaceUrl: true })
            .catch((err) => console.error("[REVEAL] Nav error (last):", err));
        });
      } else {
        this.gameService.markRoleSeen();
        this.revealStep = "waiting";
        this.cdr.detectChanges();
      }
    }, 400);
  }

  async cancelGame(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: "¿Cancelar partida?",
      message: "Se perderá el progreso de la ronda actual.",
      cssClass: "cancel-alert",
      buttons: [
        {
          text: "Continuar jugando",
          role: "cancel",
        },
        {
          text: "Sí, cancelar",
          role: "destructive",
          handler: () => {
            this.hasNavigated = true;
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
