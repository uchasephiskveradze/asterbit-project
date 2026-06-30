import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should apply light theme by default when storage is empty and system is light', () => {
    expect(['light', 'dark']).toContain(service.currentTheme());
    expect(document.documentElement.dataset['theme']).toBe(service.currentTheme());
  });

  it('should toggle and persist theme', () => {
    service.setTheme('dark');
    expect(service.currentTheme()).toBe('dark');
    expect(localStorage.getItem('blog-app-theme')).toBe('dark');

    service.toggle();
    expect(service.currentTheme()).toBe('light');
  });
});
