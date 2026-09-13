import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ example: 'عرض خاص لفترة محدودة' }) @IsString() titleAr: string;
  @ApiProperty({ example: 'Limited Time Offer' }) @IsString() titleEn: string;
  @ApiProperty({ example: 'خصم 20% على كل الإلكترونيات' }) @IsString() bodyAr: string;
  @ApiProperty({ example: '20% off all electronics' }) @IsString() bodyEn: string;
  @ApiProperty({ enum: NotificationType, default: NotificationType.GENERAL })
  @IsEnum(NotificationType)
  type: NotificationType;
  @ApiProperty({ required: false, description: 'اتركه فارغًا لإرسال إشعار عام لكل العملاء' })
  @IsOptional()
  @IsUUID()
  targetUserId?: string;
}
