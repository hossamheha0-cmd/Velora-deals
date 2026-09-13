'use client';

import { useEffect, useState } from 'react';
import { apiRequest, ApiError } from '@/lib/api';
import { Product, Category } from '@/lib/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nameAr: '', nameEn: '', slug: '', categoryId: '', basePrice: '', sku: '', stockQuantity: '',
  });

  function load() {
    apiRequest<Product[]>('/admin/products').then(setProducts).catch((e) => setError(e.message));
    apiRequest<Category[]>('/admin/categories').then(setCategories).catch(() => {});
  }
  useEffect(load, []);

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiRequest('/admin/products', {
        method: 'POST',
        body: {
          ...form,
          basePrice: Number(form.basePrice),
          stockQuantity: Number(form.stockQuantity),
        },
      });
      setForm({ nameAr: '', nameEn: '', slug: '', categoryId: '', basePrice: '', sku: '', stockQuantity: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر إنشاء المنتج');
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(p: Product) {
    await apiRequest(`/admin/products/${p.id}`, { method: 'PATCH', body: { enabled: !p.enabled } });
    load();
  }

  async function remove(p: Product) {
    if (!confirm(`حذف المنتج "${p.nameAr}"؟`)) return;
    await apiRequest(`/admin/products/${p.id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">المنتجات</h1>
        <button onClick={() => setShowForm((v) => !v)} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm">
          {showForm ? 'إلغاء' : '+ منتج جديد'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createProduct} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input required placeholder="الاسم بالعربي" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input required placeholder="Name in English" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input required placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">اختر الفئة</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nameAr}</option>
            ))}
          </select>
          <input required type="number" step="0.01" placeholder="السعر (AED)" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input required placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input required type="number" placeholder="الكمية بالمخزون" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button disabled={saving} className="sm:col-span-3 bg-gray-900 text-white rounded-lg py-2 text-sm disabled:opacity-60">
            حفظ المنتج
          </button>
        </form>
      )}

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-right bg-gray-50">
              <th className="p-4">المنتج</th>
              <th className="p-4">SKU</th>
              <th className="p-4">السعر</th>
              <th className="p-4">المخزون</th>
              <th className="p-4">الحالة</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.id} className="border-t border-gray-50">
                <td className="p-4">{p.nameAr}</td>
                <td className="p-4 font-mono text-xs">{p.sku}</td>
                <td className="p-4">{Number(p.basePrice).toFixed(2)} AED</td>
                <td className="p-4">
                  <span className={p.stockQuantity <= p.lowStockThreshold ? 'text-red-600 font-semibold' : ''}>
                    {p.stockQuantity}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => toggleEnabled(p)} className={`px-2 py-1 rounded-full text-xs ${p.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.enabled ? 'مفعّل' : 'معطّل'}
                  </button>
                </td>
                <td className="p-4">
                  <button onClick={() => remove(p)} className="text-red-600 hover:underline text-xs">حذف</button>
                </td>
              </tr>
            ))}
            {products && products.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">لا توجد منتجات بعد</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
