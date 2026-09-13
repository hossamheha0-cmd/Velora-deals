import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Address } from '../../addresses/entities/address.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING_COD = 'pending_cod',
  PENDING = 'pending', // لبوابات إلكترونية مستقبلًا
  PAID = 'paid',
  FAILED = 'failed',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  orderNumber: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Address, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'shippingAddressId' })
  shippingAddress: Address;

  @Column({ type: 'uuid' })
  shippingAddressId: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  // ==== بنود الحساب - كل بند منفصل ومخزّن (وليس رقمًا نهائيًا فقط) ====
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  // توضيح مصدر الخصم للعميل ("تفاصيل الخصم بوضوح") - قيمة واحدة فقط، لأن الخصومات التلقائية
  // لا تتراكم مع بعضها ولا مع الكوبون (يُطبَّق الأكبر قيمة فقط - انظر DiscountsService)
  @Column({ type: 'varchar', length: 30, nullable: true })
  discountReason: string | null; // 'first_order' | 'cart_value' | 'coupon' | null

  // كود الكوبون الفعلي المُطبَّق على الطلب (لو discountReason = 'coupon') - يُخزَّن دائمًا حتى
  // لو الكوبون اتحذف لاحقًا من لوحة التحكم، حفاظًا على تاريخ الطلب الحقيقي وقت الشراء
  @Column({ type: 'varchar', length: 50, nullable: true })
  couponCode: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  vatRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalTotal: number;

  @Column({ type: 'varchar', length: 3, default: 'AED' })
  currency: string;

  @Column({ type: 'varchar', length: 50 })
  paymentMethodCode: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING_COD })
  paymentStatus: PaymentStatus;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'varchar', nullable: true })
  trackingNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  shippingCarrierName: string | null; // يُدخله الأدمن يدويًا (Manual Shipping Management)

  @Column({ type: 'text', nullable: true })
  shippingNotes: string | null;

  @Column({ type: 'text', nullable: true })
  customerNote: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
