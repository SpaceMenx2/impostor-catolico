import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { RoleRevealPage } from './role-reveal.page';

const routes: Routes = [{ path: '', component: RoleRevealPage }];

@NgModule({
  declarations: [RoleRevealPage],
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
})
export class RoleRevealPageModule {}
