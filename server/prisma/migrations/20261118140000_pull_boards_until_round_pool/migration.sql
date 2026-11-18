-- A board can be pulled by several players before it is consumed, so pulled_by holds every board that pulled it.
-- DropForeignKey
ALTER TABLE "player_board" DROP CONSTRAINT "player_board_pulled_by_fkey";

-- DropIndex
DROP INDEX "player_board_pulled_by_key";

-- AlterTable: keeps the puller of each board already pulled, where Prisma would drop the column and recreate it.
ALTER TABLE "player_board" ALTER COLUMN "pulled_by" DROP DEFAULT,
ALTER COLUMN "pulled_by" TYPE UUID[] USING CASE WHEN "pulled_by" IS NULL THEN ARRAY[]::UUID[] ELSE ARRAY["pulled_by"] END,
ALTER COLUMN "pulled_by" SET DEFAULT ARRAY[]::UUID[];

-- AlterTable
ALTER TABLE "player_board" ADD COLUMN     "bot" BOOLEAN NOT NULL DEFAULT false;

-- The seed boards are the bot boards. The seed migration inserted them in one statement, so they share the oldest
-- created_at, and they have no player.
UPDATE "player_board" SET "bot" = true
WHERE "player_id" IS NULL AND "created_at" = (SELECT min("created_at") FROM "player_board");

-- CreateTable
CREATE TABLE "round_board_count" (
    "round" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "round_board_count_pkey" PRIMARY KEY ("round")
);

INSERT INTO "round_board_count" ("round", "count")
SELECT "round", count(*) FROM "player_board" WHERE "pulled_at" IS NULL GROUP BY "round";
