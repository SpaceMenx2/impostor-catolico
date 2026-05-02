// src/app/components/theme-selector/theme-selector.component.ts
import { Component, OnInit } from '@angular/core';
import { ThemeService, ThemeName } from '../../services/theme.service';

@Component({
  selector: 'app-theme-selector',
  templateUrl: './theme-selector.component.html',
  styleUrls: ['./theme-selector.component.scss'],
})
export class ThemeSelectorComponent implements OnInit {
  currentTheme: ThemeName = 'legacy';
  themes = this.themeService.themes;
  showSelector = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.currentTheme = this.themeService.getTheme();
  }

  /**
   * Cambia el tema actual
   */
  changeTheme(theme: ThemeName): void {
    this.themeService.setTheme(theme);
    this.currentTheme = theme;
    this.showSelector = false;
  }

  /**
   * Obtiene el ícono del tema actual
   */
  getCurrentIcon(): string {
    const theme = this.themes.find(t => t.name === this.currentTheme);
    return theme?.icon || 'color-palette';
  }

  /**
   * Obtiene la etiqueta del tema actual
   */
  getCurrentLabel(): string {
    const theme = this.themes.find(t => t.name === this.currentTheme);
    return theme?.label || 'Tema';
  }

  /**
   * Alterna la visibilidad del selector
   */
  toggleSelector(): void {
    this.showSelector = !this.showSelector;
  }

  /**
   * Verifica si un tema está activo
   */
  isActive(theme: ThemeName): boolean {
    return this.currentTheme === theme;
  }
}