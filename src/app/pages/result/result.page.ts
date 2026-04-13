// src/app/pages/result/result.page.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { NavController } from "@ionic/angular";
import { GameService, GameState, Player } from "../../services/game.service";
import { Subscription } from "rxjs";

// Mensajes reflexivos (se quedan igual)
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

@Component({
  selector: "app-result",
  templateUrl: "result.page.html",
  styleUrls: ["result.page.scss"],
})
export class ResultPage implements OnInit, OnDestroy {
  state!: GameState;
  private sub!: Subscription;

  // Datos del resultado (se calculan una vez)
  mostVoted: Player | null = null;
  voteCounts: { player: Player; votes: number }[] = [];
  impostors: Player[] = [];

  // ✅ NUEVO: Getters que calculan en tiempo real
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
    // Condición: civiles restantes >= impostores + 2
    return !this.isCorrect && civilianCount >= impostorCount + 2;
  }

  reflexionMessage = "";
  revealed = false;

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
    // ✅ NO asignamos isCorrect ni canContinue aquí, usamos los getters

    // Cambiar fondo según resultado
    setTimeout(() => {
      const content = document.querySelector("ion-content.result-content");
      if (content && !this.isCorrect) {
        content.classList.add("lose-result");
      }
    }, 100);

    // Mensaje reflexivo
    const pool = this.isCorrect ? WIN_MESSAGES : LOSE_MESSAGES;
    this.reflexionMessage = pool[Math.floor(Math.random() * pool.length)];

    // Animación
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

  // ✅ CORREGIDO: Usar getters en tiempo real
  playAgain(): void {
    // ✅ Calcular valores en tiempo real con getters o directamente
    const currentResult = this.gameService.votingResult;
    const isCorrect = currentResult.isCorrect;
    const canContinue = currentResult.canContinue;

    console.log(
      ">>> [RESULT] playAgain() - isCorrect:",
      isCorrect,
      "canContinue:",
      canContinue,
    );

    if (!isCorrect && canContinue) {
      // Impostor escapó y podemos seguir con la misma palabra
      console.log(
        ">>> [RESULT] Continuando con misma palabra, eliminando a:",
        currentResult.mostVoted?.name,
      );

      const continued = this.gameService.continueWithSameWord();

      if (continued) {
        // Volver a discussion con la misma palabra
        setTimeout(() => {
          this.navCtrl.navigateRoot("/discussion", {
            animated: true,
            replaceUrl: true,
          });
        }, 100);
      } else {
        // Los impostores ganaron
        console.log(
          ">>> [RESULT] Impostores ganaron. Mostrando resultado final.",
        );
        // Ya estamos en result.page, solo forzamos detección de cambios
        this.cdr.detectChanges();
      }
    } else {
      // Nueva partida completa (civiles ganaron o no se puede continuar)
      console.log(">>> [RESULT] Iniciando nueva partida");
      this.gameService.fullReset();
      setTimeout(() => {
        this.navCtrl.navigateRoot("/players", {
          animated: true,
          replaceUrl: true,
        });
      }, 100);
    }
  }

  goHome(): void {
    this.gameService.fullReset();
    setTimeout(() => {
      this.navCtrl.navigateRoot("/home", {
        animated: true,
        replaceUrl: true,
      });
    }, 100);
  }
}
