import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { VotingPage } from './voting.page';

const routes: Routes = [{ path: '', component: VotingPage }];

@NgModule({
  declarations: [VotingPage],
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
})
export class VotingPageModule {}
