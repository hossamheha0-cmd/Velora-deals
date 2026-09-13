import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber, IsString, Length, ValidateIf } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '+971501234567', required: false })
  @ValidateIf((o) => !o.email)
  @IsPhoneNumber('AE')
  phoneNumber?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @ValidateIf((o) => !o.phoneNumber)
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(4, 8)
  code: string;
}
