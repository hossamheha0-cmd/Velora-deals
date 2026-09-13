'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Order, ORDER_STATUS_LABELS_AR } from '@/lib/types';

export default function DashboardHome() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Order[]>('/admin/orders')
      .then(setOrders)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="text-red-600">{error}</div>;
  if (!orders) return <div className="text-gray-500">جارِ التحميل...</div>;

  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.finalTotal), 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const stats = [
    { label: 'إجمالي الطلبات', value: totalOrders, color: 'from-purple-500 to-purple-700' },
    { label: 'إجمالي الإيرادات (AED)', value: totalRevenue.toFixed(2), color: 'from-pink-500 to-pink-700' },
    { label: 'طلبات قيد المراجعة', value: pendingCount, color: 'from-amber-500 to-amber-700' },
    { label: 'طلبات تم تسليمها', value: deliveredCount, color: 'from-emerald-500 to-emerald-700' },
  ];

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">لوحة القيادة</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 text-white bg-gradient-to-l ${s.color}`}>
            <div className="text-sm opacity-90">{s.label}</div>
            <div className="text-3xl font-bold mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 font-semibold">أحدث الطلبات</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-right">
              <th className="p-4">رقم الطلب</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">طريقة الدفع</th>
              <th className="p-4">الإجمالي</th>
              <th className="p-4">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-t border-gray-50">
                <td className="p-4 font-mono text-xs">{o.orderNumber}</td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                    {ORDER_STATUS_LABELS_AR[o.status] || o.status}
                  </span>
                </td>
                <td className="p-4">{o.paymentMethodCode.toUpperCase()}</td>
                <td className="p-4">{Number(o.finalTotal).toFixed(2)} AED</td>
                <td className="p-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString('ar-AE')}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  لا توجد طلبات بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
