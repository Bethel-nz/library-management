import { Hono, Context } from 'hono';
import drizzle from '~drizzle';
import { books } from '~drizzle/models';
import { eq } from 'drizzle-orm';
import * as z from 'zod';

const book = new Hono();

const bookSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  author: z.string().min(1, { message: 'Author is required' }),
  isbn: z
    .string()
    .min(7, { message: 'ISBN must be at least 8 and max 13 characters long' })
    .max(13, { message: 'ISBN must be 13 characters long' }),
  is_available: z.boolean().default(true),
  year: z
    .number()
    .min(1900, { message: 'Year must be 1900 or later' })
    .max(new Date().getFullYear(), {
      message: 'Year must be no later than the current year',
    }),
});
const updateBookSchema = bookSchema.partial();

book.post('/create', async (c: Context) => {
  try {
    const { title, author, isbn, is_available, year } = await c.req.json();
    const user = c.get('user');
    const isValid = bookSchema.safeParse({
      title,
      author,
      isbn,
      is_available,
      year,
    });

    if (!isValid.success) {
      return c.json(
        { error: isValid.error.message, details: isValid.error.issues },
        422
      );
    }

    const existingBook = await drizzle
      .select()
      .from(books)
      .where(eq(books.isbn, isbn))
      .execute();

    if (existingBook.length > 0) {
      return c.json({ message: 'Conflict: ISBN already exists' }, 409);
    }

    // Insert new book
    const [newBook] = await drizzle
      .insert(books)
      .values({ title, author, isbn, is_available, year })
      .returning();

    return c.json({ message: 'Book created successfully', book: newBook }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ message: 'Internal Server Error' }, 500);
  }
});

book.put('/update/:id', async (c: Context) => {
  try {
    const { title, author, isbn, is_available, year } = await c.req.json();
    const bookId = c.req.param('id');
    const isValid = updateBookSchema.safeParse({
      title,
      author,
      isbn,
      is_available,
      year,
    });
    if (!isValid.success) {
      return c.json(
        { error: isValid.error.message, details: isValid.error.issues },
        422
      );
    }
    const [updatedBook] = await drizzle
      .update(books)
      .set({ title, author, isbn, is_available, year })
      .where(eq(books.id, bookId))
      .returning();
    if (!updatedBook) {
      return c.json({ message: 'Book not found or update failed' }, 404);
    }
    return c.json(
      { message: 'Book updated successfully', book: updatedBook },
      200
    );
  } catch (error) {
    return c.json({ message: 'Internal Server Error' }, 500);
  }
});

book.delete('/delete/:id', async (c: Context) => {
  try {
    const bookId = c.req.param('id');
    const [deletedBook] = await drizzle
      .delete(books)
      .where(eq(books.id, bookId))
      .returning();
    if (!deletedBook) {
      return c.json({ message: 'Book not found or deletion failed' }, 404);
    }
    return c.json({ message: 'Book deleted successfully', book: deletedBook });
  } catch (error) {
    return c.json({ message: 'Internal Server Error' }, 500);
  }
});

book.get('/get/:id', async (c: Context) => {
  try {
    const bookId = c.req.param('id');
    const [book] = await drizzle
      .select()
      .from(books)
      .where(eq(books.id, bookId));
    if (!book) {
      return c.json({ message: 'Book not found' }, 404);
    }
    return c.json({ book }, 200);
  } catch (error) {
    return c.json({ message: 'Internal Server Error' }, 500);
  }
});

book.get('/list', async (c: Context) => {
  try {
    const allBooks = await drizzle.select().from(books);
    return c.json({ books: allBooks });
  } catch (error) {
    return c.json({ message: 'Internal Server Error' }, 500);
  }
});

export default book;
