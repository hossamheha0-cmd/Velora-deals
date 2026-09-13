import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import { AdminRole } from '../../admin/entities/admin-user.entity';

// يعمل بعد JwtAuthGuard مباشرة - يتحقق أن الحساب المصادَق عليه هو Admin وأن دوره ضمن الأدوار المسموحة
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.type !== 'admin') {
      throw new ForbiddenException('هذا الإجراء متاح فقط لحسابات الإدارة');
    }
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('صلاحياتك الحالية لا تسمح بتنفيذ هذا الإجراء');
    }
    return true;
  }
}
