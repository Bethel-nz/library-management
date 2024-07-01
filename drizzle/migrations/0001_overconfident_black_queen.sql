DO $$ BEGIN
 CREATE TYPE "public"."userRole" AS ENUM('LIBRARIAN', 'STUDENT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
