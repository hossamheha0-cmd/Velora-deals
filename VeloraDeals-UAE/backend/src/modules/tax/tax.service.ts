import { Injectable } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';

// منفصل تمامًا عن OrderCalculator - نسبة مئوية (Percentage-based) وليست مبلغًا ثابتًا.
// الإعداد الافتراضي: VAT = 5%، قابل للتعديل أو التعطيل من Admin دون لمس Checkout.
@Injectable()
export class TaxService {
  constructor(private readonly settingsService: SettingsService) {}

  async calculateVat(subtotalAfterDiscount: number): Promise<{ rate: number; amount: number }> {
    const vatEnabled = await this.settingsService.getBoolean('vat_enabled', true);
    if (!vatEnabled) {
      return { rate: 0, amount: 0 };
    }
    const rate = await this.settingsService.getNumber('vat_rate', 5);
    const amount = Math.round(((subtotalAfterDiscount * rate) / 100) * 100) / 100;
    return { rate, amount };
  }
}
