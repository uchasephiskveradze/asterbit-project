import { Injectable } from '@angular/core';

import { AppTheme, THEME_STORAGE_KEY } from './models/app-theme.model';

@Injectable({
  providedIn: 'root',
})
export class ThemeStorageService {
  public read(): AppTheme | null {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  }

  public write(theme: AppTheme): void {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}
