import { Injectable } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';

// المسؤول الوحيد عن حساب رسوم الشحن لأي طلب. Checkout/Orders لا يحسبان الرقم بأنفسهم.
@Injectable()
export class ShippingService {
  constructor(private readonly settingsService: SettingsService) {}

  async calculateShippingFee(subtotalAfterDiscount: number): Promise<number> {
    const baseFee = await this.settingsService.getNumber('shipping_fee', 9);
    const freeShippingEnabled = await this.settingsService.getBoolean(
      'free_shipping_enabled',
      false,
    );

    if (freeShippingEnabled) {
      const threshold = await this.settingsService.getNumber(
        'free_shipping_threshold',
        0,
      );
      if (subtotalAfterDiscount >= threshold) {
        return 0;
      }
    }

    // TODO Phase مستقبلية: قراءة shipping_rules حسب المنطقة/الإمارة قبل الرجوع لـbaseFee
    return baseFee;
  }
}
