import { Module } from "@nestjs/common";
import { GetOpponent } from "./applicative/commands/get-opponent.use-case.js";
import { OpponentBoardStore } from "./applicative/interfaces/opponent-board.store.js";
import { InMemoryOpponentBoardStore } from "./infrastructure/in-memory-opponent-board.store.js";
import { OpponentsController } from "./infrastructure/opponents.controller.js";
import { SEED_BOARDS } from "./infrastructure/seed-boards.js";

@Module({
	controllers: [OpponentsController],
	providers: [
		GetOpponent,
		{ provide: OpponentBoardStore, useFactory: () => InMemoryOpponentBoardStore.seeded(SEED_BOARDS) },
	],
})
export class OpponentsModule {}
