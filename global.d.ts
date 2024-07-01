import { InferSelectModel } from 'drizzle-orm';
import { users, books, borrowedBooks, userRole } from './drizzle/models';

type User = InferSelectModel<typeof users>;
type Books = InferSelectModel<typeof books>;
type BorrowedBooks = InferSelectModel<typeof borrowedBooks>;
type Role = (typeof users.$inferSelect)['role'];

type NewUser = typeof users.$inferInsert;
type NewBooks = typeof books.$inferInsert;
type NewBorrowedBook = typeof borrowedBooks.$inferInsert;
