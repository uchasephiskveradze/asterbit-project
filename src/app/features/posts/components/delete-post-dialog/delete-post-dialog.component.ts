import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { take } from 'rxjs';

import { navigateSafely } from '../../../../core/router/navigate.util';

import { PostDetailsStore } from '../../store/post-details.store';
import { DeletePostDialogData } from './types/delete-post-dialog.types';

@Component({
  selector: 'app-delete-post-dialog',
  imports: [MatDialogClose, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './delete-post-dialog.component.html',
  styleUrl: './delete-post-dialog.component.scss',
})
export class DeletePostDialogComponent {
  public readonly data = inject<DeletePostDialogData>(MAT_DIALOG_DATA);
  public readonly store = inject(PostDetailsStore);

  private readonly dialogRef = inject(MatDialogRef<DeletePostDialogComponent, boolean>);
  private readonly router = inject(Router);

  public confirm(): void {
    if (this.store.deleting()) {
      return;
    }

    this.dialogRef.disableClose = true;

    this.store
      .deletePost(this.data.postId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
          navigateSafely(this.router, ['/posts']);
        },
        complete: () => {
          this.dialogRef.disableClose = false;
        },
      });
  }
}
