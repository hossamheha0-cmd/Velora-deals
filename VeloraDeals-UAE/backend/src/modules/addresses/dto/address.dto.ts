import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Emirate } from '../entities/address.entity';

export class CreateAddressDto {
  @ApiProperty() @IsString() label: string;
  @ApiProperty() @IsString() recipientName: string;
  @ApiProperty() @IsString() recipientPhone: string;
  @ApiProperty({ enum: Emirate }) @IsEnum(Emirate) emirate: Emirate;
  @ApiProperty() @IsString() city: string;
  @ApiProperty() @IsString() addressLine: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() addressLine2?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() postalCode?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isDefault?: boolean;
}

export class UpdateAddressDto extends CreateAddressDto {}
