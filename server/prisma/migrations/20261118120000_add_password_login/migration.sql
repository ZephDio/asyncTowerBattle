-- Players can sign in with their email and password instead of Google. No two players share an email or a name.
-- AlterTable
ALTER TABLE "player" ADD COLUMN     "password_hash" TEXT,
ALTER COLUMN "google_id" DROP NOT NULL;

-- Every player signs in with Google or a password. Prisma does not model check constraints.
ALTER TABLE "player" ADD CONSTRAINT "player_sign_in_check" CHECK ("google_id" IS NOT NULL OR "password_hash" IS NOT NULL);

-- The server now stores emails in lower case.
UPDATE "player" SET "email" = lower("email");

-- CreateIndex
CREATE UNIQUE INDEX "player_email_key" ON "player"("email");

-- CreateIndex
CREATE UNIQUE INDEX "player_name_key" ON "player"("name");
