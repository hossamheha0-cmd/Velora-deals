import { DataSourceOptions } from 'typeorm';

// نقطة واحدة لبناء إعدادات الاتصال بقاعدة البيانات، تُستخدم في app.module.ts (تشغيل التطبيق)
// وdata-source.ts (CLI Migrations) معًا - لتفادي أي فرق أو تعارض بين الاثنين.
//
// لو DATABASE_URL موجود (حالة Neon أو أي مزود PostgreSQL سحابي آخر يعطي Connection String
// جاهز) نستخدمه مباشرة مع SSL مفعّل (مطلوب من Neon). غير كده، نرجع للمتغيرات المنفصلة
// (DB_HOST/DB_PORT/...) المناسبة للتطوير المحلي.
export function buildDatabaseConfig(): Partial<DataSourceOptions> {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      ssl: { rejectUnauthorized: false }, // مطلوب لـNeon ومعظم مزودي PostgreSQL السحابيين
    } as Partial<DataSourceOptions>;
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'velora_deals_uae',
  } as Partial<DataSourceOptions>;
}
