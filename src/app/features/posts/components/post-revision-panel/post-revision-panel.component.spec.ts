import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostRevisionPanelComponent } from './post-revision-panel.component';

describe('PostRevisionPanelComponent', () => {
  let component: PostRevisionPanelComponent;
  let fixture: ComponentFixture<PostRevisionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostRevisionPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostRevisionPanelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('changes', [
      {
        field: 'title',
        label: 'Title',
        previous: 'Old title',
        current: 'New title',
      },
    ]);
    fixture.componentRef.setInput('previousVersion', {
      title: 'Old title',
      author: 'Author',
      description: 'Old description',
      content: 'Old content',
      capturedAt: '2026-01-01T00:00:00.000Z',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
