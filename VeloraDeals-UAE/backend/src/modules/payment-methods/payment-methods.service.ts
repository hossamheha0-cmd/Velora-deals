import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentProvider } from './providers/payment-provider.interface';
import { CodProvider } from './providers/cod.provider';

// السجل الديناميكي لكل الـProviders. Checkout لا يعرف تفاصيل أي منها - يستدعي فقط
// PaymentMethodsService.process(code, ...) وهي تختار الـProvider الصحيح وتتحقق أنه مفعّل من الأدمن.
@Injectable()
export class PaymentMethodsService {
  private readonly providers: Map<string, PaymentProvider> = new Map();

  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodsRepo: Repository<PaymentMethod>,
    codProvider: CodProvider,
    // مستقبلًا: telrProvider: TelrProvider, paytabsProvider: PayTabsProvider,
  ) {
    this.providers.set(codProvider.code, codProvider);
  }

  async getEnabledMethods(): Promise<PaymentMethod[]> {
    return this.paymentMethodsRepo.find({
      where: { enabled: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async getAllMethods(): Promise<PaymentMethod[]> {
    return this.paymentMethodsRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async setEnabled(code: string, enabled: boolean): Promise<PaymentMethod> {
    const method = await this.paymentMethodsRepo.findOne({ where: { code } });
    if (!method) throw new BadRequestException('طريقة الدفع غير موجودة');
    method.enabled = enabled;
    return this.paymentMethodsRepo.save(method);
  }

  async processPayment(code: string, orderId: string, amount: number) {
    const method = await this.paymentMethodsRepo.findOne({ where: { code } });
    if (!method || !method.enabled) {
      throw new BadRequestException('طريقة الدفع المختارة غير متاحة حاليًا');
    }
    const provider = this.providers.get(code);
    if (!provider) {
      throw new BadRequestException('طريقة الدفع هذه غير مفعّلة تقنيًا بعد');
    }
    return provider.initiate(orderId, amount);
  }
}
