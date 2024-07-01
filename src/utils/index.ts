export const ENV = process.env.NODE_ENV === 'production';

import cron from 'node-cron';
import drizzle from '~drizzle';
import { borrowedBooks, users, books } from '~drizzle/models';
import { eq, and, lt } from 'drizzle-orm';
import dayjs from 'dayjs';
import { sendEmail } from '~utils/email';

const checkDueDates = async () => {
  const now = dayjs().toDate();
  const allUsers = await drizzle.select().from(users);

  for (const user of allUsers) {
    const overdueBooks = await drizzle
      .select()
      .from(borrowedBooks)
      .where(
        and(
          eq(borrowedBooks.user_id, user.id),
          eq(borrowedBooks.returned, false),
          lt(borrowedBooks.due_date, now)
        )
      );

    if (overdueBooks.length > 0) {
      const bookNamesPromises = overdueBooks.map((borrowedBook) =>
        drizzle
          .select()
          .from(books)
          .where(eq(books.id, borrowedBook.book_id))
          .then((result) => result[0].title)
      );
      const bookNames = await Promise.all(bookNamesPromises);

      const overdueTitles = bookNames.join(', ');

      await sendEmail({
        to: user.email,
        subject: 'Book Return Reminder',
        text: `The due date for the following books you borrowed has passed: ${overdueTitles}. Please return them as soon as possible.`,
      });
    }
  }
};

// Schedule the cron job to run daily at midnight
cron.schedule('0 0 * * *', checkDueDates);

export default checkDueDates;
