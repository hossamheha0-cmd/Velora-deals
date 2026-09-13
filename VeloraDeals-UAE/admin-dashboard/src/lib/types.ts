export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  enabled: boolean;
  parentId: string | null;
}

export interface ProductVariant {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
  price: number;
  stockQuantity: number;
  enabled: boolean;
}

export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  images: string[];
  categoryId: string;
  basePrice: number;
  oldPrice: number | null;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  enabled: boolean;
  variants?: ProductVariant[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  subtotal: number;
  discountAmount: number;
  discountReason: string | null;
  couponCode: string | null;
  vatRate: number;
  vatAmount: number;
  shippingFee: number;
  finalTotal: number;
  currency: string;
  paymentMethodCode: string;
  paymentStatus: string;
  status: string;
  trackingNumber: string | null;
  shippingCarrierName: string | null;
  shippingNotes: string | null;
  customerNote: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface PaymentMethod {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  type: 'manual' | 'gateway';
  enabled: boolean;
  sortOrder: number;
  isDefault: boolean;
  configuration: Record<string, unknown>;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountHolderName: string;
  accountNumberLast4: string;
  ibanLast4: string | null;
  isActive: boolean;
  notes: string | null;
}

export interface Setting {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string | null;
}

export const ORDER_STATUS_LABELS_AR: Record<string, string> = {
  pending: 'قيد المراجعة',
  confirmed: 'مؤكد',
  processing: 'قيد التجهيز',
  packed: 'تم التغليف',
  shipped: 'تم الشحن',
  out_for_delivery: 'خارج للتوصيل',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
  returned: 'مرتجع',
  refunded: 'مسترد',
};

export const ORDER_STATUS_FLOW = [
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
];

export const DISCOUNT_REASON_LABELS_AR: Record<string, string> = {
  first_order: 'خصم أول طلب',
  cart_value: 'خصم قيمة السلة',
  coupon: 'كوبون خصم',
};
