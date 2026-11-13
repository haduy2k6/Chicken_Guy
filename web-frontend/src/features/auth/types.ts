export interface UserSession {
  userId: string;
  role: string;
  name?: string;
  email?: string;
}

export interface TokenResponse {
  accessToken: string;
  role?: string;
}

export interface UserProfileResponse {
  userId: string;
  role: string;
  name?: string;
  email?: string;
}
