import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// بيانات مرجعية يديرها الأدمن فقط - ليست بوابة دفع أو تكامل بنكي فعلي. الغرض: تحديد الحساب
// البنكي الذي يستلم التحويلات/التسويات الحالية، مع إمكانية "التبديل" لحساب آخر بضغطة واحدة
// بدل تعديل بيانات الحساب الحالي يدويًا (يحتفظ بسجل كل الحسابات المُدخلة سابقًا).
@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  bankName: string;

  @Column({ type: 'varchar', length: 150 })
  accountHolderName: string;

  // آخر 4 أرقام فقط يُفترض إدخالها هنا كمرجع داخلي - لا يُخزَّن رقم حساب/IBAN كامل حساس
  // (لا يُعتبر Secret Management حقيقي؛ هذا الحقل نصي عادي في قاعدة البيانات وليس مُشفَّرًا)
  @Column({ type: 'varchar', length: 50 })
  accountNumberLast4: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ibanLast4: string | null;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
