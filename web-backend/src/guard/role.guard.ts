import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Roles } from "../decorator/role.decorator.js";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Chưa đăng nhập');
    if (!user.role) throw new ForbiddenException('Không tìm thấy Role trong token');
    if (!roles.includes(user.role)) {
      throw new ForbiddenException(`Quyền ${user.role} không được phép truy cập tài nguyên này.`);
    }

    return true;
  }
}