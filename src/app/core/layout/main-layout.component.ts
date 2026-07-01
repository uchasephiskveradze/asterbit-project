import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter } from 'rxjs';

import { Post } from '../../features/posts/models/post.model';
import { RejectionNoticeService } from '../../features/posts/services/rejection-notice.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { AuthService } from '../auth/services/auth.service';
import { LocaleService } from '../i18n/locale.service';
import { ThemeService } from '../theme/theme.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe, ModalComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  public readonly auth = inject(AuthService);
  public readonly locale = inject(LocaleService);
  public readonly theme = inject(ThemeService);
  public readonly rejectionNotice = inject(RejectionNoticeService);

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  public readonly rejectionNoticePosts = signal<Post[] | null>(null);
  public readonly logoutModalOpen = signal(false);

  private rejectionNoticePrompted = false;

  public constructor() {
    effect(() => {
      this.auth.isAuthenticated();
      this.auth.isAdmin();
      this.rejectionNotice.refreshBadge();
    });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.tryShowRejectionNotice());
  }

  public dismissRejectionNotice(): void {
    const posts = this.rejectionNoticePosts();

    if (posts) {
      this.rejectionNotice.markModalAcknowledged(posts);
    }

    this.rejectionNoticePosts.set(null);
  }

  public openLogoutModal(): void {
    this.logoutModalOpen.set(true);
  }

  public closeLogoutModal(): void {
    this.logoutModalOpen.set(false);
  }

  public confirmLogout(): void {
    this.logoutModalOpen.set(false);
    this.auth.logout();
  }

  public viewRejectionReasons(): void {
    const posts = this.rejectionNoticePosts();

    if (posts) {
      this.rejectionNotice.markModalAcknowledged(posts);
    }

    this.rejectionNoticePosts.set(null);
    void this.router.navigate(['/posts/my'], { queryParams: { tab: 'rejected' } });
  }

  public rejectionNoticeTitleKey(posts: Post[]): string {
    return posts.length === 1
      ? 'posts.myPosts.rejectionNotice.modalTitleSingle'
      : 'posts.myPosts.rejectionNotice.modalTitle';
  }

  public rejectionNoticeMessageKey(posts: Post[]): string {
    return posts.length === 1
      ? 'posts.myPosts.rejectionNotice.modalMessageSingle'
      : 'posts.myPosts.rejectionNotice.modalMessage';
  }

  public rejectionNoticeMessageParams(posts: Post[]): { count: number; title: string } {
    return {
      count: posts.length,
      title: posts[0]?.title ?? '',
    };
  }

  private tryShowRejectionNotice(): void {
    if (this.rejectionNoticePrompted || this.rejectionNoticePosts()) {
      return;
    }

    if (!this.auth.isAuthenticated() || this.auth.isAdmin()) {
      return;
    }

    this.rejectionNoticePrompted = true;

    this.rejectionNotice
      .getUnseenForModal()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((posts) => {
        if (posts.length > 0) {
          this.rejectionNoticePosts.set(posts);
        }
      });
  }
}
