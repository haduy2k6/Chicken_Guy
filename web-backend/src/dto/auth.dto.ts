
import { UserRole } from "../Entity-User/User.entity.js";

export class TokenResponseDto {
  accessToken?: string;
  refreshToken?: string;
  role?: UserRole;
}

export class JwtPayloadDto {
  sub: string;
  role?: UserRole;
}

export class AuthUserDto {
  userId: string;
  role: UserRole;
}

export class RefreshRequestDto {
  userId: string;
  refreshToken: string;
}