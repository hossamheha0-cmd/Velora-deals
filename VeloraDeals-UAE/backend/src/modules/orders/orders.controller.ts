import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateShippingInfoDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../admin/entities/admin-user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateOrderDto) {
    return this.service.createOrder(userId, dto);
  }

  @Get()
  findMine(@CurrentUser('userId') userId: string) {
    return this.service.findMyOrders(userId);
  }

  @Get(':id')
  findOne(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.service.findOneForUser(userId, id);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.service.cancelOrder(userId, id);
  }
}

@ApiTags('Admin - Orders')
@ApiBearerAuth()
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ORDER_MANAGER)
export class OrdersAdminController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.service.findAllForAdmin(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOneForAdmin(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  // ---- Order Tracking Workflow: بوابتا الموافقة الصريحتان ----
  @Patch(':id/approve')
  approveOrder(@Param('id') id: string) {
    return this.service.approveOrder(id);
  }

  @Patch(':id/approve-ready')
  approveReadyForDispatch(@Param('id') id: string) {
    return this.service.approveReadyForDispatch(id);
  }

  @Patch(':id/shipping')
  updateShipping(@Param('id') id: string, @Body() dto: UpdateShippingInfoDto) {
    return this.service.updateShippingInfo(id, dto);
  }
}
