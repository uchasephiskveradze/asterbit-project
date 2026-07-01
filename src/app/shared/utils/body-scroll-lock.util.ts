let lockCount = 0;
let savedOverflow = '';
let savedPaddingRight = '';

function getScrollRoot(): HTMLElement {
  return document.documentElement;
}

export function lockBodyScroll(): void {
  if (lockCount === 0) {
    const root = getScrollRoot();
    const scrollbarWidth = window.innerWidth - root.clientWidth;

    savedOverflow = root.style.overflow;
    savedPaddingRight = root.style.paddingRight;
    root.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      root.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  lockCount += 1;
}

export function unlockBodyScroll(): void {
  if (lockCount === 0) {
    return;
  }

  lockCount -= 1;

  if (lockCount === 0) {
    const root = getScrollRoot();
    root.style.overflow = savedOverflow;
    root.style.paddingRight = savedPaddingRight;
  }
}
