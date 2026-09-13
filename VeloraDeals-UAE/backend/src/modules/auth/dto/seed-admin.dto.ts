import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SeedAdminDto {
  @ApiProperty({ example: 'admin@myapp.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@123456' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Super Admin' })
  @IsString()
  fullName: string;
}
