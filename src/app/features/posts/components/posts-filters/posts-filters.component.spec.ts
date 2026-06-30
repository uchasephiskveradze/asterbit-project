import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { PostsFiltersComponent } from './posts-filters.component';

describe('PostsFiltersComponent', () => {
  let component: PostsFiltersComponent;
  let fixture: ComponentFixture<PostsFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsFiltersComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
