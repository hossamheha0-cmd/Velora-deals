// الواجهة الموحدة لأي طريقة دفع (COD الآن، Telr/PayTabs مستقبلًا)
// Checkout و Orders يتعاملان فقط مع هذه الواجهة، وليس مع أي بوابة دفع بعينها.
export interface PaymentInitiationResult {
  // للـmanual (COD): لا يوجد Redirect - الطلب يُنشأ مباشرة
  // للـgateway مستقبلًا: يرجع رابط/جلسة دفع يفتحها التطبيق
  requiresRedirect: boolean;
  redirectUrl?: string;
  initialPaymentStatus: string;
}

export interface PaymentProvider {
  code: string;
  initiate(orderId: string, amount: number): Promise<PaymentInitiationResult>;
  // للبوابات الإلكترونية فقط - COD لا يستخدمها الآن
  verify?(orderId: string, providerReference: string): Promise<boolean>;
  handleWebhook?(payload: unknown): Promise<{ orderId: string; success: boolean }>;
}
