import { AuthUser } from './user.model';

export interface AuthSession {
  user: AuthUser;
  token: string;
}

export const AUTH_STORAGE_KEY = 'blog_auth_session';
