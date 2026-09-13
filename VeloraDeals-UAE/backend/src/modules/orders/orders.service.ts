import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { TaxService } from '../tax/tax.service';
import { ShippingService } from '../shipping/shipping.service';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { SettingsService } from '../settings/settings.service';
import { DiscountsService } from '../discounts/discounts.service';
import { CouponsService } from '../coupons/coupons.service';
import { Address } from '../addresses/entities/address.entity';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateShippingInfoDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Address) private readonly addressRepo: Repository<Address>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
    private readonly taxService: TaxService,
    private readonly shippingService: ShippingService,
    private readonly paymentMethodsService: PaymentMethodsService,
    private readonly settingsService: SettingsService,
    private readonly discountsService: DiscountsService,
    private readonly couponsService: CouponsService,
    private readonly dataSource: DataSource,
  ) {}

  // ================= Checkout: المصدر الوحيد للحقيقة للسعر والمخزون وحالة الدفع =================
  async createOrder(userId: string, dto: CreateOrderDto) {
    const address = await this.addressRepo.findOne({
      where: { id: dto.shippingAddressId, userId },
    });
    if (!address) throw new NotFoundException('عنوان الشحن غير موجود');

    // 1) اقرأ السلة الحقيقية من DB (وليس من أي بيانات يرسلها العميل)
    const cart = await this.cartService.getRawCartWithItems(userId);

    return this.dataSource.transaction(async (manager) => {
      let subtotal = 0;
      const orderItemsData: Partial<OrderItem>[] = [];

      // 2) تحقق من المخزون وأنقص الكمية فعليًا لكل عنصر (Server-side فقط)
      for (const item of cart.items) {
        const unitPrice = item.variant ? Number(item.variant.price) : Number(item.product.basePrice);
        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;

        await this.productsService.reserveStockOrThrow(item.productId, item.quantity, manager);

        orderItemsData.push({
          productId: item.productId,
          variantId: item.variantId,
          productNameSnapshot: item.product.nameAr,
          skuSnapshot: item.variant ? item.variant.sku : item.product.sku,
          unitPriceSnapshot: unitPrice,
          quantity: item.quantity,
          lineTotal,
        });
      }

      // 2.5) الحد الأدنى لقيمة الطلب - قابل للتعديل من لوحة التحكم (min_order_amount)
      const minOrderAmount = await this.discountsService.getMinOrderAmount();
      if (subtotal < minOrderAmount) {
        throw new BadRequestException(
          `الحد الأدنى لقيمة الطلب هو ${minOrderAmount} AED - قيمة سلتك الحالية ${round2(subtotal)} AED`,
        );
      }

      // 3) الخصومات: الكوبون (لو العميل دخّله يدويًا) له الأولوية المطلقة ويتجاهل أي خصم
      // تلقائي مستحق - العميل اللي بيتعب ويدخل كود كوبون قصده واضح، فمنطبّقش حاجة تانية فوقه.
      // لو مفيش كوبون، نطبّق أفضل خصم تلقائي مستحق (أول طلب / قيمة سلة - الاتنين مش بيتجمعوا
      // مع بعض برضه، أكبرهم بس زي ما اتفقنا سابقًا).
      let discountAmount = 0;
      let discountReason: string | null = null;
      let couponCode: string | null = null;
      let freeShipping = false;
      let couponValidation: Awaited<ReturnType<CouponsService['validateForSubtotal']>> | null = null;

      if (dto.couponCode) {
        // لو الكوبون غير صالح (منتهي/مستهلك/غير موجود) نرفض الطلب بالكامل بدل تجاهله بصمت،
        // حتى يعرف العميل بوضوح أن الكود اللي دخّله ما اتطبقش
        couponValidation = await this.couponsService.validateForSubtotal(dto.couponCode, subtotal);
        discountAmount = couponValidation.discountAmount;
        discountReason = 'coupon';
        couponCode = couponValidation.coupon.code;
      } else {
        const autoDiscount = await this.discountsService.calculateBestAutoDiscount(userId, subtotal);
        if (autoDiscount.reason) {
          if (autoDiscount.freeShipping) {
            freeShipping = true;
            discountReason = autoDiscount.reason;
          } else {
            discountAmount = autoDiscount.discountAmount;
            discountReason = autoDiscount.reason;
          }
        }
      }

      const subtotalAfterDiscount = round2(subtotal - discountAmount);

      // 4) الضريبة والشحن يُحسبان دائمًا من الـBackend عبر Calculators منفصلة
      const { rate: vatRate, amount: vatAmount } = await this.taxService.calculateVat(
        subtotalAfterDiscount,

      );
      const shippingFee = freeShipping
        ? 0
        : await this.shippingService.calculateShippingFee(subtotalAfterDiscount);
      const finalTotal = subtotalAfterDiscount + vatAmount + shippingFee;

      // 4.5) حد أقصى لقيمة طلبات COD - "تحكم كامل للآدمن في تحديد حد أقصى للمبلغ تصبح الطلبات
      // اللي بتتجاوزه فيزا فقط وتلغى خيار الكاش تلقائيًا". max_cod_amount=0 يعني بدون حد (معطّل).
      if (dto.paymentMethodCode === 'cod') {
        const maxCodAmount = await this.settingsService.getNumber('max_cod_amount', 0);
        if (maxCodAmount > 0 && finalTotal > maxCodAmount) {
          throw new BadRequestException(
            `الدفع عند الاستلام غير متاح للطلبات التي تتجاوز ${maxCodAmount} AED (إجمالي طلبك ${round2(finalTotal)} AED) - برجاء اختيار طريقة دفع إلكتروني`,
          );
        }
      }

      // 5) الدفع - عبر PaymentMethodsService العام، وليس مرتبطًا بـCOD مباشرة
      const paymentResult = await this.paymentMethodsService.processPayment(
        dto.paymentMethodCode,
        'pending-order', // سيُستبدل بمعرف الطلب الحقيقي بعد الحفظ لو احتاج أي Provider مستقبلي ذلك
        finalTotal,
      );

      // 6) حالة الطلب الابتدائية لـCOD تُقرأ من Settings (قابلة للتعديل من Admin دون كود جديد)
      let initialStatus: OrderStatus = OrderStatus.PENDING;
      if (dto.paymentMethodCode === 'cod') {
        const defaultCodStatus = await this.settingsService.getString(
          'default_cod_order_status',
          'pending',
        );
        initialStatus =
          defaultCodStatus === 'confirmed' ? OrderStatus.CONFIRMED : OrderStatus.PENDING;
      }

      const orderNumber = this.generateOrderNumber();

      const order = manager.create(Order, {
        orderNumber,
        userId,
        shippingAddressId: address.id,
        subtotal: round2(subtotal),
        discountAmount: round2(discountAmount),
        discountReason,
        couponCode,
        vatRate,
        vatAmount: round2(vatAmount),
        shippingFee: round2(shippingFee),
        finalTotal: round2(finalTotal),
        currency: 'AED',
        paymentMethodCode: dto.paymentMethodCode,
        paymentStatus: paymentResult.initialPaymentStatus as PaymentStatus,
        status: initialStatus,
        customerNote: dto.customerNote ?? null,
      });
      const savedOrder = await manager.save(order);

      const items = orderItemsData.map((data) =>
        manager.create(OrderItem, { ...data, orderId: savedOrder.id }),
      );
      await manager.save(items);

      // 7) "ينتهي فعليًا بمجرد الضغط على دفع" - الكوبون يُستهلَك هنا، داخل نفس الـTransaction،
      // فقط لو هو فعلًا اللي اتطبّق على الطلب (مش لو الخصم التلقائي كان أكبر منه واتجاهل)
      if (couponCode && couponValidation) {
        await this.couponsService.consumeWithinTransaction(manager, couponValidation.coupon.id);
      }

      // 8) فرّغ السلة بعد نجاح إنشاء الطلب
      await this.cartService.clearCart(userId);

      const trackingVisible = await this.isLiveTrackingVisible();
      return { ...savedOrder, items, trackingVisible };
    });
  }

  async findMyOrders(userId: string) {
    const orders = await this.orderRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: { items: true },
    });
    const trackingVisible = await this.isLiveTrackingVisible();
    return orders.map((o) => ({ ...o, trackingVisible }));
  }

  async findOneForUser(userId: string, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
      relations: { items: true, shippingAddress: true },
    });
    if (!order) throw new NotFoundException('الطلب غير موجود');
    const trackingVisible = await this.isLiveTrackingVisible();
    return { ...order, trackingVisible };
  }

  // "زر في الداشبورد لتشغيل أو إيقاف خاصية تتبع حالة الطلب برمتها للعملاء" - إعداد عام واحد
  // يُقرأ ديناميكيًا (نفس نمط كل الإعدادات الأخرى) - العميل يستلم دائمًا الحالة الحقيقية،
  // لكن trackingVisible تُخبر تطبيق الموبايل هل يعرض شريط تتبع الحالة التفصيلي أم لا.
  private async isLiveTrackingVisible(): Promise<boolean> {
    return this.settingsService.getBoolean('live_order_tracking_enabled', true);
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.findOneForUser(userId, orderId);
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
      throw new ForbiddenException('لا يمكن إلغاء الطلب في حالته الحالية');
    }
    order.status = OrderStatus.CANCELLED;
    return this.orderRepo.save(order);
  }

  // ================= Admin =================
  async findAllForAdmin(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    return this.orderRepo.find({ where, order: { createdAt: 'DESC' }, relations: { items: true } });
  }

  async findOneForAdmin(orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { items: true, shippingAddress: true, user: true },
    });
    if (!order) throw new NotFoundException('الطلب غير موجود');
    return order;
  }

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOneForAdmin(orderId);
    order.status = dto.status as OrderStatus;
    // عند التأكيد الفعلي لدفع COD، نعتبره لا يزال pending_cod حتى التسليم الفعلي - لا تغيير تلقائي هنا
    return this.orderRepo.save(order);
  }

  // ================= Order Tracking Workflow - بوابات موافقة الأدمن الصريحة =================
  // إضافة فوق آلية updateStatus العامة أعلاه (تبقى متاحة للحالات اللوجستية اللاحقة مثل
  // packed/delivered/cancelled) - هاتان الدالتان تُنفّذان بالضبط المسار المطلوب:
  // Pending -> [Admin Approve] -> Preparing -> [Admin Approve Ready] -> Dispatched
  // كل بوابة تتحقق من الحالة الحالية قبل السماح بالانتقال - تمنع تخطي خطوة أو رجوع للخلف.

  // "Preparing" في مصطلحات Backend = OrderStatus.PROCESSING (قيد التجهيز)
  async approveOrder(orderId: string) {
    const order = await this.findOneForAdmin(orderId);
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
      throw new ForbiddenException(
        `لا يمكن الموافقة على الطلب من حالته الحالية (${order.status}) - يجب أن يكون الطلب قيد المراجعة أولًا`,
      );
    }
    order.status = OrderStatus.PROCESSING;
    return this.orderRepo.save(order);
  }

  // "Ready / Dispatched" في مصطلحات Backend = OrderStatus.SHIPPED (خرج الطلب مع المندوب)
  async approveReadyForDispatch(orderId: string) {
    const order = await this.findOneForAdmin(orderId);
    if (![OrderStatus.PROCESSING, OrderStatus.PACKED].includes(order.status)) {
      throw new ForbiddenException(
        `لا يمكن تجهيز الطلب للشحن من حالته الحالية (${order.status}) - يجب أن يكون قيد التجهيز أولًا`,
      );
    }
    order.status = OrderStatus.SHIPPED;
    return this.orderRepo.save(order);
  }

  async updateShippingInfo(orderId: string, dto: UpdateShippingInfoDto) {
    const order = await this.findOneForAdmin(orderId);
    if (dto.trackingNumber !== undefined) order.trackingNumber = dto.trackingNumber;
    if (dto.shippingCarrierName !== undefined) order.shippingCarrierName = dto.shippingCarrierName;
    if (dto.shippingNotes !== undefined) order.shippingNotes = dto.shippingNotes;
    return this.orderRepo.save(order);
  }

  private generateOrderNumber(): string {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `VDU-${ts}-${rand}`;
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
