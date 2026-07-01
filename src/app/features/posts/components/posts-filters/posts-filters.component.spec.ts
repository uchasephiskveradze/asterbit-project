import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { provideTranslateTesting } from '../../../../core/i18n/testing/provide-translate-testing';

import { PostsFiltersComponent } from './posts-filters.component';

describe('PostsFiltersComponent', () => {
  let component: PostsFiltersComponent;
  let fixture: ComponentFixture<PostsFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsFiltersComponent],
      providers: [provideNoopAnimations(), provideTranslateTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
