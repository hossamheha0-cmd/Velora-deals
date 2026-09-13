import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty() @IsUUID() productId: string;
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() variantId?: string;
  @ApiProperty({ default: 1 }) @IsInt() @Min(1) quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty() @IsInt() @Min(1) quantity: number;
}
