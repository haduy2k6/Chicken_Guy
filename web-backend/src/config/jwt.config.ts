import { registerAs } from "@nestjs/config";

export default registerAs('jwt', () => ({
  secret: process.env.ACCESS_TOKEN_SECRET,
  expiresIn: '3h',
}));