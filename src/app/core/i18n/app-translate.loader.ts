import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

import en from '../../../../public/i18n/en.json';

export class AppTranslateLoader implements TranslateLoader {
  constructor(private readonly http: HttpClient) {}

  public getTranslation(lang: string): Observable<TranslationObject> {
    if (lang === 'en') {
      return of(en as TranslationObject);
    }

    return this.http.get<TranslationObject>(`/i18n/${lang}.json`);
  }
}

export function provideAppTranslateLoader() {
  return {
    provide: TranslateLoader,
    useFactory: (http: HttpClient) => new AppTranslateLoader(http),
    deps: [HttpClient],
  };
}
