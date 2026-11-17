export interface CreateUserDTO {
  provider: string;
  providerId: string;
  name?: string;
  email?: string;
  avatar?: string;
}
