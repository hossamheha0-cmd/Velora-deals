import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Address } from '../../addresses/entities/address.entity';

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

// حساب واحد قابل بالربط بأكثر من طريقة: Phone+OTP, Email+Password, Google, Apple
// (كل الطرق اختيارية على مستوى الحقول، لكن واحدة منها على الأقل مطلوبة منطقيًا عبر Auth Service)
@Entity('users')
@Index(['phoneNumber'], { unique: true, where: '"phoneNumber" IS NOT NULL' })
@Index(['email'], { unique: true, where: '"email" IS NOT NULL' })
@Index(['googleId'], { unique: true, where: '"googleId" IS NOT NULL' })
@Index(['appleId'], { unique: true, where: '"appleId" IS NOT NULL' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  // معرّف Google الفريد (Google "sub" claim) - يُملأ فقط لو الحساب اتسجل/اترتبط بـ Google
  @Column({ type: 'varchar', length: 255, nullable: true })
  googleId: string | null;

  // معرّف Apple الفريد (Apple "sub" claim) - يُملأ فقط لو الحساب اتسجل/اترتبط بـ Apple
  @Column({ type: 'varchar', length: 255, nullable: true })
  appleId: string | null;

  // null لو الحساب اتسجل بـ Phone+OTP أو Social Login فقط ولسه ما حددش باسورد
  @Column({ type: 'varchar', nullable: true, select: false })
  passwordHash: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  fullName: string | null;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'varchar', length: 5, default: 'ar' })
  preferredLanguage: string; // 'ar' | 'en'

  // وقت موافقة العميل على الشروط والأحكام - null يعني لسه ما وافقش، والتطبيق يجب أن يمنع
  // الوصول لأي شاشة غير شاشة الموافقة نفسها طالما القيمة null (Enforcement فعلي في Flutter)
  @Column({ type: 'timestamptz', nullable: true })
  termsAcceptedAt: Date | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  refreshTokenHash: string | null;

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
