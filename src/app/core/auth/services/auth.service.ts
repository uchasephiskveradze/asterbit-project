import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';

import { navigateSafely } from '../../router/navigate.util';

import { AuthApiService } from '../data-access/auth-api.service';
import { AuthSession } from '../models/auth-session.model';
import { User } from '../models/user.model';
import { AuthStorageService } from './auth-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(AuthApiService);
  private readonly storage = inject(AuthStorageService);
  private readonly router = inject(Router);

  private readonly session = signal<AuthSession | null>(this.storage.read());

  public readonly currentUser = computed(() => this.session()?.user ?? null);
  public readonly isAuthenticated = computed(() => this.currentUser() !== null);
  public readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  public login(email: string, password: string): Observable<boolean> {
    return this.api.findUserByCredentials(email, password).pipe(
      map((user) => {
        if (!user) {
          return false;
        }

        const session: AuthSession = {
          user,
          token: `mock-token-${user.id}`,
        };
        this.setSession(session);
        return true;
      }),
      catchError(() => of(false)),
    );
  }

  public logout(): void {
    this.session.set(null);
    this.storage.clear();
    navigateSafely(this.router, ['/login']);
  }

  public getToken(): string | null {
    return this.session()?.token ?? null;
  }

  public setSession(session: AuthSession): void {
    this.session.set(session);
    this.storage.write(session);
  }
}
