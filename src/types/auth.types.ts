export type UserRole = 'Customer' | 'Waiter' | 'Kitchen' | 'Manager' | 'Admin' | 'Administrator';

export interface User {
  id: string;
  username?: string;
  phone?: string;
  email?: string;
  name?: string;
  role: UserRole;
  is_active?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
  message?: string;
}
