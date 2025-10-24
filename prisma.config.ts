import path from 'path';
import { defineConfig, env } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('db', 'migrations'),
    seed: 'tsx db/seed.ts',
  },
  views: {
    path: path.join('db', 'views'),
  },
  typedSql: {
    path: path.join('db', 'queries'),
  },
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
