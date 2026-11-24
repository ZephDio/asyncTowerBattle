-- The "first time" steps of a player's journey, one row per player who did one. A missing row means none done yet.
-- CreateTable
CREATE TABLE "player_steps" (
    "player_id" UUID NOT NULL,
    "tutorial_seen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "player_steps_pkey" PRIMARY KEY ("player_id")
);

-- AddForeignKey
ALTER TABLE "player_steps" ADD CONSTRAINT "player_steps_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
