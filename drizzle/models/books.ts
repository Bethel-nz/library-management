import { boolean, integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

const books = pgTable('books', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  author: varchar('author', { length: 255 }).notNull(),
  year: integer('year').notNull(),
  isbn: varchar('isbn', { length: 13 }).notNull(),
  is_available: boolean('available').default(true).notNull(),
});

export default books;
