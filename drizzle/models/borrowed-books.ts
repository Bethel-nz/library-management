import { boolean, pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';

import users from './users';
import books from './books';

const borrowedBooks = pgTable('borrowedBooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'no action',
    }),
  book_id: uuid('book_id')
    .notNull()
    .references(() => books.id, {
      onDelete: 'cascade',
      onUpdate: 'no action',
    }),
  borrowed_at: timestamp('borrowed_at').defaultNow().notNull(),
  due_date: timestamp('due_date'),
  returned: boolean('returned').default(false).notNull(),
});

export default borrowedBooks;
