import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsFiltersComponent } from './posts-filters.component';

describe('PostsFiltersComponent', () => {
  let component: PostsFiltersComponent;
  let fixture: ComponentFixture<PostsFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsFiltersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
