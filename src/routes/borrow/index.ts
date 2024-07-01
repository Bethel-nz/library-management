import { Hono, Context } from 'hono';
import drizzle from '~drizzle';
import { books, borrowedBooks } from '~drizzle/models';
import { eq, and, count } from 'drizzle-orm';
import dayjs from 'dayjs';
import { sendEmail } from '~utils/email';
import * as z from 'zod';

const borrow = new Hono();

const borrowSchema = z.object({
  book_id: z.string().uuid({ message: 'Invalid book ID' }),
  user_id: z.string().uuid({ message: 'Invalid user ID' }),
  return_date: z.string().refine((date) => dayjs(date).isValid(), {
    message: 'Invalid return date',
  }),
});

const extendSchema = z.object({
  borrow_id: z.string().uuid({ message: 'Invalid borrow ID' }),
  new_return_date: z.string().refine((date) => dayjs(date).isValid(), {
    message: 'Invalid return date',
  }),
});

borrow.post('/', async (c: Context) => {
  try {
    const { book_id, return_date } = await c.req.json();
    const user_id = c.get('user').id;
    const isValid = borrowSchema.safeParse({ book_id, user_id, return_date });
    if (!isValid.success) {
      return c.json(
        { error: isValid.error.message, details: isValid.error.issues },
        422
      );
    }

    // Check if the user has already borrowed 3 books
    const borrowedBooksCount = await drizzle
      .select({ count: count() })
      .from(borrowedBooks)
      .where(
        and(
          eq(borrowedBooks.user_id, user_id),
          eq(borrowedBooks.returned, false)
        )
      );

    if (borrowedBooksCount.length > 3) {
      return c.json(
        { message: 'You can only borrow a maximum of 3 books at a time' },
        403
      );
    }

    // Check if the book is available
    const [book] = await drizzle
      .select()
      .from(books)
      .where(and(eq(books.id, book_id), eq(books.is_available, true)));

    if (!book) {
      return c.json({ message: 'Book not available or not found' }, 404);
    }

    const returnDate = dayjs(return_date).toISOString();

    const [newBorrow] = await drizzle
      .insert(borrowedBooks)
      .values({ book_id, user_id, due_date: returnDate as unknown as Date })
      .returning();

    // Update book availability
    await drizzle
      .update(books)
      .set({ is_available: false })
      .where(eq(books.id, book_id));

    // Send email notification
    await sendEmail({
      to: user_id, // Assuming user_id is the email
      subject: 'Book Borrowed Successfully',
      text: `You have successfully borrowed the book titled "${book.title}". Please return it by ${return_date}.`,
    });

    return c.json(
      { message: 'Book borrowed successfully', borrow: newBorrow },
      201
    );
  } catch (error) {
    console.error(error);
    return c.json({ message: 'Internal Server Error' }, 500);
  }
});

borrow.put('/extend', async (c: Context) => {
  try {
    const { borrow_id, new_return_date } = await c.req.json();
    const isValid = extendSchema.safeParse({ borrow_id, new_return_date });

    if (!isValid.success) {
      return c.json(
        { error: isValid.error.message, details: isValid.error.issues },
        422
      );
    }

    const newReturnDate = dayjs(new_return_date).toDate();

    const [updatedBorrow] = await drizzle
      .update(borrowedBooks)
      .set({ due_date: newReturnDate })
      .where(eq(borrowedBooks.id, borrow_id))
      .returning();

    if (!updatedBorrow) {
      return c.json(
        { message: 'Borrow record not found or update failed' },
        404
      );
    }

    return c.json({
      message: 'Borrow period extended successfully',
      borrow: updatedBorrow,
    });
  } catch (error) {
    console.error(error);
    return c.json({ message: 'Internal Server Error' }, 500);
  }
});

const updateBorrowedBookSchema = z.object({
  book_id: z.string().uuid({ message: 'Invalid book ID' }),
  user_id: z.string().uuid({ message: 'Invalid user ID' }),
});

borrow.put('/return', async (c: Context) => {
  try {
    const { book_id, user_id } = await c.req.json();
    const isValid = updateBorrowedBookSchema.safeParse({ book_id, user_id });

    if (!isValid.success) {
      return c.json(
        { error: isValid.error.message, details: isValid.error.issues },
        422
      );
    }

    const [updatedBorrow] = await drizzle
      .update(borrowedBooks)
      .set({ returned: true, due_date: null })
      .where(
        and(
          eq(borrowedBooks.book_id, book_id),
          eq(borrowedBooks.user_id, user_id)
        )
      )
      .returning();

    if (!updatedBorrow) {
      return c.json(
        { message: 'Borrow record not found or update failed' },
        404
      );
    }

    await drizzle
      .update(books)
      .set({ is_available: true })
      .where(eq(books.id, book_id));

    return c.json({
      message: 'Book return processed successfully',
      borrow: updatedBorrow,
    });
  } catch (error) {
    console.error(error);
    return c.json({ message: 'Internal Server Error' }, 500);
  }
});

export default borrow;
