ALTER TABLE "borrowedBooks" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "borrowedBooks" ALTER COLUMN "borrowed_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "borrowedBooks" ALTER COLUMN "due_date" SET DATA TYPE timestamp;