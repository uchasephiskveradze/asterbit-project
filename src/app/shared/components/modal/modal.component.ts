import {
  afterNextRender,
  Component,
  HostListener,
  inject,
  Injector,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { lockBodyScroll, unlockBodyScroll } from '../../utils/body-scroll-lock.util';

const MODAL_LEAVE_MS = 180;

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

  public readonly isOpen = signal(false);
  public readonly isClosing = signal(false);

  public readonly titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`;

  private readonly injector = inject(Injector);
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  public constructor() {
    afterNextRender(
      () => {
        this.isOpen.set(true);
      },
      { injector: this.injector },
    );
  }

  public ngOnInit(): void {
    lockBodyScroll();
  }

  public ngOnDestroy(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
    }

    unlockBodyScroll();
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    this.requestClose();
  }

  public onBackdropClick(): void {
    if (!this.closeOnBackdrop()) {
      return;
    }

    this.requestClose();
  }

  public requestClose(): void {
    if (this.isClosing()) {
      return;
    }

    this.isClosing.set(true);
    this.closeTimer = setTimeout(() => {
      this.closed.emit();
    }, MODAL_LEAVE_MS);
  }
}
