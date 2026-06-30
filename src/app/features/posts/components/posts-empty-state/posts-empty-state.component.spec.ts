import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PostsEmptyStateComponent } from './posts-empty-state.component';

describe('PostsEmptyStateComponent', () => {
  let component: PostsEmptyStateComponent;
  let fixture: ComponentFixture<PostsEmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsEmptyStateComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsEmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
