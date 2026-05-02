// src/app/services/theme.service.ts
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

export type ThemeName = 'legacy' | 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  icon: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'app-theme';

  public readonly themes: ThemeConfig[] = [
    { name: 'legacy', label: 'Legacy (Por defecto)', icon: 'star' },
    { name: 'light', label: 'Claro', icon: 'sunny' },
    { name: 'dark', label: 'Oscuro', icon: 'moon' },
    { name: 'auto', label: 'Automático', icon: 'desktop' },
  ];

  private currentTheme: ThemeName = 'legacy';

  constructor(private platform: Platform) {
    this.loadTheme();
  }

  /**
   * Carga el tema guardado o usa el por defecto
   */
  private loadTheme(): void {
    const saved = localStorage.getItem(this.THEME_STORAGE_KEY) as ThemeName | null;
    this.currentTheme = saved || 'legacy';
    this.applyTheme(this.currentTheme);
  }

  /**
   * Obtiene el tema actual
   */
  getTheme(): ThemeName {
    return this.currentTheme;
  }

  /**
   * Cambia el tema y lo guarda en localStorage
   */
  setTheme(theme: ThemeName): void {
    this.currentTheme = theme;
    localStorage.setItem(this.THEME_STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  /**
   * Aplica el tema al documento
   */
  private applyTheme(theme: ThemeName): void {
    const body = document.body;

    // Remover todas las clases de tema
    body.classList.remove('theme-legacy', 'theme-light', 'theme-dark');

    if (theme === 'auto') {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const autoTheme = prefersDark ? 'dark' : 'light';
      body.classList.add(`theme-${autoTheme}`);

      // Escuchar cambios en la preferencia del sistema
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const newAutoTheme = e.matches ? 'dark' : 'light';
        body.classList.remove('theme-light', 'theme-dark');
        body.classList.add(`theme-${newAutoTheme}`);
      });
    } else {
      body.classList.add(`theme-${theme}`);
    }
  }

  /**
   * Verifica si un tema está activo
   */
  isActive(theme: ThemeName): boolean {
    return this.currentTheme === theme;
  }

  /**
   * Obtiene la configuración de un tema específico
   */
  getThemeConfig(theme: ThemeName): ThemeConfig | undefined {
    return this.themes.find(t => t.name === theme);
  }
}