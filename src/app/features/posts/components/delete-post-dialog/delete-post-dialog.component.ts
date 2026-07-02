import { Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PostDetailsStore } from '../../store/post-details.store';

@Component({
  selector: 'app-delete-post-dialog',
  imports: [ModalComponent, MatButtonModule, MatProgressSpinnerModule, TranslatePipe],
  templateUrl: './delete-post-dialog.component.html',
  styleUrl: './delete-post-dialog.component.scss',
})
export class DeletePostDialogComponent {
  public readonly postId = input.required<string>();
  public readonly postTitle = input.required<string>();
  public readonly redirectLink = input<string[]>(['/posts']);
  public readonly redirectQueryParams = input<Record<string, string> | undefined>();
  public readonly closed = output<void>();

  public readonly store = inject(PostDetailsStore);

  private readonly router = inject(Router);

  public onModalCloseAttempt(): void {
    if (this.store.deleting()) {
      return;
    }

    this.closed.emit();
  }

  public confirm(): void {
    if (this.store.deleting()) {
      return;
    }

    this.store
      .deletePost(this.postId())
      .pipe(
        tap(() => {
        this.closed.emit();
        void this.router.navigate(this.redirectLink(), {
          queryParams: this.redirectQueryParams(),
        });
        }),
      )
      .subscribe();
  }
}
