import { registerAs } from '@nestjs/config';

// signOptions mới là chỗ JwtModule đọc hạn token (trước đây `expiresIn` nằm ngoài signOptions nên access token không hết hạn)
export default registerAs('jwt', () => ({
  secret: process.env.ACCESS_TOKEN_SECRET,
  signOptions: { expiresIn: '15m' as const },
}));
