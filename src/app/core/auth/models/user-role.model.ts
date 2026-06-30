export type UserRole = 'admin' | 'user';

export function isUserRole(value: unknown): value is UserRole {
  return value === 'admin' || value === 'user';
}
