import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

class TranslateTestingLoader implements TranslateLoader {
  public getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

export function provideTranslateTesting() {
  return provideTranslateService({
    fallbackLang: 'en',
    lang: 'en',
    loader: {
      provide: TranslateLoader,
      useClass: TranslateTestingLoader,
    },
  });
}
