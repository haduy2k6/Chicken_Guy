
import { UserRole } from "../Entity-User/User.entity.js";

export class TokenResponseDto {
  accessToken?: string;
  refreshToken?: string;
  role?: UserRole;
  name?: string;
  email?: string;
  avatar?: string;
}

export class JwtPayloadDto {
  sub: string;
  role?: UserRole;
  name?: string;
  email?: string;
}

export class AuthUserDto {
  userId: string;
  role: UserRole;
  name?: string;
  email?: string;
  avatar?: string;
}

export class RefreshRequestDto {
  userId: string;
  refreshToken: string;
}