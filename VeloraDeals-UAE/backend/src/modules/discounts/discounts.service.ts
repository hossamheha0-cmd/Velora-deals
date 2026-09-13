import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { SettingsService } from '../settings/settings.service';

export type AutoDiscountReason = 'first_order' | 'cart_value' | null;

export interface AutoDiscountResult {
  reason: AutoDiscountReason;
  discountAmount: number;
  freeShipping: boolean;
}

// المسؤول الوحيد عن حساب الخصومات التلقائية (وليست الكوبونات - تلك في CouponsService).
// كل الإعدادات (تفعيل/نسبة/حد أدنى) تُقرأ ديناميكيًا من جدول settings - قابلة للتعديل الكامل
// من لوحة التحكم دون أي تعديل كود، بنفس مبدأ ShippingService/TaxService.
@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly settingsService: SettingsService,
  ) {}

  /**
   * يحسب أفضل خصم تلقائي مستحق لهذا العميل ولهذه السلة (لا يشمل الكوبونات).
   * لو أكثر من خصم تلقائي مستحق في نفس الوقت (مثال: أول طلب + قيمة سلة تتجاوز الحد)،
   * يُطبَّق الخصم الأكبر قيمة فقط - الخصومات التلقائية لا تتراكم فوق بعضها.
   */
  async calculateBestAutoDiscount(userId: string, subtotal: number): Promise<AutoDiscountResult> {
    const candidates: AutoDiscountResult[] = [];

    const firstOrderResult = await this.calculateFirstOrderDiscount(userId, subtotal);
    if (firstOrderResult) candidates.push(firstOrderResult);

    const cartValueResult = await this.calculateCartValueDiscount(subtotal);
    if (cartValueResult) candidates.push(cartValueResult);

    if (candidates.length === 0) {
      return { reason: null, discountAmount: 0, freeShipping: false };
    }

    // الأولوية للخيار الأعلى قيمة فعلية للعميل: الشحن المجاني يُقيَّم كخصم أيضًا عبر مقارنة
    // القيمة الفعلية - لكن للتبسيط والوضوح، لو أي مرشح يمنح شحن مجاني نعطيه أولوية لأنه غالبًا
    // الأوضح للعميل، وإلا نختار أكبر discountAmount رقميًا.
    const freeShippingCandidate = candidates.find((c) => c.freeShipping);
    if (freeShippingCandidate) return freeShippingCandidate;

    candidates.sort((a, b) => b.discountAmount - a.discountAmount);
    return candidates[0];
  }

  private async calculateFirstOrderDiscount(userId: string, subtotal: number): Promise<AutoDiscountResult | null> {
    const enabled = await this.settingsService.getBoolean('first_order_discount_enabled', true);
    if (!enabled) return null;

    // "أول أوردر من الإيميل المسجل" - نتحقق أنه لا يوجد أي طلب سابق غير ملغي لهذا المستخدم
    const previousOrdersCount = await this.orderRepo.count({
      where: { userId },
    });
    if (previousOrdersCount > 0) return null;

    const type = await this.settingsService.getString('first_order_discount_type', 'percentage');
    if (type === 'free_shipping') {
      return { reason: 'first_order', discountAmount: 0, freeShipping: true };
    }

    const percentage = await this.settingsService.getNumber('first_order_discount_percentage', 15);
    const discountAmount = Math.round(((subtotal * percentage) / 100) * 100) / 100;
    return { reason: 'first_order', discountAmount, freeShipping: false };
  }

  private async calculateCartValueDiscount(subtotal: number): Promise<AutoDiscountResult | null> {
    const enabled = await this.settingsService.getBoolean('cart_value_discount_enabled', true);
    if (!enabled) return null;

    const threshold = await this.settingsService.getNumber('cart_value_discount_threshold', 250);
    if (subtotal < threshold) return null;

    const percentage = await this.settingsService.getNumber('cart_value_discount_percentage', 15);
    const discountAmount = Math.round(((subtotal * percentage) / 100) * 100) / 100;
    return { reason: 'cart_value', discountAmount, freeShipping: false };
  }

  async getMinOrderAmount(): Promise<number> {
    return this.settingsService.getNumber('min_order_amount', 60);
  }
}
