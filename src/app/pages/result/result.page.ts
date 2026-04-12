// src/app/pages/result/result.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GameService, GameState, Player } from '../../services/game.service';
import { Subscription } from 'rxjs';

// Mensajes reflexivos según si el grupo ganó o perdió
const WIN_MESSAGES = [
  '¡Bien hecho! Así como en el juego descubrieron la verdad, en nuestra vida estamos llamados a buscar la verdad que Cristo nos enseña.',
  '¡La comunidad funcionó! Cuando trabajamos juntos, la verdad siempre sale a la luz.',
  '"La verdad os hará libres." — Jn 8,32. ¡Esta ronda lo demostraron!',
  'Encontraron al impostor porque se escucharon y observaron juntos. Así también funciona la comunidad cristiana.',
];

const LOSE_MESSAGES = [
  'El impostor los engañó esta vez. En la fe también debemos discernir con cuidado las voces que nos rodean.',
  '¡El impostor ganó! Jesús nos enseña a ser astutos como serpientes y sencillos como palomas. ¡Próxima vez!',
  'No lo encontraron... recuerden: en comunidad, vale la pena escucharse con más atención.',
  '"Sed sagaces como serpientes." — Mt 10,16. ¡El impostor aplicó bien este consejo! 😄',
];

@Component({
  selector: 'app-result',
  templateUrl: 'result.page.html',
  styleUrls: ['result.page.scss'],
})
export class ResultPage implements OnInit, OnDestroy {
  state!: GameState;
  private sub!: Subscription;

  // Datos del resultado
  mostVoted: Player | null = null;
  voteCounts: { player: Player; votes: number }[] = [];
  impostors: Player[] = [];
  isCorrect = false;
  reflexionMessage = '';

  // Animación de revelación
  revealed = false;

  // Colores de avatar
  playerColors = [
    '#d4a728', '#2a6bb5', '#2ec478', '#dc5050',
    '#8b5a2b', '#8e44ad', '#1abc9c', '#e67e22',
  ];

  constructor(private gameService: GameService, private router: Router) {}

  ngOnInit(): void {
    this.sub = this.gameService.state$.subscribe((s) => {
      this.state = s;
    });

    const result = this.gameService.votingResult;
    this.mostVoted = result.mostVoted;
    this.voteCounts = result.voteCounts;
    this.impostors = result.impostors;
    this.isCorrect = result.isCorrect;

    // Mensaje reflexivo aleatorio según resultado
    const pool = this.isCorrect ? WIN_MESSAGES : LOSE_MESSAGES;
    this.reflexionMessage = pool[Math.floor(Math.random() * pool.length)];

    // Animar la revelación con un pequeño retraso dramático
    setTimeout(() => {
      this.revealed = true;
    }, 400);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  getPlayerColor(index: number): string {
    return this.playerColors[index % this.playerColors.length];
  }

  getPlayerIndex(playerId: string): number {
    return this.state.players.findIndex((p) => p.id === playerId);
  }

  playAgain(): void {
    this.gameService.newRound();
    this.router.navigateByUrl('/players');
  }

  goHome(): void {
    this.gameService.fullReset();
    this.router.navigateByUrl('/home');
  }
}
