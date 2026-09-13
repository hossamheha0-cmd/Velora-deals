import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationRead } from './entities/notification-read.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController, NotificationsAdminController } from './notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, NotificationRead])],
  controllers: [NotificationsController, NotificationsAdminController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
