// src/case-support/ai-callback.controller.ts
import {
  Body, CanActivate, Controller, ExecutionContext, HttpCode, Injectable, Post, UnauthorizedException, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { IsIn, IsNumber, IsObject, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { safeEqual } from '../common/auth-cookie.util.js';
import { AiAnalysisService } from './ai-analysis.service.js';

/** Bí mật riêng cho chiều FastAPI -> Nest (khác AI_SERVICE_KEY của chiều Nest -> FastAPI) */
@Injectable()
export class AiCallbackGuard implements CanActivate {
  private readonly secret: string | undefined;

  constructor(config: ConfigService) {
    this.secret = config.get<string>('AI_CALLBACK_SECRET');
  }

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    if (!this.secret || !safeEqual(req.headers['x-ai-key'], this.secret)) throw new UnauthorizedException();
    return true;
  }
}

export class AiResultDto {
  @IsUUID() analysis_id!: string;
  @IsIn(['completed', 'failed']) status!: 'completed' | 'failed';

  @IsOptional() @IsString() @MaxLength(100) model_name?: string;
  @IsOptional() @IsString() @MaxLength(50) model_version?: string;
  @IsOptional() @IsString() @MaxLength(100) predicted_label?: string;

  @IsOptional() @IsNumber() @Min(0) @Max(100) risk_score?: number;
  @IsOptional() @IsObject() probabilities?: Record<string, number>;

  @IsOptional() @IsString() @MaxLength(500) gradcam_key?: string;
  @IsOptional() @IsObject() raw_output?: Record<string, unknown>;
  @IsOptional() @IsString() @MaxLength(1000) error_message?: string;
}

/** Chỉ cho FastAPI gọi (nên chặn thêm bằng mạng riêng / IP allowlist ở tầng hạ tầng). Đã có khóa bí mật nên bỏ giới hạn tần suất. */
@Controller('internal/ai')
@SkipThrottle()
@UseGuards(AiCallbackGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AiCallbackController {
  constructor(private readonly ai: AiAnalysisService) {}

  @Post('result')
  @HttpCode(200)
  async result(@Body() body: AiResultDto) {
    await this.ai.handleResult(body);
    return { ok: true };
  }
}
