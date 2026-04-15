// src/app/pages/role-reveal/role-reveal.page.ts
import { Component, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { NavController, AlertController } from "@ionic/angular";
import { GameService, GameState, Player } from "../../services/game.service";
import { Subscription } from "rxjs";

type RevealStep = "waiting" | "showing" | "hidden";

// NEW #8: Santos para civiles y Judas para impostores
const SAINT_BACKGROUNDS = [
  "assets/backgrounds/saint-francis.webp",
  "assets/backgrounds/saint-teresa.webp",
  "assets/backgrounds/saint-john.webp",
  "assets/backgrounds/saint-mary.webp",
  "assets/backgrounds/saint-peter.webp",
  "assets/backgrounds/saint-paul.webp",
];
const JUDAS_BACKGROUND = "assets/backgrounds/judas.webp";

@Component({
  selector: "app-role-reveal",
  templateUrl: "role-reveal.page.html",
  styleUrls: ["role-reveal.page.scss"],
})
export class RoleRevealPage implements OnDestroy {
  state!: GameState;
  revealStep: RevealStep = "waiting";
  // NEW #8: fondo contextual del rol mostrado
  roleBgImage = "";
  roleBgLoaded = false;

  private sub!: Subscription;
  private hasNavigated = false;

  constructor(
    private gameService: GameService,
    private navCtrl: NavController,
    private alertCtrl: AlertController, // NEW #3
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

          // FIX #5: Limpiar el estado visual ANTES de navegar
          // Usar requestAnimationFrame para garantizar que el DOM ya procesó
          // el estado "hidden" antes de cambiar de ruta
          requestAnimationFrame(() => {
            this.navCtrl
              .navigateRoot("/" + s.phase, { animated: false, replaceUrl: true })
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

    // NEW #8: Precargar imagen de fondo según el rol
    if (this.currentPlayer) {
      const url = this.currentPlayer.isImpostor
        ? JUDAS_BACKGROUND
        : SAINT_BACKGROUNDS[Math.floor(Math.random() * SAINT_BACKGROUNDS.length)];
      this.roleBgImage = url;
      this.roleBgLoaded = false;

      const img = new Image();
      img.onload = () => {
        this.roleBgLoaded = true;
        this.cdr.detectChanges();
      };
      img.onerror = () => {
        // Fallback: color sólido via CSS, no mostrar imagen rota
        this.roleBgImage = "";
        this.cdr.detectChanges();
      };
      img.src = url;
    }
  }

  hideAndPass(): void {
    // FIX #5: Detectar si este es el último jugador ANTES de llamar a markRoleSeen
    const isLastPlayer = this.currentIndex + 1 >= this.totalPlayers;

    // Mostrar pantalla de transición
    this.revealStep = "hidden";
    this.roleBgImage = "";
    this.roleBgLoaded = false;
    this.cdr.detectChanges();

    setTimeout(() => {
      if (isLastPlayer) {
        // FIX #5: Para el último jugador, evitar el flash del contador de votación
        // hasNavigated previene que el subscriber muestre el estado intermedio
        this.hasNavigated = true;
        this.gameService.markRoleSeen();
        // La navegación se dispara desde el subscriber o forzamos directo
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

  // NEW #3: Botón cancelar con confirmación
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
            this.navCtrl.navigateRoot("/players", { animated: true, replaceUrl: true });
          },
        },
      ],
    });
    await alert.present();
  }
}
