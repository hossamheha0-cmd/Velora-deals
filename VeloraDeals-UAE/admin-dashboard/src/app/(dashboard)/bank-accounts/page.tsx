'use client';

import { useEffect, useState } from 'react';
import { apiRequest, ApiError } from '@/lib/api';
import { BankAccount } from '@/lib/types';

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    bankName: '', accountHolderName: '', accountNumberLast4: '', ibanLast4: '', notes: '',
  });

  function load() {
    apiRequest<BankAccount[]>('/admin/bank-accounts').then(setAccounts).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiRequest('/admin/bank-accounts', { method: 'POST', body: form });
      setForm({ bankName: '', accountHolderName: '', accountNumberLast4: '', ibanLast4: '', notes: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر إضافة الحساب');
    } finally {
      setSaving(false);
    }
  }

  async function activate(id: string) {
    try {
      await apiRequest(`/admin/bank-accounts/${id}/activate`, { method: 'PATCH' });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر تفعيل الحساب');
    }
  }

  async function remove(acc: BankAccount) {
    if (!confirm(`حذف حساب "${acc.bankName}"؟`)) return;
    await apiRequest(`/admin/bank-accounts/${acc.id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">الحسابات البنكية</h1>
        <button onClick={() => setShowForm((v) => !v)} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm">
          {showForm ? 'إلغاء' : '+ حساب جديد'}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        بيانات مرجعية داخلية فقط لتحديد الحساب الذي يستلم التسويات الحالية — وليست بوابة دفع أو
        ربط بنكي فعلي. الحساب المفعّل (Active) واحد فقط دائمًا؛ اضغط &quot;تفعيل&quot; على أي
        حساب آخر للتبديل إليه فورًا.
      </p>

      {showForm && (
        <form onSubmit={createAccount} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input required placeholder="اسم البنك" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input required placeholder="اسم صاحب الحساب" value={form.accountHolderName} onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input required placeholder="آخر 4 أرقام من رقم الحساب" value={form.accountNumberLast4} onChange={(e) => setForm({ ...form, accountNumberLast4: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="آخر 4 أرقام من IBAN (اختياري)" value={form.ibanLast4} onChange={(e) => setForm({ ...form, ibanLast4: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <textarea placeholder="ملاحظات (اختياري)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="sm:col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} />
          <button disabled={saving} className="sm:col-span-2 bg-gray-900 text-white rounded-lg py-2 text-sm disabled:opacity-60">
            حفظ الحساب
          </button>
        </form>
      )}

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {accounts?.map((acc) => (
          <div key={acc.id} className={`bg-white rounded-2xl shadow-sm border p-5 ${acc.isActive ? 'border-purple-300' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{acc.bankName}</h3>
              {acc.isActive && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">نشط حاليًا</span>}
            </div>
            <p className="text-sm text-gray-600">{acc.accountHolderName}</p>
            <p className="text-xs text-gray-400 mt-1">•••• {acc.accountNumberLast4}{acc.ibanLast4 ? ` · IBAN •••• ${acc.ibanLast4}` : ''}</p>
            {acc.notes && <p className="text-xs text-gray-400 mt-2">{acc.notes}</p>}
            <div className="flex gap-2 mt-4">
              {!acc.isActive && (
                <button onClick={() => activate(acc.id)} className="flex-1 py-2 rounded-lg bg-purple-600 text-white text-xs font-medium">
                  تفعيل (تبديل إليه)
                </button>
              )}
              <button onClick={() => remove(acc)} className="text-red-600 hover:underline text-xs">حذف</button>
            </div>
          </div>
        ))}
        {accounts && accounts.length === 0 && (
          <div className="col-span-2 text-center text-gray-400 p-8">لا توجد حسابات بنكية مضافة بعد</div>
        )}
      </div>
    </div>
  );
}
