import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationRead } from './entities/notification-read.entity';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly notifRepo: Repository<Notification>,
    @InjectRepository(NotificationRead) private readonly readRepo: Repository<NotificationRead>,
  ) {}

  // ================= Admin =================
  create(dto: CreateNotificationDto) {
    const notification = this.notifRepo.create({ ...dto, targetUserId: dto.targetUserId ?? null });
    return this.notifRepo.save(notification);
  }

  findAllForAdmin() {
    return this.notifRepo.find({ order: { createdAt: 'DESC' } });
  }

  // ================= Customer =================
  // يجلب: كل الإشعارات العامة (targetUserId=null) + أي إشعارات مُرسَلة لهذا العميل تحديدًا،
  // مع حساب isRead لكل واحد بناءً على سجل NotificationRead الخاص بنفس العميل.
  async findMyNotifications(userId: string) {
    const notifications = await this.notifRepo.find({
      where: [{ targetUserId: IsNull() }, { targetUserId: userId }],
      order: { createdAt: 'DESC' },
      take: 100,
    });
    if (notifications.length === 0) return [];

    const reads = await this.readRepo.find({
      where: { userId, notificationId: In(notifications.map((n) => n.id)) },
    });
    const readIds = new Set(reads.map((r) => r.notificationId));

    return notifications.map((n) => ({ ...n, isRead: readIds.has(n.id) }));
  }

  async markAsRead(userId: string, notificationId: string) {
    const existing = await this.readRepo.findOne({ where: { userId, notificationId } });
    if (!existing) {
      await this.readRepo.save(this.readRepo.create({ userId, notificationId, readAt: new Date() }));
    }
    return { message: 'تم تعليم الإشعار كمقروء' };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const notifications = await this.findMyNotifications(userId);
    return notifications.filter((n) => !n.isRead).length;
  }
}
