import { registerAs } from "@nestjs/config";

export default registerAs('refreshToken', () => ({
  secret: process.env.REFESH_TOKEN_SECRET,
  expiresIn: '8d' as const,
}));