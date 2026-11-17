import { Module } from "@nestjs/common";
import { PullOpponent } from "./applicative/commands/pull-opponent.use-case.js";
import { LegacyBoardStore } from "./applicative/interfaces/legacy-board.store.js";
import { OpponentBoardStore } from "./applicative/interfaces/opponent-board.store.js";
import { InMemoryLegacyBoardStore } from "./infrastructure/in-memory-legacy-board.store.js";
import { InMemoryOpponentBoardStore } from "./infrastructure/in-memory-opponent-board.store.js";
import { OpponentsController } from "./infrastructure/opponents.controller.js";
import { SEED_BOARDS } from "./infrastructure/seed-boards.js";

@Module({
	controllers: [OpponentsController],
	providers: [
		PullOpponent,
		{
			provide: OpponentBoardStore,
			useFactory: () =>
				InMemoryOpponentBoardStore.seeded(SEED_BOARDS.map((board) => ({ board, performance: { wins: 0, losses: 0 } }))),
		},
		{ provide: LegacyBoardStore, useClass: InMemoryLegacyBoardStore },
	],
})
export class OpponentsModule {}
