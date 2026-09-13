import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentMethodsService } from './payment-methods.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../admin/entities/admin-user.entity';

@ApiTags('Checkout - Payment Methods')
@Controller('payment-methods')
export class PaymentMethodsPublicController {
  constructor(private readonly service: PaymentMethodsService) {}

  // يستخدمه تطبيق العميل في Checkout ليعرض فقط الطرق المفعّلة (COD حاليًا)
  @Get()
  getEnabled() {
    return this.service.getEnabledMethods();
  }
}

@ApiTags('Admin - Payment Methods')
@ApiBearerAuth()
@Controller('admin/payment-methods')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentMethodsAdminController {
  constructor(private readonly service: PaymentMethodsService) {}

  @Get()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ORDER_MANAGER)
  getAll() {
    return this.service.getAllMethods();
  }

  @Patch(':code/enable')
  @Roles(AdminRole.SUPER_ADMIN)
  enable(@Param('code') code: string) {
    return this.service.setEnabled(code, true);
  }

  @Patch(':code/disable')
  @Roles(AdminRole.SUPER_ADMIN)
  disable(@Param('code') code: string) {
    return this.service.setEnabled(code, false);
  }
}
