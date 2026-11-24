import { Module } from "@nestjs/common";
import { CurrentGamesModule } from "./current-games/current-games.module.js";
import { HealthModule } from "./health/health.module.js";
import { OpponentsModule } from "./opponents/opponents.module.js";
import { PlayersModule } from "./players/players.module.js";

@Module({
	imports: [CurrentGamesModule, HealthModule, OpponentsModule, PlayersModule],
})
export class AppModule {}
