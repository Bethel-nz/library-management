import { pgTable, uuid, varchar, index } from 'drizzle-orm/pg-core';
import userRole from './role';
import { password } from 'bun';

const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    role: userRole('role').default('STUDENT').notNull(),
  },
  (table) => {
    return {
      emailIndex: index('emailIndex').on(table.email),
    };
  }
);

export default users;
