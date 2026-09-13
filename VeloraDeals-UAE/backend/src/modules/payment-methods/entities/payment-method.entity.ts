import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentMethodType {
  MANUAL = 'manual', // مثل COD
  GATEWAY = 'gateway', // مثل Telr, PayTabs مستقبلًا
}

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string; // 'cod' | 'telr' | 'paytabs' | ...

  @Column({ type: 'varchar', length: 150 })
  nameAr: string;

  @Column({ type: 'varchar', length: 150 })
  nameEn: string;

  @Column({ type: 'enum', enum: PaymentMethodType })
  type: PaymentMethodType;

  @Column({ type: 'boolean', default: false })
  enabled: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  // إعدادات مرنة لكل طريقة: حدود مبلغ COD، مناطق متاحة، أو لاحقًا مرجع لمكان تخزين API Keys في Secrets Manager
  // (لا تُخزَّن مفاتيح حساسة كنص صريح هنا أبدًا)
  @Column({ type: 'jsonb', default: {} })
  configuration: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
