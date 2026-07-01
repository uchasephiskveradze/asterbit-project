import { Injectable } from '@angular/core';

import { AppLanguage, APP_LANGUAGES, LOCALE_STORAGE_KEY } from './models/app-language.model';

@Injectable({
  providedIn: 'root',
})
export class LocaleStorageService {
  public read(): AppLanguage | null {
    const value = localStorage.getItem(LOCALE_STORAGE_KEY);
    return APP_LANGUAGES.includes(value as AppLanguage) ? (value as AppLanguage) : null;
  }

  public write(language: AppLanguage): void {
    localStorage.setItem(LOCALE_STORAGE_KEY, language);
  }
}
