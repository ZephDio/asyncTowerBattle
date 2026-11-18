-- The server gives every row its id (src/shared IdProvider), so the database no longer generates them.
-- AlterTable
ALTER TABLE "player" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "player_board" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "refresh_token" ALTER COLUMN "id" DROP DEFAULT;
