import { UserRole } from './user-role.model';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export type AuthUser = User;
