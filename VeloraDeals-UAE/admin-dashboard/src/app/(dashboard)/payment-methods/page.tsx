'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { PaymentMethod } from '@/lib/types';

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    apiRequest<PaymentMethod[]>('/admin/payment-methods').then(setMethods).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function toggle(pm: PaymentMethod) {
    await apiRequest(`/admin/payment-methods/${pm.code}/${pm.enabled ? 'disable' : 'enable'}`, {
      method: 'PATCH',
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">طرق الدفع</h1>
      <p className="text-sm text-gray-500 mb-6">
        Cash On Delivery هي الطريقة الوحيدة المفعّلة في هذه المرحلة. بوابات الدفع الإلكتروني (Telr, PayTabs) جاهزة معماريًا لكن معطّلة حتى قرار مستقبلي.
      </p>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods?.map((pm) => (
          <div key={pm.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{pm.nameAr}</h3>
              {pm.isDefault && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">افتراضية</span>}
            </div>
            <p className="text-xs text-gray-500 mb-4">{pm.nameEn} · {pm.type === 'manual' ? 'يدوية' : 'بوابة إلكترونية'}</p>
            <button
              onClick={() => toggle(pm)}
              disabled={pm.type === 'gateway'}
              className={`w-full py-2 rounded-lg text-sm font-medium ${
                pm.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
              } ${pm.type === 'gateway' ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={pm.type === 'gateway' ? 'يتطلب تفعيل التكامل التقني أولًا' : ''}
            >
              {pm.enabled ? '✔ مفعّلة — اضغط للتعطيل' : 'معطّلة — اضغط للتفعيل'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
