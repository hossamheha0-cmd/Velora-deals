'use client';

import { useEffect, useState } from 'react';
import { apiRequest, ApiError } from '@/lib/api';
import { Category } from '@/lib/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    apiRequest<Category[]>('/admin/categories')
      .then(setCategories)
      .catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiRequest('/admin/categories', { method: 'POST', body: { nameAr, nameEn, slug } });
      setNameAr('');
      setNameEn('');
      setSlug('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر إنشاء الفئة');
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(cat: Category) {
    await apiRequest(`/admin/categories/${cat.id}`, { method: 'PATCH', body: { enabled: !cat.enabled } });
    load();
  }

  async function remove(cat: Category) {
    if (!confirm(`حذف الفئة "${cat.nameAr}"؟`)) return;
    await apiRequest(`/admin/categories/${cat.id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">الفئات</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm"
        >
          {showForm ? 'إلغاء' : '+ فئة جديدة'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createCategory} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input required placeholder="الاسم بالعربي" value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input required placeholder="Name in English" value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input required placeholder="slug (e.g. electronics)" value={slug} onChange={(e) => setSlug(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button disabled={saving} className="sm:col-span-3 bg-gray-900 text-white rounded-lg py-2 text-sm disabled:opacity-60">
            حفظ الفئة
          </button>
        </form>
      )}

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-right bg-gray-50">
              <th className="p-4">الاسم (عربي)</th>
              <th className="p-4">Name (EN)</th>
              <th className="p-4">Slug</th>
              <th className="p-4">الحالة</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((c) => (
              <tr key={c.id} className="border-t border-gray-50">
                <td className="p-4">{c.nameAr}</td>
                <td className="p-4">{c.nameEn}</td>
                <td className="p-4 font-mono text-xs">{c.slug}</td>
                <td className="p-4">
                  <button
                    onClick={() => toggleEnabled(c)}
                    className={`px-2 py-1 rounded-full text-xs ${c.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {c.enabled ? 'مفعّلة' : 'معطّلة'}
                  </button>
                </td>
                <td className="p-4">
                  <button onClick={() => remove(c)} className="text-red-600 hover:underline text-xs">
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {categories && categories.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">لا توجد فئات بعد</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
