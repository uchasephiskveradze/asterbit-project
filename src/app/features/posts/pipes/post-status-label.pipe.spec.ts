import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

import { provideTranslateTesting } from '../../../core/i18n/testing/provide-translate-testing';
import { PostStatusLabelPipe } from './post-status-label.pipe';

describe('PostStatusLabelPipe', () => {
  let pipe: PostStatusLabelPipe;
  let translate: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideTranslateTesting(), PostStatusLabelPipe],
    });

    pipe = TestBed.inject(PostStatusLabelPipe);
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      'posts.status.approved': 'Approved',
      'posts.status.underReview': 'Under Review',
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

  it('should return default pending label for new submissions', () => {
    expect(pipe.transform({ status: 'pending', pendingReason: 'new' })).toBe('Under Review');
  });
});
