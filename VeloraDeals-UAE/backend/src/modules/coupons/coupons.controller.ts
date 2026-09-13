import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../admin/entities/admin-user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CartService } from '../cart/cart.service';

@ApiTags('Coupons')
@ApiBearerAuth()
@Controller('coupons')
@UseGuards(JwtAuthGuard)
export class CouponsPublicController {
  constructor(
    private readonly couponsService: CouponsService,
    private readonly cartService: CartService,
  ) {}

  // يتحقق من الكوبون مقابل سلة العميل الحقيقية المخزَّنة في DB - وليس أي رقم يرسله التطبيق،
  // بنفس مبدأ الأمان المتبع في كل حسابات الطلب الأخرى (Server-side authoritative)
  @Post('validate')
  async validate(@CurrentUser('userId') userId: string, @Body() dto: ValidateCouponDto) {
    const cart = await this.cartService.getCart(userId);
    const result = await this.couponsService.validateForSubtotal(dto.code, cart.subtotal);
    return {
      code: result.coupon.code,
      subtotal: cart.subtotal,
      discountAmount: result.discountAmount,
      totalAfterDiscount: Math.round((cart.subtotal - result.discountAmount) * 100) / 100,
    };
  }
}

@ApiTags('Admin - Coupons')
@ApiBearerAuth()
@Controller('admin/coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.MARKETING_MANAGER)
export class CouponsAdminController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
