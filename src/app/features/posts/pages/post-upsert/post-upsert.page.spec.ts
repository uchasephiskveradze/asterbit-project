import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { API_BASE_URL } from '../../../../core/config';
import { PostUpsertPage } from './post-upsert.page';

describe('PostUpsertPage', () => {
  let component: PostUpsertPage;
  let fixture: ComponentFixture<PostUpsertPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostUpsertPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostUpsertPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return to posts list when canceling create flow', () => {
    expect(component.cancelLink()).toBe('/posts');
  });

  it('should return to posts list when edit was opened from list', () => {
    fixture.componentRef.setInput('id', 'abc123');
    fixture.componentRef.setInput('from', 'list');
    fixture.detectChanges();

    expect(component.cancelLink()).toBe('/posts');
  });

  it('should return to post details when edit was opened from details', () => {
    fixture.componentRef.setInput('id', 'abc123');
    fixture.componentRef.setInput('from', 'details');
    fixture.detectChanges();

    expect(component.cancelLink()).toBe('/posts/abc123');
  });
});
