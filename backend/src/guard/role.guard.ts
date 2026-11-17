import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorator/role.decorator.js';

/** Route không gắn @Roles thì cho qua: mọi controller nghiệp vụ đều phải gắn @Roles */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(Roles, [context.getHandler(), context.getClass()]);
    if (!roles?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new UnauthorizedException('Chưa đăng nhập');
    if (!user.role) throw new ForbiddenException('Không xác định được quyền người dùng');
    if (!roles.includes(user.role)) {
      throw new ForbiddenException(`Quyền ${user.role} không được phép truy cập tài nguyên này.`);
    }
    return true;
  }
}
