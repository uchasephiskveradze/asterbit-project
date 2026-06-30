import { computed, inject, Injectable, signal } from '@angular/core';

import { AppTheme } from './models/app-theme.model';
import { ThemeStorageService } from './theme-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storage = inject(ThemeStorageService);

  private readonly theme = signal<AppTheme>(this.resolveInitialTheme());

  public readonly currentTheme = this.theme.asReadonly();
  public readonly isDark = computed(() => this.theme() === 'dark');

  public constructor() {
    this.applyTheme(this.theme());
  }

  public toggle(): void {
    this.setTheme(this.theme() === 'light' ? 'dark' : 'light');
  }

  public setTheme(theme: AppTheme): void {
    this.theme.set(theme);
    this.storage.write(theme);
    this.applyTheme(theme);
  }

  private resolveInitialTheme(): AppTheme {
    const stored = this.storage.read();
    if (stored) {
      return stored;
    }

    if (typeof globalThis.matchMedia !== 'function') {
      return 'light';
    }

    return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: AppTheme): void {
    document.documentElement.dataset['theme'] = theme;
    document.documentElement.style.colorScheme = theme;
  }
}
