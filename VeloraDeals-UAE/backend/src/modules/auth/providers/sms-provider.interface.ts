// واجهة موحدة لأي مزود SMS (Unifonic, Twilio, ...) بحيث تبديل المزود لا يمس منطق OTP نفسه
export interface SmsProvider {
  sendOtp(phoneNumber: string, code: string): Promise<void>;
}
