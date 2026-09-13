// واجهة موحّدة لأي مزود إرسال بريد إلكتروني (SendGrid, AWS SES, Postmark, ...) بحيث تبديل
// المزود لا يمس منطق OTP نفسه في AuthService - نفس نمط SmsProvider تمامًا.
export interface EmailProvider {
  sendOtp(email: string, code: string): Promise<void>;
}
