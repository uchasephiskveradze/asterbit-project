import { Injectable } from '@angular/core';

import { User } from './user.model';

export interface AuthSession {
  user: User;
  token: string;
}

export const AUTH_STORAGE_KEY = 'blog_auth_session';
