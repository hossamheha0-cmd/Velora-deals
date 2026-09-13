import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty() @IsString() nameAr: string;
  @ApiProperty() @IsString() nameEn: string;
  @ApiProperty() @IsString() slug: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descriptionAr?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descriptionEn?: string;
  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  images?: string[];
  @ApiProperty() @IsUUID() categoryId: string;
  @ApiProperty() @IsNumber() @Min(0) basePrice: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) oldPrice?: number;
  @ApiProperty() @IsString() sku: string;
  @ApiProperty() @IsNumber() @Min(0) stockQuantity: number;
}

export class UpdateProductDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() nameAr?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() nameEn?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descriptionAr?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descriptionEn?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) basePrice?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) oldPrice?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) stockQuantity?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() enabled?: boolean;
}
