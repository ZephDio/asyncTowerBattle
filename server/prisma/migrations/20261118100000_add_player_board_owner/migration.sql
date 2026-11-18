-- AlterTable
ALTER TABLE "player_board" ADD COLUMN     "player_id" UUID,
ADD COLUMN     "pulled_by" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "player_board_pulled_by_key" ON "player_board"("pulled_by");

-- CreateIndex
CREATE INDEX "player_board_player_id_idx" ON "player_board"("player_id");

-- AddForeignKey
ALTER TABLE "player_board" ADD CONSTRAINT "player_board_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_board" ADD CONSTRAINT "player_board_pulled_by_fkey" FOREIGN KEY ("pulled_by") REFERENCES "player_board"("id") ON DELETE SET NULL ON UPDATE CASCADE;
