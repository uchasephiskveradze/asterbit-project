import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { DeletePostDialogComponent } from './delete-post-dialog.component';

describe('DeletePostDialogComponent', () => {
  let component: DeletePostDialogComponent;
  let fixture: ComponentFixture<DeletePostDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletePostDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: { postTitle: 'Sample post' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeletePostDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
