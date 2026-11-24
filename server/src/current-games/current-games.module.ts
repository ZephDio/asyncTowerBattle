import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module.js";
import { PlayersModule } from "../players/players.module.js";
import { DeleteCurrentGame } from "./applicative/commands/delete-current-game.use-case.js";
import { SaveCurrentGame } from "./applicative/commands/save-current-game.use-case.js";
import { CurrentGameStore } from "./applicative/interfaces/current-game.store.js";
import { GetCurrentGame } from "./applicative/queries/get-current-game.use-case.js";
import { CurrentGamesController } from "./infrastructure/current-games.controller.js";
import { PrismaCurrentGameStore } from "./infrastructure/current-game-store/prisma-current-game.store.js";

@Module({
	imports: [DatabaseModule, PlayersModule],
	controllers: [CurrentGamesController],
	providers: [
		SaveCurrentGame,
		GetCurrentGame,
		DeleteCurrentGame,
		{ provide: CurrentGameStore, useClass: PrismaCurrentGameStore },
	],
})
export class CurrentGamesModule {}
