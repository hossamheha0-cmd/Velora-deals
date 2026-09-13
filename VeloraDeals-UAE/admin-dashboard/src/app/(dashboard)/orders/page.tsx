'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Order, ORDER_STATUS_LABELS_AR } from '@/lib/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  function load(status?: string) {
    const query = status ? `?status=${status}` : '';
    apiRequest<Order[]>(`/admin/orders${query}`)
      .then(setOrders)
      .catch((e) => setError(e.message));
  }

  useEffect(() => load(), []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">الطلبات</h1>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            load(e.target.value || undefined);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">كل الحالات</option>
          {Object.entries(ORDER_STATUS_LABELS_AR).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-right bg-gray-50">
              <th className="p-4">رقم الطلب</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">الدفع</th>
              <th className="p-4">الإجمالي</th>
              <th className="p-4">تتبع الشحنة</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((o) => (
              <tr key={o.id} className="border-t border-gray-50">
                <td className="p-4 font-mono text-xs">{o.orderNumber}</td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                    {ORDER_STATUS_LABELS_AR[o.status] || o.status}
                  </span>
                </td>
                <td className="p-4">
                  {o.paymentMethodCode.toUpperCase()}
                  <span className="text-xs text-gray-400 block">{o.paymentStatus}</span>
                </td>
                <td className="p-4">{Number(o.finalTotal).toFixed(2)} AED</td>
                <td className="p-4 text-xs text-gray-500">{o.trackingNumber || '—'}</td>
                <td className="p-4">
                  <Link href={`/orders/${o.id}` as any} className="text-purple-600 hover:underline">
                    عرض التفاصيل
                  </Link>
                </td>
              </tr>
            ))}
            {orders && orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  لا توجد طلبات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
