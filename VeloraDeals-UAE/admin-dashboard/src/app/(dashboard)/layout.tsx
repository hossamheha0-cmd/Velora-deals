'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const NAV_ITEMS = [
  { href: '/', label: 'لوحة القيادة', icon: '📊' },
  { href: '/orders', label: 'الطلبات', icon: '📦' },
  { href: '/products', label: 'المنتجات', icon: '🛍️' },
  { href: '/categories', label: 'الفئات', icon: '🗂️' },
  { href: '/payment-methods', label: 'طرق الدفع', icon: '💳' },
  { href: '/bank-accounts', label: 'الحسابات البنكية', icon: '🏦' },
  { href: '/settings', label: 'الإعدادات', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { admin, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !admin) {
      router.replace('/login');
    }
  }, [loading, admin, router]);

  if (loading || !admin) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">جارِ التحميل...</div>;
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-800">
          <h1 className="font-bold text-lg bg-gradient-to-l from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Velora Deals UAE
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">لوحة التحكم</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href as any}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  active ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <div className="px-3 py-2 text-xs text-gray-400">
            <div className="text-white text-sm">{admin.fullName}</div>
            <div>{admin.role}</div>
          </div>
          <button
            onClick={logout}
            className="w-full mt-2 text-sm text-right px-3 py-2 rounded-lg text-red-300 hover:bg-red-900/30"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
