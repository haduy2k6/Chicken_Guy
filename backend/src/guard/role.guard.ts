import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorator/role.decorator.js';

/** Fail-closed: route dùng RoleGuard mà quên gắn @Roles thì bị từ chối, không bao giờ cho qua mặc định */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(Roles, [context.getHandler(), context.getClass()]);
    if (!roles?.length) throw new ForbiddenException('Tài nguyên chưa được khai báo quyền truy cập');

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new UnauthorizedException('Chưa đăng nhập');
    if (!user.role) throw new ForbiddenException('Không xác định được quyền người dùng');
    if (!roles.includes(user.role)) {
      throw new ForbiddenException(`Quyền ${user.role} không được phép truy cập tài nguyên này.`);
    }
    return true;
  }
}
