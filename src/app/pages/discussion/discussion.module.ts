import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { DiscussionPage } from './discussion.page';

const routes: Routes = [{ path: '', component: DiscussionPage }];

@NgModule({
  declarations: [DiscussionPage],
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
})
export class DiscussionPageModule {}
