import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { PostsApiService } from '../../services/posts-api.service';
import { MyPostsStore } from '../../store/my-posts.store';
import { MyPostsPage } from './my-posts.page';

describe('MyPostsPage', () => {
  let component: MyPostsPage;
  let fixture: ComponentFixture<MyPostsPage>;
  let store: MyPostsStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPostsPage],
      providers: [
        provideRouter([]),
        {
          provide: PostsApiService,
          useValue: { getPosts: () => of([]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyPostsPage);
    component = fixture.componentInstance;
    store = component.store;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should enable owner edit only on the approved tab', () => {
    store.setTab('under-review');
    fixture.detectChanges();
    expect(component.showOwnerEdit()).toBe(false);

    store.setTab('approved');
    fixture.detectChanges();
    expect(component.showOwnerEdit()).toBe(true);
  });

  it('should report empty state when the active tab has no posts', async () => {
    await vi.waitFor(() => expect(store.loading()).toBe(false));

    expect(component.isEmpty()).toBe(true);
  });
});
