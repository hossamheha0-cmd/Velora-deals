import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get()
  getCart(@CurrentUser('userId') userId: string) {
    return this.service.getCart(userId);
  }

  @Post('items')
  addItem(@CurrentUser('userId') userId: string, @Body() dto: AddCartItemDto) {
    return this.service.addItem(userId, dto);
  }

  @Patch('items/:itemId')
  updateItem(
    @CurrentUser('userId') userId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.service.updateItemQuantity(userId, itemId, dto.quantity);
  }

  @Delete('items/:itemId')
  removeItem(@CurrentUser('userId') userId: string, @Param('itemId') itemId: string) {
    return this.service.removeItem(userId, itemId);
  }

  @Delete()
  clear(@CurrentUser('userId') userId: string) {
    return this.service.clearCart(userId);
  }
}
