import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { AuthService } from '../auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const createRouterMock = () => ({
    createUrlTree: vi.fn((commands: unknown[], extras?: { queryParams?: Record<string, string> }) => {
      return { commands, extras } as unknown as UrlTree;
    }),
  });

  it('should allow authenticated users', () => {
    const router = createRouterMock();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: () => true } },
        { provide: Router, useValue: router },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/posts' } as never),
    );

    expect(result).toBe(true);
  });

  it('should redirect guests to login with returnUrl', () => {
    const router = createRouterMock();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: () => false } },
        { provide: Router, useValue: router },
      ],
    });

    TestBed.runInInjectionContext(() => authGuard({} as never, { url: '/posts/new' } as never));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/posts/new' },
    });
  });
});
