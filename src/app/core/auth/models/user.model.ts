import { UserRole, isUserRole } from './user-role.model';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export type AuthUser = User;

export function isUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const user = value as Record<string, unknown>;

  return (
    typeof user['id'] === 'string' &&
    typeof user['email'] === 'string' &&
    typeof user['name'] === 'string' &&
    isUserRole(user['role'])
  );
}
