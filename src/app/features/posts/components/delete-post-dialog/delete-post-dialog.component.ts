import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';

import { DeletePostDialogData } from './types/delete-post-dialog.types';

@Component({
  selector: 'app-delete-post-dialog',
  imports: [MatDialogClose],
  templateUrl: './delete-post-dialog.component.html',
  styleUrl: './delete-post-dialog.component.scss',
})
export class DeletePostDialogComponent {
  public readonly data = inject<DeletePostDialogData>(MAT_DIALOG_DATA);

  private readonly dialogRef = inject(MatDialogRef<DeletePostDialogComponent, boolean>);

  public confirm(): void {
    this.dialogRef.close(true);
  }
}
