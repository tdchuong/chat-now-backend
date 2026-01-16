import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  require('dotenv').config({ path: '.env.development', override: true });
}

export default defineConfig({
  schema: './prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx ./prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
