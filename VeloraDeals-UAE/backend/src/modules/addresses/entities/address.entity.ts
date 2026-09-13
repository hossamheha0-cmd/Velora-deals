import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

// إمارات الدولة - تُستخدم أيضًا في Shipping Zones لاحقًا
export enum Emirate {
  ABU_DHABI = 'abu_dhabi',
  DUBAI = 'dubai',
  SHARJAH = 'sharjah',
  AJMAN = 'ajman',
  UMM_AL_QUWAIN = 'umm_al_quwain',
  RAS_AL_KHAIMAH = 'ras_al_khaimah',
  FUJAIRAH = 'fujairah',
}

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 150 })
  label: string; // Home, Work...

  @Column({ type: 'varchar', length: 150 })
  recipientName: string;

  @Column({ type: 'varchar', length: 20 })
  recipientPhone: string;

  @Column({ type: 'enum', enum: Emirate })
  emirate: Emirate;

  @Column({ type: 'varchar', length: 150 })
  city: string;

  @Column({ type: 'varchar', length: 255 })
  addressLine: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  addressLine2: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode: string | null;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
