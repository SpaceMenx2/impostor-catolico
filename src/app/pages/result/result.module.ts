import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { ResultPage } from './result.page';

const routes: Routes = [{ path: '', component: ResultPage }];

@NgModule({
  declarations: [ResultPage],
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
})
export class ResultPageModule {}
