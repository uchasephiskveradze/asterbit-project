import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../../config/api.config';
import { AuthUser, User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  public findUserByCredentials(email: string, password: string): Observable<AuthUser | null> {
    return this.http
      .get<User[]>(`${this.apiBaseUrl}/users`, {
        params: { email, password },
      })
      .pipe(
        map((users) => {
          const user = users[0];
          if (!user) {
            return null;
          }

          return this.toAuthUser(user);
        }),
      );
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: String(user.id),
      email: user.email,
      role: user.role,
      name: user.name,
    };
  }
}
