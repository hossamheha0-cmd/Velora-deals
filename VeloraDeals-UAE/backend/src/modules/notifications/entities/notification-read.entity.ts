import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

// يتتبّع هل عميل معيّن قرأ إشعارًا معينًا أم لا - منفصل عن Notification نفسه لأن نفس الإشعار
// العام (Broadcast) يُقرأ في أوقات مختلفة بواسطة عملاء مختلفين، فلا يصح تخزين isRead على
// الإشعار نفسه (سيكون خطأ مشترك بين كل العملاء).
@Entity('notification_reads')
@Index(['notificationId', 'userId'], { unique: true })
export class NotificationRead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  notificationId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'timestamptz' })
  readAt: Date;
}
