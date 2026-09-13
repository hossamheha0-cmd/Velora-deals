'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest, ApiError } from '@/lib/api';
import { Order, ORDER_STATUS_LABELS_AR, ORDER_STATUS_FLOW, DISCOUNT_REASON_LABELS_AR } from '@/lib/types';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [notes, setNotes] = useState('');

  function load() {
    apiRequest<Order>(`/admin/orders/${params.id}`)
      .then((o) => {
        setOrder(o);
        setTrackingNumber(o.trackingNumber || '');
        setCarrier(o.shippingCarrierName || '');
        setNotes(o.shippingNotes || '');
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'خطأ غير متوقع'));
  }

  useEffect(load, [params.id]);

  async function updateStatus(status: string) {
    setSaving(true);
    try {
      await apiRequest(`/admin/orders/${params.id}/status`, { method: 'PATCH', body: { status } });
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذر تحديث الحالة');
    } finally {
      setSaving(false);
    }
  }

  async function approveOrder() {
    setSaving(true);
    try {
      await apiRequest(`/admin/orders/${params.id}/approve`, { method: 'PATCH' });
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذر اعتماد الطلب');
    } finally {
      setSaving(false);
    }
  }

  async function approveReady() {
    setSaving(true);
    try {
      await apiRequest(`/admin/orders/${params.id}/approve-ready`, { method: 'PATCH' });
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذر تجهيز الطلب للشحن');
    } finally {
      setSaving(false);
    }
  }

  async function saveShipping() {
    setSaving(true);
    try {
      await apiRequest(`/admin/orders/${params.id}/shipping`, {
        method: 'PATCH',
        body: { trackingNumber, shippingCarrierName: carrier, shippingNotes: notes },
      });
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذر حفظ بيانات الشحن');
    } finally {
      setSaving(false);
    }
  }

  if (error) return <div className="text-red-600">{error}</div>;
  if (!order) return <div className="text-gray-500">جارِ التحميل...</div>;

  const nextStatusIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const nextStatus = ORDER_STATUS_FLOW[nextStatusIndex + 1];

  return (
    <div>
      <button onClick={() => router.push('/orders')} className="text-sm text-gray-500 mb-4">
        → رجوع لكل الطلبات
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono">{order.orderNumber}</h1>
          <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
            {ORDER_STATUS_LABELS_AR[order.status] || order.status}
          </span>
        </div>
        <div className="flex gap-2">
          {/* بوابة 1: Pending -> Preparing (Processing) */}
          {['pending', 'confirmed'].includes(order.status) && (
            <button
              onClick={approveOrder}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-60"
            >
              ✔ اعتماد الطلب (بدء التجهيز)
            </button>
          )}
          {/* بوابة 2: Preparing -> Shipped (خرج مع المندوب) */}
          {['processing', 'packed'].includes(order.status) && (
            <button
              onClick={approveReady}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-60"
            >
              🚚 جاهز للشحن (خرج مع المندوب)
            </button>
          )}
          {/* باقي المراحل اللوجستية (بعد الشحن) - نفس آلية الانتقال العامة */}
          {order.status !== 'pending' &&
            order.status !== 'confirmed' &&
            order.status !== 'processing' &&
            order.status !== 'packed' &&
            order.status !== 'cancelled' &&
            order.status !== 'delivered' &&
            nextStatus && (
              <button
                onClick={() => updateStatus(nextStatus)}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm disabled:opacity-60"
              >
                التالي: {ORDER_STATUS_LABELS_AR[nextStatus]}
              </button>
            )}
          {['pending', 'confirmed'].includes(order.status) && (
            <button
              onClick={() => updateStatus('cancelled')}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm disabled:opacity-60"
            >
              إلغاء الطلب
            </button>
          )}
        </div>
      </div>

      {/* شريط توضيحي لمسار Order Tracking Workflow المعتمد */}
      <div className="mb-6 flex items-center gap-1 text-xs text-gray-400 overflow-x-auto pb-1">
        {['pending', 'processing', 'shipped', 'delivered'].map((s, i, arr) => {
          const stepLabels: Record<string, string> = {
            pending: 'قيد المراجعة',
            processing: 'قيد التجهيز (Preparing)',
            shipped: 'جاهز/خرج مع المندوب',
            delivered: 'تم التسليم',
          };
          const currentIndex = arr.indexOf(
            ['pending', 'confirmed'].includes(order.status)
              ? 'pending'
              : ['processing', 'packed'].includes(order.status)
                ? 'processing'
                : ['shipped', 'out_for_delivery'].includes(order.status)
                  ? 'shipped'
                  : order.status,
          );
          const reached = currentIndex >= i;
          return (
            <div key={s} className="flex items-center gap-1 shrink-0">
              <span className={`px-2 py-1 rounded-full ${reached ? 'bg-purple-100 text-purple-700 font-semibold' : 'bg-gray-100'}`}>
                {stepLabels[s]}
              </span>
              {i < arr.length - 1 && <span className="text-gray-300">→</span>}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold mb-4">المنتجات</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-right">
                  <th className="pb-2">المنتج</th>
                  <th className="pb-2">SKU</th>
                  <th className="pb-2">الكمية</th>
                  <th className="pb-2">السعر</th>
                  <th className="pb-2">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-t border-gray-50">
                    <td className="py-2">{item.productNameSnapshot}</td>
                    <td className="py-2 font-mono text-xs">{item.skuSnapshot}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">{Number(item.unitPriceSnapshot).toFixed(2)}</td>
                    <td className="py-2">{Number(item.lineTotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold mb-4">إدارة الشحن (يدوي)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">شركة الشحن</label>
                <input
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="مثال: Aramex, مندوب محلي..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">رقم التتبع</label>
                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">ملاحظات الشحن الداخلية</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
            </div>
            <button
              onClick={saveShipping}
              disabled={saving}
              className="mt-4 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm disabled:opacity-60"
            >
              حفظ بيانات الشحن
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-fit">
          <h2 className="font-semibold mb-4">ملخص الحساب</h2>
          <div className="space-y-2 text-sm">
            <Row label="المجموع الفرعي" value={order.subtotal} />
            <Row label="الخصم" value={-order.discountAmount} />
            {order.discountReason && (
              <div className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-2 py-1">
                {DISCOUNT_REASON_LABELS_AR[order.discountReason] || order.discountReason}
                {order.couponCode && ` — كود: ${order.couponCode}`}
              </div>
            )}
            <Row label={`ضريبة القيمة المضافة (${order.vatRate}%)`} value={order.vatAmount} />
            <Row label="رسوم الشحن" value={order.shippingFee} />
            <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold">
              <span>الإجمالي النهائي</span>
              <span>{Number(order.finalTotal).toFixed(2)} AED</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm space-y-1">
            <div className="flex justify-between text-gray-500">
              <span>طريقة الدفع</span>
              <span>{order.paymentMethodCode.toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>حالة الدفع</span>
              <span>{order.paymentStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>{label}</span>
      <span>{Number(value).toFixed(2)} AED</span>
    </div>
  );
}
