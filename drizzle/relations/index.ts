import { relations } from 'drizzle-orm';
import { books, users, borrowedBooks, userRole } from '../models';

export const USER_TABLE_RELATIONS = relations(users, ({ one, many }) => {
  return {
    borrowedBooks: many(borrowedBooks),
  };
});

export const BOOK_TABLE_RELATIONS = relations(books, ({ one, many }) => ({
  borrowedBooks: many(borrowedBooks),
}));

export const BORROWED_BOOK_TABLE_RELATIONS = relations(
  borrowedBooks,
  ({ one }) => {
    return {
      user: one(users, {
        fields: [borrowedBooks.user_id],
        references: [users.id],
      }),
      book: one(books, {
        fields: [borrowedBooks.book_id],
        references: [books.id],
      }),
    };
  }
);
