// src/app/pages/role-reveal/role-reveal.page.ts
import { Component, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { NavController } from "@ionic/angular";
import { GameService, GameState, Player } from "../../services/game.service";
import { Subscription } from "rxjs";

type RevealStep = "waiting" | "showing" | "hidden";

@Component({
  selector: "app-role-reveal",
  templateUrl: "role-reveal.page.html",
  styleUrls: ["role-reveal.page.scss"],
})
export class RoleRevealPage implements OnDestroy {
  state!: GameState;
  revealStep: RevealStep = "waiting";
  private sub!: Subscription;
  private hasNavigated = false; // ← NUEVO: Para evitar navegaciones múltiples

  constructor(
    private gameService: GameService,
    private navCtrl: NavController,
    private cdr: ChangeDetectorRef,
  ) {
    console.log(">>> [REVEAL] Constructor ejecutado");
  }

  ionViewWillEnter(): void {
    console.log(">>> [REVEAL] ionViewWillEnter");

    const currentState = this.gameService.currentState;

    if (currentState.phase !== "role-reveal") {
      console.log(">>> [REVEAL] Fase inválida:", currentState.phase);
      return;
    }

    this.state = { ...currentState };
    this.revealStep = "waiting";
    this.hasNavigated = false;

    console.log(
      ">>> [REVEAL] Estado cargado, jugadores:",
      this.state.players.length,
    );
    this.cdr.detectChanges();

    if (this.sub) this.sub.unsubscribe();

    this.sub = this.gameService.state$.subscribe({
      next: (s) => {
        try {
          console.log(">>> [REVEAL] Estado recibido:", {
            phase: s.phase,
            index: s.currentRevealIndex,
            players: s.players.length,
          });

          // Validar fase
          if (s.phase !== "role-reveal" && !this.hasNavigated) {
            console.log(
              ">>> [REVEAL] ⚠️ Fase cambió a:",
              s.phase,
              "- Iniciando navegación",
            );
            this.hasNavigated = true;

            setTimeout(() => {
              console.log(
                ">>> [REVEAL] 🚀 Ejecutando navigateRoot a: /" + s.phase,
              );
              this.navCtrl
                .navigateRoot("/" + s.phase, {
                  animated: false,
                  replaceUrl: true,
                })
                .then(() => {
                  console.log(">>> [REVEAL] ✅ Navegación completada");
                })
                .catch((err) => {
                  console.error(">>> [REVEAL] ❌ Error en navegación:", err);
                });
            }, 100);
            return;
          }

          this.state = { ...s };
          this.cdr.detectChanges();
        } catch (error) {
          console.error(">>> [REVEAL] ❌ Error en suscripción:", error);
        }
      },
      error: (err) => {
        console.error(">>> [REVEAL] ❌ Error en observable:", err);
      },
    });
  }

  ionViewWillLeave(): void {
    console.log(">>> [REVEAL] ionViewWillLeave");
    if (this.sub) this.sub.unsubscribe();
  }

  ngOnDestroy(): void {
    console.log(">>> [REVEAL] ngOnDestroy");
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

  showRole(): void {
    console.log(">>> [ACTION] showRole()");
    this.revealStep = "showing";
  }

  hideAndPass(): void {
    console.log(">>> [ACTION] hideAndPass() - Paso:", this.revealStep);

    // 1. Mostrar pantalla de "Pasando al siguiente..."
    this.revealStep = "hidden";
    this.cdr.detectChanges();

    // 2. Esperar la animación, actualizar datos y resetear vista
    setTimeout(() => {
      console.log(">>> [ACTION] Llamando a markRoleSeen()");
      this.gameService.markRoleSeen();

      // ✅ CORRECCIÓN CLAVE: Volver a "waiting" para que cargue la siguiente carta
      this.revealStep = "waiting";
      this.cdr.detectChanges();
    }, 400);
  }

  get progressPercent(): number {
    const total = this.totalPlayers;
    if (total === 0) return 0;
    return ((this.currentIndex + 1) / total) * 100;
  }
}
