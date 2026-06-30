import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsErrorStateComponent } from './posts-error-state.component';

describe('PostsErrorStateComponent', () => {
  let component: PostsErrorStateComponent;
  let fixture: ComponentFixture<PostsErrorStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsErrorStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsErrorStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
