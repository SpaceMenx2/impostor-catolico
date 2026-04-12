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
    private navCtrl: NavController // <-- Inyectar NavController
  ) {}

  ionViewWillEnter(): void {
    this.inspireMessage = getRandomInspireMessage();
    this.gameService.fullReset();
  }

  goToPlayers(): void {
    // 1. QUITAR EL FOCO del elemento activo (ESTO ES CLAVE)
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur();
    }

    // 2. Pequeño delay para que Ionic procese el blur
    setTimeout(() => {
      // 3. Navegar con NavController + replaceUrl para evitar historial duplicado
      this.navCtrl.navigateForward('/players', { 
        animated: true,
        replaceUrl: true // <-- Evita que se acumulen páginas en el stack
      });
    }, 100);
  }
}