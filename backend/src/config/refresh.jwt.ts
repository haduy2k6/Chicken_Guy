import { registerAs } from '@nestjs/config';
import { REFRESH_TTL_SECONDS } from '../common/auth-cookie.util.js';

export default registerAs('refreshToken', () => ({
  secret: process.env.REFRESH_TOKEN_SECRET,
  expiresIn: REFRESH_TTL_SECONDS,
}));
