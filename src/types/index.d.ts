export type UserRole = 'admin' | 'driver';

export interface User {
  id: number;
  username: string;
  role: UserRole;
}
