import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsLoadingStateComponent } from './posts-loading-state.component';

describe('PostsLoadingStateComponent', () => {
  let component: PostsLoadingStateComponent;
  let fixture: ComponentFixture<PostsLoadingStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsLoadingStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsLoadingStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
