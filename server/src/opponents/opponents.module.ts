import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module.js";
import { PlayersModule } from "../players/players.module.js";
import { SharedModule } from "../shared/shared.module.js";
import { PullOpponent } from "./applicative/commands/pull-opponent.use-case.js";
import { LegacyBoardStore } from "./applicative/interfaces/legacy-board.store.js";
import { OpponentBoardStore } from "./applicative/interfaces/opponent-board.store.js";
import { OpponentsController } from "./infrastructure/opponents.controller.js";
import { PrismaLegacyBoardStore } from "./infrastructure/prisma-legacy-board.store.js";
import { PrismaOpponentBoardStore } from "./infrastructure/prisma-opponent-board.store.js";

@Module({
	imports: [DatabaseModule, PlayersModule, SharedModule],
	controllers: [OpponentsController],
	providers: [
		PullOpponent,
		{ provide: OpponentBoardStore, useClass: PrismaOpponentBoardStore },
		{ provide: LegacyBoardStore, useClass: PrismaLegacyBoardStore },
	],
})
export class OpponentsModule {}
