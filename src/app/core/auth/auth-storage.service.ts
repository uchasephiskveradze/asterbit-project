import { Injectable } from '@angular/core';

import { AUTH_STORAGE_KEY, AuthSession } from './models/auth-session.model';

@Injectable({
  providedIn: 'root',
})
export class AuthStorageService {
  public read(): AuthSession | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }

  public write(session: AuthSession): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }

  public clear(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}
