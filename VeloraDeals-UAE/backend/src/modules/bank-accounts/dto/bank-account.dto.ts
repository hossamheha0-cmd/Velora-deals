import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateBankAccountDto {
  @ApiProperty({ example: 'Emirates NBD' }) @IsString() bankName: string;
  @ApiProperty({ example: 'Velora Deals UAE LLC' }) @IsString() accountHolderName: string;
  @ApiProperty({ example: '4821', description: 'آخر 4 أرقام فقط من رقم الحساب' })
  @IsString()
  accountNumberLast4: string;
  @ApiProperty({ example: '7392', required: false, description: 'آخر 4 أرقام فقط من IBAN' })
  @IsOptional()
  @IsString()
  ibanLast4?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}
