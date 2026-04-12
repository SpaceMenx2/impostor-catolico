// src/app/app.component.ts
import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { GameService, GamePhase } from './services/game.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnDestroy {
  private sub!: Subscription;

  constructor(private gameService: GameService, private router: Router) {
    //this.handlePhaseNavigation();
  }

  private handlePhaseNavigation(): void {
    this.sub = this.gameService.state$.subscribe((state) => {
      const phaseRoutes: Record<GamePhase, string> = {
        home: '/home',
        'players': '/players',
        'role-reveal': '/role-reveal',
        discussion: '/discussion',
        voting: '/voting',
        result: '/result',
      };

      const targetRoute = phaseRoutes[state.phase];
      const currentUrl = this.router.url;

      // Navegar solo si la ruta es diferente y no estamos en medio de una navegación
      if (targetRoute && !currentUrl.includes(targetRoute)) {
        // Usar replaceUrl para evitar duplicados en el historial
        this.router.navigateByUrl(targetRoute, { replaceUrl: true });
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}