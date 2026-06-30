import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsPaginationComponent } from './posts-pagination.component';

describe('PostsPaginationComponent', () => {
  let component: PostsPaginationComponent;
  let fixture: ComponentFixture<PostsPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsPaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsPaginationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('currentPage', 1);
    fixture.componentRef.setInput('totalPages', 1);
    fixture.componentRef.setInput('totalItems', 0);
    fixture.componentRef.setInput('rangeStart', 0);
    fixture.componentRef.setInput('rangeEnd', 0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
