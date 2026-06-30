import { User } from './user.model';
import { isUser } from './user.model';

export interface AuthSession {
  user: User;
  token: string;
}

export const AUTH_STORAGE_KEY = 'blog_auth_session';

export function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Record<string, unknown>;

  return typeof session['token'] === 'string' && isUser(session['user']);
}
