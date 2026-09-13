import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateSettingDto {
  @ApiProperty({ example: '9' })
  @IsString()
  value: string;

  @ApiProperty({ example: 'number', enum: ['string', 'number', 'boolean', 'json'], required: false })
  @IsOptional()
  @IsIn(['string', 'number', 'boolean', 'json'])
  type?: 'string' | 'number' | 'boolean' | 'json';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
