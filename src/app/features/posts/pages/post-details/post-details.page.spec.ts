import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { API_BASE_URL } from '../../../../core/config/api.config';
import { PostResolverResult } from '../../models/post-resolver-result.model';
import { PostDetailsPage } from './post-details.page';

describe('PostDetailsPage', () => {
  let component: PostDetailsPage;
  let fixture: ComponentFixture<PostDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostDetailsPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostDetailsPage);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', '1');
    fixture.componentRef.setInput('resolvedPost', {
      post: {
        id: '1',
        title: 'Test Post',
        author: 'Author',
        description: 'A'.repeat(20),
        content: 'B'.repeat(100),
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      notFound: false,
      error: null,
    } satisfies PostResolverResult);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
