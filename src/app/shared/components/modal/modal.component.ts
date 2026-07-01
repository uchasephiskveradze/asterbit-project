import {
  Component,
  HostListener,
  input,
  OnDestroy,
  OnInit,
  output,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { lockBodyScroll, unlockBodyScroll } from '../../utils/body-scroll-lock.util';

@Component({
  selector: 'app-modal',
  imports: [TranslatePipe],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent implements OnInit, OnDestroy {
  public readonly titleKey = input<string>();
  public readonly closeOnBackdrop = input(true);

  public readonly closed = output<void>();

  public readonly titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`;

  public ngOnInit(): void {
    lockBodyScroll();
  }

  public ngOnDestroy(): void {
    unlockBodyScroll();
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    this.closed.emit();
  }

  public onBackdropClick(): void {
    if (!this.closeOnBackdrop()) {
      return;
    }

    this.closed.emit();
  }
}
