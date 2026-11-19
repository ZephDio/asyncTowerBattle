-- The default boards now live in the server's code (src/opponents/domain/default-boards.ts) and are given when no
-- stored board fits a round, so the seed boards the migration 20261117000001_seed_default_boards inserted go away,
-- consumed or not, with the column that told them apart.
DELETE FROM "player_board" WHERE "bot";

-- AlterTable
ALTER TABLE "player_board" DROP COLUMN "bot";

-- The projection counts the available boards left.
DELETE FROM "round_board_count";
INSERT INTO "round_board_count" ("round", "count")
SELECT "round", count(*) FROM "player_board" WHERE "pulled_at" IS NULL GROUP BY "round";
