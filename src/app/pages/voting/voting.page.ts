// src/app/pages/voting/voting.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GameService, GameState, Player } from '../../services/game.service';
import { Subscription } from 'rxjs';

interface VoterTurn {
  voter: Player;
  selectedVote: string | null; // id del jugador votado
  done: boolean;
}

@Component({
  selector: 'app-voting',
  templateUrl: 'voting.page.html',
  styleUrls: ['voting.page.scss'],
})
export class VotingPage implements OnInit, OnDestroy {
  state!: GameState;
  voterTurns: VoterTurn[] = [];
  currentVoterIndex = 0;
  voteConfirmed = false;
  allDone = false;

  private sub!: Subscription;

  // Colores de avatares
  playerColors = [
    '#d4a728', '#2a6bb5', '#2ec478', '#dc5050',
    '#8b5a2b', '#8e44ad', '#1abc9c', '#e67e22',
  ];

  constructor(private gameService: GameService, private router: Router) {}

  ngOnInit(): void {
    this.sub = this.gameService.state$.subscribe((s) => {
      this.state = s;
    });

    // Preparar la lista de turnos de votación
    this.voterTurns = this.state.players.map((p) => ({
      voter: p,
      selectedVote: null,
      done: false,
    }));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get currentTurn(): VoterTurn | null {
    return this.voterTurns[this.currentVoterIndex] ?? null;
  }

  get candidates(): Player[] {
    // Puede votar a cualquiera excepto a sí mismo
    if (!this.currentTurn) return [];
    return this.state.players.filter(
      (p) => p.id !== this.currentTurn!.voter.id
    );
  }

  selectVote(candidateId: string): void {
    if (!this.currentTurn || this.voteConfirmed) return;
    this.currentTurn.selectedVote = candidateId;
  }

  confirmVote(): void {
    if (!this.currentTurn?.selectedVote) return;

    // Registrar el voto en el servicio
    this.gameService.castVote(
      this.currentTurn.voter.id,
      this.currentTurn.selectedVote
    );
    this.currentTurn.done = true;
    this.voteConfirmed = true;

    setTimeout(() => {
      this.voteConfirmed = false;
      const next = this.currentVoterIndex + 1;
      if (next >= this.voterTurns.length) {
        this.allDone = true;
      } else {
        this.currentVoterIndex = next;
      }
    }, 600);
  }

  getPlayerColor(index: number): string {
    return this.playerColors[index % this.playerColors.length];
  }

  getPlayerIndex(playerId: string): number {
    return this.state.players.findIndex((p) => p.id === playerId);
  }

  getCandidateName(candidateId: string): string {
    return this.state.players.find((p) => p.id === candidateId)?.name ?? '';
  }

  showResults(): void {
    this.gameService.showResult();
    this.router.navigateByUrl('/result');
  }
}
