// src/app/pages/home/home.page.ts
import { Component, ViewEncapsulation } from "@angular/core";
import { NavController } from "@ionic/angular"; // <-- Usar NavController
import { GameService } from "../../services/game.service";
import { getRandomInspireMessage } from "../../data/words";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class HomePage {
  inspireMessage = "";
  showAbout = false;

  constructor(
    private gameService: GameService,
    private navCtrl: NavController,
  ) {}

  ionViewWillEnter(): void {
    this.inspireMessage = getRandomInspireMessage();
    this.gameService.fullReset();
  }

  ionViewWillLeave(): void {
    this.showAbout = false;
  }

  toggleAbout(): void {
    this.showAbout = !this.showAbout;
  }

  goToPlayers(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      activeElement.blur();
    }

    setTimeout(() => {
      this.navCtrl.navigateForward("/players", {
        animated: true,
        replaceUrl: true,
      });
    }, 100);
  }
}
