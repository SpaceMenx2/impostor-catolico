// src/app/app.component.ts
import { Component, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { GameService } from "./services/game.service";
import { Subscription } from "rxjs";
import { AlertController, Platform } from "@ionic/angular";
import { UpdateCheckerService } from "./services/update-checker.service";
import { environment } from "../environments/environment";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
})
export class AppComponent implements OnDestroy {
  private sub!: Subscription;

  constructor(
    private gameService: GameService,
    private router: Router,
    private platform: Platform,
    private updateChecker: UpdateCheckerService,
    private alertCtrl: AlertController,
  ) {
    this.platform.ready().then(() => {
      this.checkForUpdates();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private async checkForUpdates(): Promise<void> {
    const available = await this.updateChecker.isUpdateAvailable().toPromise();


    if (available) {
      const latest = await this.updateChecker.getLatestVersion().toPromise();
      const current = this.updateChecker.getCurrentVersion();

      await this.showUpdateAlert(current, latest || "");
    }
  }

  private async showUpdateAlert(
    current: string,
    latest: string,
  ): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: "📦 Actualización disponible",
      message: `Tenés la versión ${current}. Ya está disponible la ${latest}.Recomendamos actualizar para obtener las últimas mejoras.`,
      buttons: [
        { text: "Ahora no", role: "cancel" },
        {
          text: "Actualizar",
          handler: () => {
            window.open(
              `https://github.com/${environment.githubOwner}/${environment.githubRepo}/releases/latest`,
              "_system",
            );
          },
        },
      ],
    });
    await alert.present();
  }
}
