import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../../../core/config';
import { PostsListPage } from './posts-list.page';

describe('PostsListPage', () => {
  let component: PostsListPage;
  let fixture: ComponentFixture<PostsListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsListPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideNoopAnimations(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
