// src/app/pages/home/home.page.ts
import { Component } from '@angular/core';
import { NavController } from '@ionic/angular'; // <-- Usar NavController
import { GameService } from '../../services/game.service';
import { getRandomInspireMessage } from '../../data/words';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  inspireMessage = '';

  constructor(
    private gameService: GameService, 
    private navCtrl: NavController
  ) {}

  ionViewWillEnter(): void {
    this.inspireMessage = getRandomInspireMessage();
    this.gameService.fullReset();
  }

  goToPlayers(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur();
    }

    setTimeout(() => {
      this.navCtrl.navigateForward('/players', { 
        animated: true,
        replaceUrl: true
      });
    }, 100);
  }
}