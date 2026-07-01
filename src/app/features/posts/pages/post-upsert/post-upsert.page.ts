import {
  Component,
  computed,
  effect,
  HostListener,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { PostFormComponent } from '../../components/post-form/post-form.component';
import { PostFormValue } from '../../components/post-form/types/post-form.types';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PostResolverResult } from '../../models/post-resolver-result.model';
import { POST_STATUS } from '../../models/post-status.model';
import { PostUpsertStore } from '../../store/post-upsert.store';

type PendingLeaveAction = 'route' | 'cancel';

@Component({
  selector: 'app-post-upsert-page',
  imports: [
    RouterLink,
    TranslatePipe,
    PostFormComponent,
    ErrorStateComponent,
    PageHeaderComponent,
    ModalComponent,
  ],
  providers: [PostUpsertStore],
  templateUrl: './post-upsert.page.html',
  styleUrl: './post-upsert.page.scss',
})
export class PostUpsertPage {
  public readonly id = input<string>();
  public readonly from = input<'list' | 'details' | 'my-posts'>();
  public readonly tab = input<string>();
  public readonly resolvedPost = input<PostResolverResult>();

  public readonly auth = inject(AuthService);
  public readonly store = inject(PostUpsertStore);

  private readonly router = inject(Router);
  private readonly formRef = viewChild(PostFormComponent);

  public readonly unsavedChangesModalOpen = signal(false);

  private readonly allowLeave = signal(false);
  private pendingLeaveAction: PendingLeaveAction | null = null;
  private leaveResolver: ((allow: boolean) => void) | null = null;

  public readonly isEditMode = computed(() => this.id() !== undefined);
  public readonly hideAuthorField = computed(() => !this.isEditMode());
  public readonly isOwnerApprovedResubmit = computed(
    () =>
      this.isEditMode() &&
      !this.auth.isAdmin() &&
      this.store.post()?.status === POST_STATUS.approved &&
      this.store.post()?.submittedBy === this.auth.currentUser()?.id,
  );
  public readonly isOwnerRejectedResubmit = computed(
    () =>
      this.isEditMode() &&
      !this.auth.isAdmin() &&
      this.store.post()?.status === POST_STATUS.rejected &&
      this.store.post()?.submittedBy === this.auth.currentUser()?.id,
  );
  public readonly isOwnerResubmit = computed(
    () => this.isOwnerApprovedResubmit() || this.isOwnerRejectedResubmit(),
  );

  public readonly pageTitle = computed(() => {
    if (this.isOwnerRejectedResubmit()) {
      return 'posts.upsert.ownerRejectedResubmitTitle';
    }

    if (this.isEditMode()) {
      return 'posts.upsert.editTitle';
    }

    return this.auth.isAdmin() ? 'posts.upsert.createAdminTitle' : 'posts.upsert.submitTitle';
  });

  public readonly pageSubtitle = computed(() => {
    if (this.isOwnerRejectedResubmit()) {
      return 'posts.upsert.ownerRejectedResubmitSubtitle';
    }

    if (this.isOwnerApprovedResubmit()) {
      return 'posts.upsert.ownerResubmitSubtitle';
    }

    if (this.isEditMode()) {
      return 'posts.upsert.editSubtitle';
    }

    return this.auth.isAdmin()
      ? 'posts.upsert.createAdminSubtitle'
      : 'posts.upsert.submitSubtitle';
  });

  public readonly submitLabel = computed(() => {
    if (this.isOwnerResubmit()) {
      return 'posts.upsert.submitForReview';
    }

    if (this.isEditMode()) {
      return 'posts.upsert.updatePost';
    }

    return this.auth.isAdmin() ? 'common.createPost' : 'posts.upsert.submitForReview';
  });

  public readonly cancelLink = computed(() => {
    if (!this.isEditMode()) {
      return '/posts';
    }

    if (this.from() === 'my-posts') {
      return '/posts/my';
    }

    return this.from() === 'list' ? '/posts' : `/posts/${this.id()}`;
  });

  public readonly cancelQueryParams = computed(() => {
    if (this.from() === 'my-posts' && this.tab()) {
      return { tab: this.tab()! };
    }

    return null;
  });

  public readonly showForm = computed(
    () => !this.isEditMode() || this.store.post() !== null,
  );

  public constructor() {
    effect(() => {
      const resolvedPost = this.resolvedPost();
      if (resolvedPost) {
        this.store.applyResolverResult(resolvedPost);
      }
    });

    effect(() => {
      if (this.store.error()) {
        this.allowLeave.set(false);
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  public onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
    }
  }

  public canDeactivate(): boolean | Promise<boolean> {
    if (this.allowLeave() || !this.hasUnsavedChanges()) {
      return true;
    }

    this.pendingLeaveAction = 'route';

    return new Promise((resolve) => {
      this.leaveResolver = resolve;
      this.unsavedChangesModalOpen.set(true);
    });
  }

  public onCancelClick(): void {
    if (this.allowLeave() || !this.hasUnsavedChanges()) {
      this.navigateToCancel();
      return;
    }

    this.pendingLeaveAction = 'cancel';
    this.unsavedChangesModalOpen.set(true);
  }

  public onStayOnPage(): void {
    this.closeUnsavedChangesModal(false);
  }

  public onDiscardChanges(): void {
    this.allowLeave.set(true);
    const shouldNavigateToCancel = this.pendingLeaveAction === 'cancel';

    this.closeUnsavedChangesModal(true);

    if (shouldNavigateToCancel) {
      this.navigateToCancel();
    }
  }

  public onSubmitFromModal(): void {
    this.closeUnsavedChangesModal(false);
    this.formRef()?.trySubmit();
  }

  public onSubmit(value: PostFormValue): void {
    this.allowLeave.set(true);
    const id = this.id();

    if (id) {
      this.store.updatePost(id, value);
      return;
    }

    this.store.createPost(value);
  }

  public reloadPage(): void {
    const id = this.id();

    if (id) {
      this.store.reloadPost(id);
    }
  }

  private hasUnsavedChanges(): boolean {
    return this.formRef()?.hasUnsavedChanges() ?? false;
  }

  private closeUnsavedChangesModal(allowRouteLeave: boolean): void {
    this.unsavedChangesModalOpen.set(false);
    this.leaveResolver?.(allowRouteLeave);
    this.leaveResolver = null;
    this.pendingLeaveAction = null;
  }

  private navigateToCancel(): void {
    const queryParams = this.cancelQueryParams();

    void this.router.navigate([this.cancelLink()], {
      queryParams: queryParams ?? undefined,
    });
  }
}
