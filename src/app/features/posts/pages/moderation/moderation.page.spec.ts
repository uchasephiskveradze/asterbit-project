import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { provideTranslateTesting } from '../../../../core/i18n/testing/provide-translate-testing';
import { PostsApiService } from '../../services/posts-api.service';
import { ModerationStore } from '../../store/moderation.store';
import { ModerationPage } from './moderation.page';

describe('ModerationPage', () => {
  let component: ModerationPage;
  let fixture: ComponentFixture<ModerationPage>;
  let store: ModerationStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModerationPage],
      providers: [
        provideRouter([]),
        provideTranslateTesting(),
        {
          provide: PostsApiService,
          useValue: {
            getPosts: () => of([]),
            updatePostStatus: () => of(null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModerationPage);
    component = fixture.componentInstance;
    store = component.store;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should report empty state when there are no pending posts', async () => {
    await vi.waitFor(() => expect(store.loading()).toBe(false));

    expect(component.isEmpty()).toBe(true);
  });

  it('should delegate approve and reject actions to the store', () => {
    const moderateSpy = vi.spyOn(store, 'moderatePost');

    component.approve('1');
    component.reject('2');

    expect(moderateSpy).toHaveBeenCalledWith('1', 'approved');
    expect(moderateSpy).toHaveBeenCalledWith('2', 'rejected');
  });
});
