import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum OtpPurpose {
  REGISTER = 'register',
  LOGIN = 'login',
  RESET_PASSWORD = 'reset_password',
}

export enum OtpChannel {
  SMS = 'sms',
  EMAIL = 'email',
}

// أكواد OTP الحقيقية بالمشروع - مخزنة كـ Hash وليست نصًا صريحًا، مع انتهاء صلاحية ومحاولات محدودة.
// معمّمة لدعم قناتين: SMS (لرقم هاتف) و Email (لبريد إلكتروني) - نفس المنطق والجدول لكل منهما،
// يُفرَّق بينهما بحقل channel فقط، حتى لا تتكرر منطق التوليد/التحقق في مكانين مختلفين.
@Entity('otp_codes')
@Index(['target', 'channel', 'purpose'])
export class OtpCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // رقم الهاتف أو البريد الإلكتروني حسب channel - حقل عام واحد بدل حقلين منفصلين
  @Column({ type: 'varchar', length: 255 })
  target: string;

  @Column({ type: 'enum', enum: OtpChannel })
  channel: OtpChannel;

  @Column({ type: 'varchar' })
  codeHash: string;

  @Column({ type: 'enum', enum: OtpPurpose })
  purpose: OtpPurpose;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'boolean', default: false })
  consumed: boolean;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
