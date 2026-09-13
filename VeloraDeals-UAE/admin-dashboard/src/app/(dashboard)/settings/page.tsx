'use client';

import { useEffect, useState } from 'react';
import { apiRequest, ApiError } from '@/lib/api';
import { Setting } from '@/lib/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[] | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function load() {
    apiRequest<Setting[]>('/admin/settings').then((data) => {
      setSettings(data);
      const map: Record<string, string> = {};
      data.forEach((s) => (map[s.key] = s.value));
      setValues(map);
    }).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function saveSetting(key: string, type: Setting['type']) {
    setSaving(key);
    setError(null);
    setSuccess(null);
    try {
      await apiRequest(`/admin/settings/${key}`, { method: 'PUT', body: { value: values[key], type } });
      setSuccess(`تم حفظ "${key}" بنجاح`);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذر الحفظ');
    } finally {
      setSaving(null);
    }
  }

  if (!settings) return <div className="text-gray-500">جارِ التحميل...</div>;

  const find = (key: string) => settings.find((s) => s.key === key);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">إعدادات المتجر</h1>

      {error && <div className="text-red-600 mb-4 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}
      {success && <div className="text-emerald-700 mb-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SettingCard
          title="رسوم الشحن الأساسية (AED)"
          description="القيمة المطبّقة على كل طلب ما لم يكن الشحن المجاني مفعّلًا ومحققًا"
          value={values.shipping_fee ?? ''}
          onChange={(v) => setValues({ ...values, shipping_fee: v })}
          onSave={() => saveSetting('shipping_fee', 'number')}
          saving={saving === 'shipping_fee'}
          type="number"
        />

        <ToggleCard
          title="تفعيل الشحن المجاني"
          checked={values.free_shipping_enabled === 'true'}
          onToggle={(v) => {
            setValues({ ...values, free_shipping_enabled: String(v) });
          }}
          onSave={() => saveSetting('free_shipping_enabled', 'boolean')}
          saving={saving === 'free_shipping_enabled'}
        />

        <SettingCard
          title="الحد الأدنى للشحن المجاني (AED)"
          description="يُطبَّق فقط عند تفعيل الشحن المجاني أعلاه"
          value={values.free_shipping_threshold ?? ''}
          onChange={(v) => setValues({ ...values, free_shipping_threshold: v })}
          onSave={() => saveSetting('free_shipping_threshold', 'number')}
          saving={saving === 'free_shipping_threshold'}
          type="number"
        />

        <ToggleCard
          title="تفعيل ضريبة القيمة المضافة (VAT)"
          checked={values.vat_enabled === 'true'}
          onToggle={(v) => setValues({ ...values, vat_enabled: String(v) })}
          onSave={() => saveSetting('vat_enabled', 'boolean')}
          saving={saving === 'vat_enabled'}
        />

        <SettingCard
          title="نسبة الضريبة VAT (%)"
          description="نسبة مئوية تُحسب على المجموع الفرعي بعد الخصم — الافتراضي 5%"
          value={values.vat_rate ?? ''}
          onChange={(v) => setValues({ ...values, vat_rate: v })}
          onSave={() => saveSetting('vat_rate', 'number')}
          saving={saving === 'vat_rate'}
          type="number"
        />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold mb-1">حالة طلب COD الابتدائية</h3>
          <p className="text-xs text-gray-500 mb-3">
            الافتراضي "قيد المراجعة" بحيث يراجع الفريق الطلب قبل التأكيد. يمكن تغييره لاحقًا إلى "مؤكد تلقائيًا".
          </p>
          <select
            value={values.default_cod_order_status ?? 'pending'}
            onChange={(e) => setValues({ ...values, default_cod_order_status: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
          >
            <option value="pending">قيد المراجعة (Pending)</option>
            <option value="confirmed">مؤكد تلقائيًا (Confirmed)</option>
          </select>
          <button
            onClick={() => saveSetting('default_cod_order_status', 'string')}
            disabled={saving === 'default_cod_order_status'}
            className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm disabled:opacity-60"
          >
            حفظ
          </button>
        </div>

        <ToggleCard
          title="إظهار تتبع حالة الطلب للعملاء (Live Order Tracking)"
          checked={values.live_order_tracking_enabled === 'true'}
          onToggle={(v) => setValues({ ...values, live_order_tracking_enabled: String(v) })}
          onSave={() => saveSetting('live_order_tracking_enabled', 'boolean')}
          saving={saving === 'live_order_tracking_enabled'}
        />

        <SettingCard
          title="الحد الأقصى لطلبات الدفع عند الاستلام (AED)"
          description="الطلبات التي تتجاوز هذه القيمة تُرفَض تلقائيًا لطريقة COD وتتطلب دفعًا إلكترونيًا. القيمة 0 = بدون حد (معطّل). ⚠️ لا تفعّله بقيمة أكبر من صفر إلا بعد تفعيل بوابة دفع إلكترونية فعلية، وإلا ستصبح الطلبات الكبيرة غير قابلة للإتمام."
          value={values.max_cod_amount ?? '0'}
          onChange={(v) => setValues({ ...values, max_cod_amount: v })}
          onSave={() => saveSetting('max_cod_amount', 'number')}
          saving={saving === 'max_cod_amount'}
          type="number"
        />

        <ToggleCard
          title="طلب OTP إضافي عند الدفع بالبطاقة"
          checked={values.card_payment_otp_enabled === 'true'}
          onToggle={(v) => setValues({ ...values, card_payment_otp_enabled: String(v) })}
          onSave={() => saveSetting('card_payment_otp_enabled', 'boolean')}
          saving={saving === 'card_payment_otp_enabled'}
        />

        <SettingCard
          title="الحد الأدنى لتفعيل OTP البطاقة (AED)"
          description="⚠️ هذا الإعداد غير فعّال حاليًا لعدم وجود بوابة دفع إلكتروني حقيقية مربوطة بعد (Telr/PayTabs معطّلتان). سيُستخدم تلقائيًا عند ربط بوابة دفع فعلية مستقبلًا."
          value={values.card_payment_otp_threshold ?? '500'}
          onChange={(v) => setValues({ ...values, card_payment_otp_threshold: v })}
          onSave={() => saveSetting('card_payment_otp_threshold', 'number')}
          saving={saving === 'card_payment_otp_threshold'}
          type="number"
        />
      </div>
    </div>
  );
}

function SettingCard({
  title, description, value, onChange, onSave, saving, type,
}: {
  title: string; description: string; value: string; onChange: (v: string) => void;
  onSave: () => void; saving: boolean; type: 'number' | 'string';
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      <input
        type={type === 'number' ? 'number' : 'text'}
        step={type === 'number' ? '0.01' : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
      />
      <button onClick={onSave} disabled={saving} className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm disabled:opacity-60">
        {saving ? 'جارِ الحفظ...' : 'حفظ'}
      </button>
    </div>
  );
}

function ToggleCard({
  title, checked, onToggle, onSave, saving,
}: {
  title: string; checked: boolean; onToggle: (v: boolean) => void; onSave: () => void; saving: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
      <h3 className="font-semibold mb-3">{title}</h3>
      <label className="flex items-center gap-2 mb-3 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} className="w-4 h-4" />
        <span className="text-sm">{checked ? 'مفعّل' : 'معطّل'}</span>
      </label>
      <button onClick={onSave} disabled={saving} className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm disabled:opacity-60">
        {saving ? 'جارِ الحفظ...' : 'حفظ'}
      </button>
    </div>
  );
}
