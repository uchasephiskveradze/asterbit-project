import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideTranslateTesting } from '../../../../core/i18n/testing/provide-translate-testing';

import { Post } from '../../models/post.model';
import { PostsTableComponent } from './posts-table.component';

describe('PostsTableComponent', () => {
  let component: PostsTableComponent;
  let fixture: ComponentFixture<PostsTableComponent>;

  const approvedPost: Post = {
    id: '1',
    title: 'Approved post',
    author: 'Jane Doe',
    description: 'Description',
    content: 'Content',
    createdAt: '2026-01-01T00:00:00.000Z',
    status: 'approved',
    submittedBy: '2',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsTableComponent],
      providers: [provideRouter([]), provideTranslateTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('posts', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should allow owner edit only for approved posts owned by the current user', () => {
    fixture.componentRef.setInput('enableOwnerEdit', true);
    fixture.componentRef.setInput('ownerId', '2');
    fixture.detectChanges();

    expect(component.canOwnerEdit(approvedPost)).toBe(true);
    expect(
      component.canOwnerEdit({
        ...approvedPost,
        status: 'pending',
      }),
    ).toBe(false);
    expect(
      component.canOwnerEdit({
        ...approvedPost,
        submittedBy: '9',
      }),
    ).toBe(false);
  });
});
