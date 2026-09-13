import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({ description: 'Google ID Token القادم من Google Sign-In SDK على التطبيق' })
  @IsString()
  idToken: string;
}

export class AppleLoginDto {
  @ApiProperty({ description: 'Apple Identity Token القادم من Sign in with Apple على التطبيق' })
  @IsString()
  idToken: string;

  @ApiProperty({ required: false, description: 'الاسم الكامل (Apple يرسله مرة واحدة فقط عند أول تسجيل)' })
  fullName?: string;
}
