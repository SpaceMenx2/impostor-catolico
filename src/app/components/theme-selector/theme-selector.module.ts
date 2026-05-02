// src/app/components/theme-selector/theme-selector.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ThemeSelectorComponent } from './theme-selector.component';

@NgModule({
  declarations: [ThemeSelectorComponent],
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [ThemeSelectorComponent],
})
export class ThemeSelectorModule {}