import { Injectable } from '@nestjs/common';
import { PaymentInitiationResult, PaymentProvider } from './payment-provider.interface';

// طريقة الدفع الوحيدة المفعّلة في المرحلة الأولى.
// لا يفتح أي بوابة خارجية - الطلب يُنشأ مباشرة بحالة دفع "pending_cod".
@Injectable()
export class CodProvider implements PaymentProvider {
  code = 'cod';

  async initiate(_orderId: string, _amount: number): Promise<PaymentInitiationResult> {
    return {
      requiresRedirect: false,
      initialPaymentStatus: 'pending_cod',
    };
  }
}

// عند إضافة بوابة إلكترونية مستقبلًا (مثال):
// @Injectable()
// export class TelrProvider implements PaymentProvider {
//   code = 'telr';
//   async initiate(orderId: string, amount: number) { ... يفتح جلسة دفع فعلية عبر Telr API ... }
//   async verify(orderId: string, reference: string) { ... }
//   async handleWebhook(payload: unknown) { ... Backend وحده يعتمد نتيجة الدفع من هنا ... }
// }
