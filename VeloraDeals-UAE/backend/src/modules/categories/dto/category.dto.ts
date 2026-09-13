import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty() @IsString() nameAr: string;
  @ApiProperty() @IsString() nameEn: string;
  @ApiProperty() @IsString() slug: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() imageUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() sortOrder?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() parentId?: string;
}

export class UpdateCategoryDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() nameAr?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() nameEn?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() slug?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() imageUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() sortOrder?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() enabled?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() parentId?: string;
}
