import type { UserRole } from '../Entity-User/User.entity.js';

export interface TokenResponseDto {
  accessToken?: string;
  refreshToken?: string;
  role?: UserRole;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface AuthUserDto {
  userId: string;
  role: UserRole;
  name?: string;
  email?: string;
  avatar?: string;
}
