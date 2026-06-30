import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';
import { PostFormValue } from '../components/post-form/types/post-form.types';
import { Post } from '../models/post.model';
import { PostsApiService } from '../services/posts-api.service';
import { PostUpsertStore } from './post-upsert.store';

describe('PostUpsertStore', () => {
  const post: Post = {
    id: '1',
    title: 'Existing Post',
    author: 'Author',
    description: 'Short description text',
    content: 'a'.repeat(100),
    createdAt: '2026-01-01T00:00:00.000Z',
    status: 'approved',
    submittedBy: '1',
  };

  const formValue: PostFormValue = {
    title: 'Updated Post',
    author: 'Author',
    description: 'Updated description text',
    content: 'b'.repeat(100),
  };

  let store: PostUpsertStore;
  let api: { updatePost: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = {
      updatePost: vi.fn(() => of({ ...post, title: formValue.title })),
    };

    TestBed.configureTestingModule({
      providers: [
        PostUpsertStore,
        { provide: PostsApiService, useValue: api },
        {
          provide: AuthService,
          useValue: {
            currentUser: () => ({
              id: '1',
              email: 'admin@blog.com',
              role: 'admin',
              name: 'Admin User',
            }),
            isAdmin: () => true,
          },
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn() },
        },
      ],
    });

    store = TestBed.inject(PostUpsertStore);
    store.applyResolverResult({ post, notFound: false, error: null });
  });

  it('should surface save errors in edit mode', async () => {
    api.updatePost.mockReturnValue(throwError(() => new Error('network')));

    store.updatePost('1', formValue);

    await vi.waitFor(() => expect(store.saving()).toBe(false));

    expect(store.error()).toBe('Unable to save post. Please try again.');
    expect(store.post()?.title).toBe('Existing Post');
  });
});
