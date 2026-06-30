import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PostsTableComponent } from './posts-table.component';

describe('PostsTableComponent', () => {
  let component: PostsTableComponent;
  let fixture: ComponentFixture<PostsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsTableComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('posts', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
