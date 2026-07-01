import { lockBodyScroll, unlockBodyScroll } from './body-scroll-lock.util';

describe('bodyScrollLock', () => {
  const root = document.documentElement;

  afterEach(() => {
    root.style.overflow = '';
    root.style.paddingRight = '';
  });

  it('should lock and restore root overflow', () => {
    root.style.overflow = 'auto';

    lockBodyScroll();
    expect(root.style.overflow).toBe('hidden');

    unlockBodyScroll();
    expect(root.style.overflow).toBe('auto');
  });

  it('should keep scroll locked until the last unlock', () => {
    lockBodyScroll();
    lockBodyScroll();

    unlockBodyScroll();
    expect(root.style.overflow).toBe('hidden');

    unlockBodyScroll();
    expect(root.style.overflow).toBe('');
  });
});
