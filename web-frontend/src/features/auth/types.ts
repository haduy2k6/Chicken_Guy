export interface UserSession {
  userId: string;
  role: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface TokenResponse {
  accessToken: string;
  role?: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface UserProfileResponse {
  userId: string;
  role: string;
  name?: string;
  email?: string;
  avatar?: string;
}
