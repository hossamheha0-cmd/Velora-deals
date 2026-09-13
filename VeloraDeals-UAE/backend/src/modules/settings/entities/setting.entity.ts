import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

// جدول Key-Value مركزي لكل الإعدادات القابلة للتعديل من Admin Dashboard
// (رسوم الشحن، VAT، حالة طلب COD الافتراضية، ...) بدلًا من قيم Hardcoded في الكود.
@Entity('settings')
export class Setting {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  key: string;

  // نخزن القيمة كنص دائمًا ونحولها في السيرفس حسب النوع، لمرونة أكبر في التخزين
  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'varchar', length: 20, default: 'string' })
  type: 'string' | 'number' | 'boolean' | 'json';

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
