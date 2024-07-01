import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'localhost',
    port: 5437,
    user: 'postgres',
    password: '5437',
    database: 'library-management-db',
    ssl: false,
  },
  verbose: true,
  strict: true,
});
