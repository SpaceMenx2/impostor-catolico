// src/app/pages/role-reveal/role-reveal.page.ts
import { Component, OnInit, OnDestroy } from "@angular/core";
import { NavController } from "@ionic/angular"; // <-- Importar NavController
import { GameService, GameState, Player } from "../../services/game.service";
import { Subscription } from "rxjs";

type RevealStep = "waiting" | "showing" | "hidden";

@Component({
  selector: "app-role-reveal",
  templateUrl: "role-reveal.page.html",
  styleUrls: ["role-reveal.page.scss"],
})
export class RoleRevealPage implements OnInit, OnDestroy {
  state!: GameState;
  revealStep: RevealStep = "waiting";
  private sub!: Subscription;

  // Inyectar NavController también aquí por si necesitas navegar desde esta página
  constructor(
    private gameService: GameService,
    private navCtrl: NavController,
  ) {}

  ngOnInit(): void {
    // Forzar estado inicial
    this.revealStep = "waiting";

    this.sub = this.gameService.state$.subscribe((s) => {
      this.state = s;
      // Si la fase cambió, navegar con NavController
      if (s.phase === "discussion") {
        this.navCtrl.navigateForward("/discussion", { animated: true });
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get currentPlayer(): Player | null {
    const players = this.state?.players;
    const index = this.state?.currentRevealIndex ?? 0;

    if (!players || index < 0 || index >= players.length) {
      return null;
    }
    return players[index];
  }

  get totalPlayers(): number {
    return this.state?.players?.length ?? 0;
  }

  get currentIndex(): number {
    return this.state?.currentRevealIndex ?? 0;
  }

  showRole(): void {
    this.revealStep = "showing";
  }

  hideAndPass(): void {
    this.revealStep = "hidden";
    setTimeout(() => {
      this.gameService.markRoleSeen();
      this.revealStep = "waiting";
    }, 400);
  }

  get progressPercent(): number {
    const total = this.totalPlayers;
    if (total === 0) return 0;
    return ((this.currentIndex + 1) / total) * 100;
  }
}
