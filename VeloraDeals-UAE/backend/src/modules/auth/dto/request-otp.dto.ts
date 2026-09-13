import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsPhoneNumber, ValidateIf } from 'class-validator';

// يقبل رقم هاتف أو بريد إلكتروني (واحد منهما فقط) - يحدد channel تلقائيًا حسب الحقل المُرسَل
export class RequestOtpDto {
  @ApiProperty({ example: '+971501234567', required: false })
  @ValidateIf((o) => !o.email)
  @IsPhoneNumber('AE', { message: 'رقم هاتف إماراتي غير صحيح' })
  phoneNumber?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @ValidateIf((o) => !o.phoneNumber)
  @IsEmail({}, { message: 'بريد إلكتروني غير صحيح' })
  email?: string;

  @ApiProperty({ enum: ['register', 'login', 'reset_password'], required: false, default: 'login' })
  @IsOptional()
  @IsIn(['register', 'login', 'reset_password'])
  purpose?: 'register' | 'login' | 'reset_password';
}
