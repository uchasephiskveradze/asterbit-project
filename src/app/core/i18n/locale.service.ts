import { registerLocaleData } from '@angular/common';
import localeKa from '@angular/common/locales/ka';
import { computed, inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AppLanguage, APP_LANGUAGES, DEFAULT_LANGUAGE } from './models/app-language.model';
import { LocaleStorageService } from './locale-storage.service';

registerLocaleData(localeKa);

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly translate = inject(TranslateService);
  private readonly storage = inject(LocaleStorageService);
  private readonly language = signal<AppLanguage>(this.resolveInitialLanguage());

  public readonly currentLanguage = this.language.asReadonly();
  public readonly dateLocale = computed(() => (this.language() === 'ka' ? 'ka' : 'en-US'));
  public readonly languages = APP_LANGUAGES;

  public initialize(): Promise<unknown> {
    const language = this.language();
    this.translate.addLangs([...APP_LANGUAGES]);
    this.translate.setFallbackLang(DEFAULT_LANGUAGE);
    this.applyDocumentLanguage(language);
    return firstValueFrom(this.translate.use(language));
  }

  public setLanguage(language: AppLanguage): void {
    this.language.set(language);
    this.storage.write(language);
    this.applyDocumentLanguage(language);
    void firstValueFrom(this.translate.use(language));
  }

  public toggle(): void {
    this.setLanguage(this.language() === 'en' ? 'ka' : 'en');
  }

  public languageLabel(language: AppLanguage): string {
    return language === 'ka' ? 'ქარ' : 'EN';
  }

  private resolveInitialLanguage(): AppLanguage {
    return this.storage.read() ?? DEFAULT_LANGUAGE;
  }

  private applyDocumentLanguage(language: AppLanguage): void {
    document.documentElement.lang = language;
  }
}
