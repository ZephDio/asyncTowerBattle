-- CreateTable
CREATE TABLE "current_game" (
    "player_id" UUID NOT NULL,
    "game" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "current_game_pkey" PRIMARY KEY ("player_id")
);

-- AddForeignKey
ALTER TABLE "current_game" ADD CONSTRAINT "current_game_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
