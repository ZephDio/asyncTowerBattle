-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "player_board" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "round" INTEGER NOT NULL,
    "board" JSONB NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pulled_at" TIMESTAMP(3),

    CONSTRAINT "player_board_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "player_board_round_pulled_at_idx" ON "player_board"("round", "pulled_at");

