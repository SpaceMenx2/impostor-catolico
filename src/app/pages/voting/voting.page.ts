// src/app/pages/voting/voting.page.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NavController } from '@ionic/angular'; // <-- Cambiar Router por NavController
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
  playerColors = [ /* ... tus colores ... */ ];

  constructor(
    private gameService: GameService, 
    private navCtrl: NavController, // <-- Inyectar NavController
    private cdr: ChangeDetectorRef, // <-- Para forzar detección
  ) {}

  ngOnInit(): void {
    this.sub = this.gameService.state$.subscribe((s) => {
      this.state = s;
    });

    this.voterTurns = this.state.players.map((p) => ({
      voter: p,
      selectedVote: null,
      done: false,
    }));
    
    this.cdr.detectChanges(); // Forzar pintado inicial
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get currentTurn(): VoterTurn | null {
    return this.voterTurns[this.currentVoterIndex] ?? null;
  }

  get candidates(): Player[] {
    if (!this.currentTurn) return [];
    return this.state.players.filter((p) => p.id !== this.currentTurn!.voter.id);
  }

  selectVote(candidateId: string): void {
    if (!this.currentTurn || this.voteConfirmed) return;
    this.currentTurn.selectedVote = candidateId;
  }

  confirmVote(): void {
    if (!this.currentTurn?.selectedVote) return;

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
        this.cdr.detectChanges(); // Forzar detección al cambiar a allDone
      } else {
        this.currentVoterIndex = next;
      }
    }, 600);
  }

  getPlayerColor(index: number): string {
    return this.playerColors[index % this.playerColors.length];
  }

  getPlayerIndex(playerId: string): number {
    return this.state?.players?.findIndex((p) => p.id === playerId) ?? 0;
  }

  getCandidateName(candidateId: string): string {
    return this.state.players.find((p) => p.id === candidateId)?.name ?? '';
  }

  showResults(): void {
    console.log('>>> [VOTING] showResults() llamado');
    this.gameService.showResult();
    
    // Usar NavController con replaceUrl para limpiar el stack
    this.navCtrl.navigateRoot('/result', { 
      animated: true,
      replaceUrl: true
    }).then(() => {
      console.log('>>> [VOTING] Navegación a result completada');
    }).catch(err => {
      console.error('>>> [VOTING] Error en navegación:', err);
    });
  }
}