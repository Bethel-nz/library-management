import { pgEnum } from 'drizzle-orm/pg-core';

const userRole = pgEnum('userRole', ['LIBRARIAN', 'STUDENT']);
export default userRole;
