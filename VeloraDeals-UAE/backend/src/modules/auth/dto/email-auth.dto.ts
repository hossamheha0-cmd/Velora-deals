import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterWithEmailDto {
  @ApiProperty({ example: 'hossam@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب ألا تقل عن 8 أحرف' })
  password: string;

  @ApiProperty({ example: 'Hossam Farouk', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;
}

export class LoginWithEmailDto {
  @ApiProperty({ example: 'hossam@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
