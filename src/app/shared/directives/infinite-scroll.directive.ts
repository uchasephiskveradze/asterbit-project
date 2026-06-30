import { DestroyRef, Directive, ElementRef, inject, input, OnInit, output } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
})
export class InfiniteScrollDirective implements OnInit {
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  public readonly appInfiniteScrollDisabled = input(false);
  public readonly appInfiniteScrollReached = output<void>();

  public ngOnInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !this.appInfiniteScrollDisabled()) {
          this.appInfiniteScrollReached.emit();
        }
      },
      { rootMargin: '120px' },
    );

    observer.observe(this.element.nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
