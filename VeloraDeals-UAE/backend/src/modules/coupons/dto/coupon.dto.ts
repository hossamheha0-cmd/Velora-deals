import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CouponType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @ApiProperty({ example: 'WELCOME15' }) @IsString() code: string;
  @ApiProperty({ enum: CouponType }) @IsEnum(CouponType) type: CouponType;
  @ApiProperty({ example: 15 }) @IsNumber() @Min(0) value: number;
  @ApiProperty({ required: false, default: 1 }) @IsOptional() @IsInt() @Min(1) usageLimit?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) minOrderAmount?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) maxDiscountAmount?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() expiresAt?: string;
}

export class UpdateCouponDto {
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) value?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) usageLimit?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) minOrderAmount?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) maxDiscountAmount?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() enabled?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() expiresAt?: string;
}

export class ValidateCouponDto {
  @ApiProperty({ example: 'WELCOME15' }) @IsString() code: string;
}
