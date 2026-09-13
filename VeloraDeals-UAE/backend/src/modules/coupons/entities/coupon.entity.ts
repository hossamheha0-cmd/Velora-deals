import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string; // يُخزَّن دائمًا Uppercase (يُطبَّع في CouponsService)

  @Column({ type: 'enum', enum: CouponType })
  type: CouponType;

  // نسبة مئوية (0-100) لو type=percentage، أو مبلغ ثابت بالدرهم لو type=fixed
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  // "الكوبون صالح للاستخدام مرة واحدة فقط" - إجمالي عدد مرات الاستخدام المسموحة عبر كل العملاء
  // (وليس مرة لكل عميل) - افتراضي 1 حسب المواصفة، لكن الحقل مرن لأي قيمة مستقبلية
  @Column({ type: 'int', default: 1 })
  usageLimit: number;

  @Column({ type: 'int', default: 0 })
  usedCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minOrderAmount: number | null;

  // سقف أقصى للخصم عند type=percentage (يمنع خصم ضخم على سلة كبيرة جدًا) - اختياري
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscountAmount: number | null;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
