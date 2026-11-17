import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GoogleGuard extends AuthGuard('google') {
  override getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const locale = (req.query?.locale as string) || 'vi';
    return {
      state: JSON.stringify({ locale }),
      prompt: 'select_account', // Always prompt account selection so users can switch accounts
      accessType: 'offline',
    };
  }
}