// src/app/app.component.ts
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from './services/game.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnDestroy {
  private sub!: Subscription;

  constructor(private gameService: GameService, private router: Router) {}

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}