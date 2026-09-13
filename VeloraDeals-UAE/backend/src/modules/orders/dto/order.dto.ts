import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty() @IsUUID() shippingAddressId: string;
  @ApiProperty({ example: 'cod' }) @IsString() paymentMethodCode: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() customerNote?: string;
  @ApiProperty({ required: false, description: 'كود كوبون خصم اختياري - يُتحقَّق منه وقت إنشاء الطلب' })
  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: [
      'pending', 'confirmed', 'processing', 'packed',
      'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded',
    ],
  })
  @IsString()
  status: string;
}

export class UpdateShippingInfoDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() trackingNumber?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() shippingCarrierName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() shippingNotes?: string;
}
