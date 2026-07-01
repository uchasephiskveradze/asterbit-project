import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateService, provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { PostStatusLabelPipe } from './post-status-label.pipe';

const translateTesting = provideTranslateService({
  fallbackLang: 'en',
  lang: 'en',
  loader: { provide: TranslateLoader, useValue: { getTranslation: () => of({}) } },
});

describe('PostStatusLabelPipe', () => {
  let pipe: PostStatusLabelPipe;
  let translate: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [translateTesting, PostStatusLabelPipe],
    });

    pipe = TestBed.inject(PostStatusLabelPipe);
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      'posts.status.approved': 'Approved',
      'posts.status.underReviewEdited': 'Under Review (Edited)',
    });
    translate.use('en');
  });

  it('should return approved label for status string', () => {
    expect(pipe.transform('approved')).toBe('Approved');
  });

  it('should return edited pending label', () => {
    expect(pipe.transform({ status: 'pending', pendingReason: 'edited' })).toBe(
      'Under Review (Edited)',
    );
  });
});
