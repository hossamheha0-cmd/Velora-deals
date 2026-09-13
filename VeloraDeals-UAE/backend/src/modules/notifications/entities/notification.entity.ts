import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationType {
  PROMOTION = 'promotion',
  NEW_ARRIVAL = 'new_arrival',
  ORDER_UPDATE = 'order_update',
  GENERAL = 'general',
}

// إشعارات داخل التطبيق (In-App) - يجلبها العميل عند فتح شاشة الإشعارات، وليست Push حقيقي
// (Push الفعلي عبر FCM يتطلب ربط Firebase حقيقي - غير مُفعَّل بعد، موضّح في PRODUCTION_READINESS).
// targetUserId = null يعني إشعار عام لكل العملاء (Broadcast)؛ قيمة محددة تعني إشعار لعميل بعينه.
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  titleAr: string;

  @Column({ type: 'varchar', length: 200 })
  titleEn: string;

  @Column({ type: 'text' })
  bodyAr: string;

  @Column({ type: 'text' })
  bodyEn: string;

  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.GENERAL })
  type: NotificationType;

  @Column({ type: 'uuid', nullable: true })
  targetUserId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
