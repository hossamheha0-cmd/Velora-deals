import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();
import { buildDatabaseConfig } from '../config/database.config';

// يُستخدم هذا الملف بواسطة TypeORM CLI لتوليد وتشغيل الـMigrations الحقيقية.
// لا نستخدم "synchronize: true" أبدًا في مشروع حقيقي — كل تغيير في الـSchema يمر عبر Migration موثّق.
export const AppDataSource = new DataSource({
  ...buildDatabaseConfig(),
  entities: [__dirname + '/../modules/**/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
} as DataSourceOptions);
